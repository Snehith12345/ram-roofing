import { useEffect } from "react";
import Button from "./Button.jsx";

export default function Modal({ title, children, onClose, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-gray-600/50 p-4 print:hidden"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className={`relative my-6 w-full rounded-lg border border-gray-200 bg-white shadow-xl sm:my-10 ${wide ? "max-w-4xl" : "max-w-lg"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <Button type="button" variant="ghost" className="!p-2 min-h-0 text-2xl leading-none" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
        {footer ? <div className="border-t border-gray-200 px-4 py-3 sm:px-5">{footer}</div> : null}
      </div>
    </div>
  );
}
