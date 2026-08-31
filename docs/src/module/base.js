/**
 * Where the site is mounted, derived from the URL rather than guessed.
 *
 * This used to guess from the hostname: anything that was not localhost was
 * assumed to be GitHub Pages and got a hard-coded "/HelloWorldHackathon"
 * prefix. That held exactly as long as Pages served the site from that
 * subdirectory. The moment it moved to its own domain, every nav link pointed
 * at a directory that does not exist and every page but the homepage 404'd -
 * while the homepage itself answered 200, so a check that only fetched "/"
 * saw nothing wrong.
 *
 * Reading the prefix off the current path instead works on all of them at
 * once: a domain root, a project subdirectory, and Live Server pointed at
 * either the repo root or docs/. Nothing to change if it moves again.
 *
 * It lived in two files as two copies before this, which is why the fix had to
 * be made twice.
 */
export function resolveBasePrefix() {
  const { pathname } = window.location;
  for (const segment of ["/HelloWorldHackathon/", "/docs/"]) {
    if (pathname.startsWith(segment)) return segment.slice(0, -1);
  }
  return "";
}
