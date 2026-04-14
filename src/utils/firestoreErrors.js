/**
 * Human-readable copy for common Firestore client errors.
 * @param {unknown} err
 * @returns {string}
 */
export function mapFirestoreError(err) {
  const code = err?.code ?? err?.cause?.code;
  const msg = err?.message ?? String(err);

  if (code === "permission-denied" || /insufficient permissions/i.test(msg)) {
    return (
      "Firestore blocked this (permission-denied). Fix: open Firebase Console → your project → Firestore Database → Rules, " +
      "paste the rules from the firestore.rules file in this project (allow read/write when signed in), click Publish. " +
      "You must be logged into the app. If it still fails, in Console → App Check, turn off Firestore enforcement for testing."
    );
  }

  if (code === "unauthenticated") {
    return "Not authenticated. Sign in again.";
  }

  if (code === "failed-precondition" && /index/i.test(msg)) {
    return msg;
  }

  return msg || "Firestore request failed.";
}
