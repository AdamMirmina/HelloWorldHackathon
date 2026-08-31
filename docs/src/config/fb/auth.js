/**
 * The slice of Firebase Auth this app used, over PocketBase.
 *
 * PocketBase persists its own session in localStorage and restores it on load,
 * so the persistence controls below are accepted and do nothing. They are kept
 * because the call sites import them.
 */
import { client } from "./app.js";

const USERS = "users";

/** Firebase exposes `user.uid`; a PocketBase record calls it `id`. */
const asUser = (record) => (record ? { ...record, uid: record.id } : null);

export function getAuth() {
  const pb = client();
  return {
    get currentUser() {
      return asUser(pb.authStore.record);
    },
    signOut: () => signOut(),
  };
}

/**
 * Fires once with the current state, then on every change.
 *
 * The immediate first call matters: PocketBase has already restored any stored
 * session by the time this runs, so waiting only for a change event would leave
 * a signed-in visitor looking at a signed-out page until they did something.
 */
export function onAuthStateChanged(_auth, callback) {
  const pb = client();
  try {
    callback(asUser(pb.authStore.record));
  } catch (err) {
    console.error("auth callback failed", err);
  }
  return pb.authStore.onChange(() => {
    try {
      callback(asUser(pb.authStore.record));
    } catch (err) {
      console.error("auth callback failed", err);
    }
  });
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const pb = client();
  const res = await pb.collection(USERS).authWithPassword(email, password);
  return { user: asUser(res.record) };
}

export async function createUserWithEmailAndPassword(_auth, email, password) {
  const pb = client();
  // The name defaults to the local part so a new profile is never blank in the
  // roster before the person has filled anything in.
  await pb.collection(USERS).create({
    email,
    password,
    passwordConfirm: password,
    name: String(email).split("@")[0],
  });
  const res = await pb.collection(USERS).authWithPassword(email, password);
  return { user: asUser(res.record) };
}

export async function signOut() {
  client().authStore.clear();
}

/**
 * Needs SMTP configured on the PocketBase instance. Without it the request is
 * accepted and no mail is ever sent, which looks identical to a working reset
 * from the visitor's side - so this reports the failure rather than swallowing
 * it.
 */
export async function sendPasswordResetEmail(_auth, email) {
  const pb = client();
  await pb.collection(USERS).requestPasswordReset(email);
}

// Persistence is handled by PocketBase's own store. Accepted, ignored.
export const browserLocalPersistence = "local";
export const browserSessionPersistence = "session";
export const inMemoryPersistence = "none";
export async function setPersistence() {}

/** Sign-up strength check. PocketBase's own minimum is enforced server-side. */
export async function validatePassword(_auth, password) {
  const ok = typeof password === "string" && password.length >= 8;
  return { isValid: ok, meetsMinPasswordLength: ok };
}
