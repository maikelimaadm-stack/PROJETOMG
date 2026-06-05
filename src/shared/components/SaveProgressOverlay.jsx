import React from "react";
import { createPortal } from "react-dom";

const VARIANT_STYLES = {
  save: { color: "var(--erp-color-primary)" },
  delete: { color: "var(--erp-state-error)" },
};

const ProgressSpinner = ({ variant = "save" }) => {
  const { color } = VARIANT_STYLES[variant] || VARIANT_STYLES.save;

  return (
    <svg
      className="h-16 w-16 animate-spin"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth="5"
        fill="none"
      />
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke={color}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="110 40"
      />
    </svg>
  );
};

export default function SaveProgressOverlay({
  active = false,
  message = "Salvando registros...",
  variant = "save",
}) {
  if (!active || typeof document === "undefined") return null;

  const textColor =
    variant === "delete" ? "text-[var(--erp-state-error)]" : "text-[var(--erp-color-primary)]";

  return createPortal(
    <div
      className="erp-save-progress-overlay fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--erp-color-surface,#fafafa)]/80 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <ProgressSpinner variant={variant} />
        <p className={`text-center text-sm font-semibold ${textColor}`}>{message}</p>
      </div>
    </div>,
    document.body
  );
}
