import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/** Vite exposes only `VITE_*` vars; trim() avoids Vercel copy/paste whitespace issues. */
function env(name) {
  const v = import.meta.env[name];
  return typeof v === "string" ? v.trim() : v;
}

const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("VITE_FIREBASE_APP_ID"),
  measurementId: env("VITE_FIREBASE_MEASUREMENT_ID"),
};

const { measurementId: _measurementId, ...requiredConfig } = firebaseConfig;

const missing = Object.entries(requiredConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  console.warn(
    "[RAM Roofing] Missing Firebase env vars:",
    missing.join(", "),
    "— copy .env.example to .env and fill values.",
  );
}

// Single app instance across Vite HMR / React StrictMode remounts (avoids Firestore listener bugs).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/** Resolved when Analytics is available (e.g. not in some privacy browsers). */
export const analyticsPromise =
  typeof window !== "undefined" && firebaseConfig.measurementId
    ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
    : Promise.resolve(null);
