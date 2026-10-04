import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "./config.js";

let app = null;
let auth = null;
let db = null;

try {
  app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  auth.useDeviceLanguage();
  db = getFirestore(app);
} catch (err) {
  console.warn("Firebase could not start", err);
}

export { app, auth, db };
export const firebaseReady = Boolean(auth && db);
