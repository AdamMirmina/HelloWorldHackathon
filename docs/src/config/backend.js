/**
 * The app's backend handle.
 *
 * Was a Firebase project; is now a self-hosted PocketBase instance. The two
 * exports keep their old names because every call site imports them, and they
 * mean the same things they always did: `app` is the client, `db` is what you
 * hand to a document reference.
 *
 * There is no configuration object here any more. A Firebase web config is a
 * bundle of per-project identifiers that the client needs in order to find the
 * project at all; PocketBase needs one URL, and it lives in ./fb/app.js.
 */
import { initializeApp } from "./fb/app.js";
import { getFirestore } from "./fb/firestore.js";

export const app = initializeApp();
export const db = getFirestore(app);
