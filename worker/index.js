/**
 * Study Companion, served from Cloudflare.
 *
 * Two jobs, and neither is optional.
 *
 * 1. Force http to https and send HSTS. Static assets are served BEFORE a
 *    worker runs unless `run_worker_first` is set, and every path here is an
 *    asset - so without that flag the redirect and the header would apply to
 *    nothing at all.
 *
 * 2. Serve the audio from R2. Workers cap a single static asset at 25 MiB and
 *    the lofi track is 45.9 MiB, so it cannot live in the assets directory
 *    (`docs/.assetsignore` keeps it out). R2 has no such cap.
 */

const AUDIO_PREFIX = "/audio/";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cloudflare terminates TLS, so the visitor's original scheme arrives in a
    // header rather than on the URL. Localhost is exempt so `wrangler dev`
    // still works.
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (request.headers.get("cf-visitor") || "").match(/"scheme":"(\w+)"/)?.[1] ||
      url.protocol.replace(":", "");
    if (proto === "http" && url.hostname !== "localhost") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname.startsWith(AUDIO_PREFIX)) return serveAudio(request, env, url);

    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    return out;
  },
};

/**
 * A media file MUST honour Range, and ignoring it fails silently rather than
 * loudly: the player asks for a slice, gets the whole 45.9 MiB back with a 200,
 * and simply never plays or seeks. No error appears on either side.
 */
async function serveAudio(request, env, url) {
  const key = decodeURIComponent(url.pathname.slice(1));
  const wantsRange = request.method !== "HEAD" && request.headers.has("range");

  let obj = null;
  try {
    obj = await env.AUDIO.get(key, wantsRange ? { range: request.headers } : undefined);
  } catch {
    // R2 THROWS on a range past the end rather than returning null, so this
    // would otherwise surface as a 500 on an ordinary unsatisfiable request.
    obj = null;
  }

  const head = await env.AUDIO.head(key).catch(() => null);
  if (!obj) {
    if (head && wantsRange) {
      return new Response(null, {
        status: 416,
        headers: { "content-range": "bytes */" + head.size, "accept-ranges": "bytes" },
      });
    }
    return new Response("Not found", { status: 404 });
  }

  const total = head ? head.size : obj.size;
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  // Set on the FULL response too: a client decides whether to range at all by
  // reading the first 200.
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=86400");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // ONLY answer 206 when a range was actually asked for. Keying this off
  // `obj.range` instead returned 206 to a plain HEAD, because R2 populates that
  // field on a full get too - which is a lie to every client that reads the
  // status to decide whether the server supports ranges at all.
  if (wantsRange && obj.range) {
    const r = obj.range;
    // `range` arrives in whichever shape was asked for: offset+length, a bare
    // offset meaning "to the end", or a suffix. Normalise all three - an
    // off-by-one here is a corrupt file rather than an error, and a missing
    // field produced a literal "bytes NaN-..." on the first attempt.
    let start;
    let end;
    if (typeof r.suffix === "number") {
      start = total - r.suffix;
      end = total - 1;
    } else {
      start = typeof r.offset === "number" ? r.offset : 0;
      end = typeof r.length === "number" ? start + r.length - 1 : total - 1;
    }
    if (Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end >= start && end < total) {
      headers.set("content-range", "bytes " + start + "-" + end + "/" + total);
      headers.set("content-length", String(end - start + 1));
      return new Response(obj.body, { status: 206, headers });
    }
    // The maths did not come out. Serving the whole file is wrong-but-playable;
    // a malformed content-range is neither.
  }

  // Explicit length is what turns a spinner into a real progress bar.
  headers.set("content-length", String(total));
  return new Response(obj.body, { status: 200, headers });
}
