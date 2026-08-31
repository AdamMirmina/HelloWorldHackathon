/**
 * The slice of the Firestore API this app actually used, over PocketBase.
 *
 * The whole data model was one `users` document per person, keyed by auth uid.
 * A PocketBase auth record already is that, so a document reference is just a
 * record id and the document body is the record's own fields.
 */
import { client } from "./app.js";

/** Firebase's handle. PocketBase needs no equivalent, so this is the client. */
export function getFirestore() {
  return client();
}

export function doc(_db, collectionName, id) {
  return { __ref: true, collection: collectionName, id };
}

export function collection(_db, name) {
  return { __coll: true, collection: name };
}

/**
 * A filter clause. Values go through pb.filter rather than string concatenation
 * so a school name containing a quote cannot alter the query.
 */
export function where(field, op, value) {
  const operator = op === "==" ? "=" : op;
  return { field, operator, value };
}

export function query(coll, ...clauses) {
  return { ...coll, clauses };
}

/**
 * `uid` is written into the document by the app and is redundant here, because
 * the record id IS the uid. It is stripped on the way in so PocketBase is not
 * handed a field the collection does not have, and added back on the way out so
 * reads that expect it still work.
 */
const stripUid = (data) => {
  const out = { ...data };
  delete out.uid;
  return out;
};
const withUid = (record) => ({ ...record, uid: record.id });

export async function getDoc(ref) {
  const pb = client();
  try {
    const record = await pb.collection(ref.collection).getOne(ref.id);
    return { id: record.id, exists: () => true, data: () => withUid(record) };
  } catch (err) {
    // A missing record is a 404 and is an ordinary answer, not a failure. Any
    // other status is a real error and must not be flattened into "no such
    // document" - that is how a broken read becomes an empty screen.
    if (err && err.status === 404) {
      if (pb.authStore.record && pb.authStore.record.id === ref.id) pb.authStore.clear();
      return { id: ref.id, exists: () => false, data: () => undefined };
    }
    throw err;
  }
}

export async function setDoc(ref, data, _options) {
  const pb = client();
  // PocketBase's update() already merges the fields it is given, so a merge
  // write and a plain write differ only in what the caller passed - there is
  // nothing for the merge option to change here.
  //
  // There is deliberately no create-if-missing branch. Every record in this
  // collection is an auth record made at sign-up, so a 404 does not mean "new
  // document", it means the caller is holding an id for a user that does not
  // exist. Creating one would need an email and a password that this function
  // has not got, so it says so instead of inventing a half-record.
  try {
    await pb.collection(ref.collection).update(ref.id, stripUid(data));
  } catch (err) {
    if (err && err.status === 404) {
      // A 404 on your OWN record means the session has outlived the account -
      // the record was deleted while a token for it was still in localStorage.
      // Left alone that is a dead page: every write throws and the visitor is
      // shown a broken profile while the app still believes they are signed in.
      // Clearing the store makes it what it actually is, a signed-out visitor,
      // and the auth listeners route them to sign-in on their own.
      if (pb.authStore.record && pb.authStore.record.id === ref.id) {
        pb.authStore.clear();
        throw new Error("Your session was for an account that no longer exists. Please sign in again.");
      }
      throw new Error("No user record " + ref.id + " to write to. Sign-in creates it; this cannot.");
    }
    throw err;
  }
}

export async function updateDoc(ref, data) {
  const pb = client();
  await pb.collection(ref.collection).update(ref.id, stripUid(data));
}

export async function getDocs(q) {
  const pb = client();
  let filter = "";
  if (q.clauses && q.clauses.length) {
    const parts = [];
    for (const c of q.clauses) parts.push(pb.filter(c.field + " " + c.operator + " {:v}", { v: c.value }));
    filter = parts.join(" && ");
  }
  const records = await pb.collection(q.collection).getFullList({ filter, sort: "-updated" });
  const docs = records.map((r) => ({ id: r.id, exists: () => true, data: () => withUid(r) }));
  return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn) => docs.forEach(fn) };
}
