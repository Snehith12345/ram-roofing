export default function InitialLoadPlaceholder({ label = "Loading…" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-14 sm:py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" aria-hidden />
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}
