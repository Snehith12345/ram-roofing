import { getDocs } from "firebase/firestore";
import { auth } from "../firebase/config.js";
import { mapFirestoreError } from "../utils/firestoreErrors.js";

const DEFAULT_MS = 3500;

/**
 * Polls a collection with getDocs (no persistent watch stream).
 * Avoids Firestore SDK "INTERNAL ASSERTION" races from onSnapshot + React StrictMode / fast unmounts.
 */
export function pollCollection(queryOrCollection, onData, onError, options = {}) {
  const intervalMs = options.intervalMs ?? DEFAULT_MS;
  let stopped = false;
  let timer = null;

  async function tick() {
    if (stopped) return;
    if (!auth.currentUser) {
      return;
    }
    try {
      const snap = await getDocs(queryOrCollection);
      if (stopped) return;
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(rows);
    } catch (e) {
      if (!stopped) {
        onError?.(new Error(mapFirestoreError(e), { cause: e }));
      }
    }
  }

  function onVisible() {
    if (!document.hidden) tick();
  }

  tick();
  timer = setInterval(tick, intervalMs);
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    stopped = true;
    if (timer) clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
