/**
 * Shape the PocketBase `users` collection for Study Companion.
 *
 * Idempotent: every field is looked up by name before being added, so re-running
 * this changes nothing. That matters more than it sounds - a migration that can
 * only be run once is one nobody dares run again to check what it did.
 *
 * Reads credentials from a gitignored .env. This repository is PUBLIC, so no
 * credential may ever appear in a file that is tracked.
 */
import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trimStart().startsWith("#")) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const API = env.PB_URL;
const auth = await fetch(API + "/api/collections/_superusers/auth-with-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identity: env.PB_SUPERUSER_EMAIL, password: env.PB_SUPERUSER_PASSWORD }),
});
if (!auth.ok) { console.error("auth failed:", auth.status, (await auth.text()).slice(0, 200)); process.exit(1); }
const token = (await auth.json()).token;
const H = { "Content-Type": "application/json", Authorization: token };

const res = await fetch(API + "/api/collections/users", { headers: H });
if (!res.ok) { console.error("read users collection failed:", res.status); process.exit(1); }
const users = await res.json();

/**
 * One record per person, exactly as the Firestore `users` document was - the
 * app keyed it by auth uid, which is what a PocketBase auth record already is,
 * so the whole document collapses into fields on the user.
 */
const wanted = [
  { name: "name", type: "text", max: 120 },
  { name: "school", type: "text", max: 120 },
  // An array of {subject, ...} objects, so it stays JSON rather than being
  // flattened into text that code would then have to grep.
  { name: "classes", type: "json", maxSize: 20000 },
  { name: "studyStyle", type: "text", max: 60 },
  { name: "timePreference", type: "text", max: 60 },
  { name: "description", type: "text", max: 2000 },
  // Named so that FALSE is the safe default. A PocketBase bool has no unset
  // state: it is false for every existing row the moment the field is added and
  // false for every row created afterwards. A field called `public` would
  // therefore default to "not listed", which is the wanted default here - but
  // `allowDMs` and `emailPublic` are named the same way on purpose, so nobody
  // is opted in to anything by the mere act of the column appearing.
  { name: "public", type: "bool" },
  { name: "allowDMs", type: "bool" },
  { name: "emailPublic", type: "bool" },
];

const have = new Set((users.fields || []).map((f) => f.name));
const added = [];
for (const f of wanted) if (!have.has(f.name)) { users.fields.push(f); added.push(f.name); }

/**
 * Rules. Single-condition checks only, which is what makes them leak-safe:
 * there is no cross-row traversal here for a mismatched pair of conditions to
 * satisfy separately.
 */
users.listRule = '@request.auth.id != "" && (public = true || id = @request.auth.id)';
users.viewRule = '@request.auth.id != "" && (public = true || id = @request.auth.id)';
// Empty string means anyone may sign up. `null` would mean superuser-only, which
// silently disables registration - the failure looks like a broken sign-up form.
users.createRule = "";
users.updateRule = "id = @request.auth.id";
users.deleteRule = "id = @request.auth.id";

const patch = await fetch(API + "/api/collections/users", { method: "PATCH", headers: H, body: JSON.stringify(users) });
if (!patch.ok) { console.error("patch failed:", patch.status, (await patch.text()).slice(0, 500)); process.exit(1); }

const after = await (await fetch(API + "/api/collections/users", { headers: H })).json();
console.log("fields added:", added.length ? added.join(", ") : "(none - already present)");
console.log("fields now  :", after.fields.map((f) => f.name).join(", "));
console.log("list rule   :", after.listRule);
console.log("update rule :", after.updateRule);
console.log("create rule :", JSON.stringify(after.createRule));
