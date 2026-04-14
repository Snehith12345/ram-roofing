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
  apiKey: "AIzaSyDDk8c6y714TdtCDH0JxsV-qFsqHPFKrHE",
  authDomain: "ram-roofing-47aad.firebaseapp.com",
  databaseURL: "https://ram-roofing-47aad-default-rtdb.firebaseio.com",
  projectId: "ram-roofing-47aad",
  storageBucket: "ram-roofing-47aad.firebasestorage.app",
  messagingSenderId: "993585562932",
  appId: "1:993585562932:web:4f15c602b89e4280b65161",
  measurementId: "G-5CYJ0J1EP2"
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
