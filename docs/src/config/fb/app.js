/**
 * The PocketBase client, behind the shape the app already imports.
 *
 * WHY A COMPATIBILITY LAYER RATHER THAN A REWRITE. The app used Firebase across
 * nine files and about 1,800 lines, for one collection keyed by auth uid and
 * email/password sign-in. A PocketBase auth record IS that uid, so the mapping
 * is close to one-to-one, and re-expressing it as three modules with the same
 * exported names means the call sites change only in the PATH they import from.
 * The alternative was 1,800 lines of scattered edits to working hackathon code
 * to reach the same behaviour, with the bugs spread over all of it instead of
 * concentrated in one layer that can be read in a sitting.
 */
import PocketBase from "https://cdn.jsdelivr.net/npm/pocketbase@0.26.2/dist/pocketbase.es.mjs";

export const API_URL = "https://helloworld-api.adammirmina.com";

let pb = null;

/** Firebase's entry point. The config argument is accepted and ignored. */
export function initializeApp() {
  if (!pb) pb = new PocketBase(API_URL);
  return pb;
}

/** The shared client, for the other two modules. */
export function client() {
  return initializeApp();
}

export default initializeApp;
