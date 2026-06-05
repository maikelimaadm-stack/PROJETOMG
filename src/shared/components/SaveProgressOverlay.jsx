import React from "react";
import { createPortal } from "react-dom";

const GradientSpinner = () => (
  <svg
    className="h-16 w-16 animate-spin"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="erp-save-progress-gradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--erp-color-primary)" stopOpacity="1" />
        <stop offset="55%" stopColor="var(--erp-color-primary-hover)" stopOpacity="0.65" />
        <stop offset="100%" stopColor="var(--erp-color-primary)" stopOpacity="0.12" />
      </linearGradient>
    </defs>
    <circle
      cx="32"
      cy="32"
      r="24"
      stroke="url(#erp-save-progress-gradient)"
      strokeWidth="5"
      strokeLinecap="round"
      strokeDasharray="110 40"
    />
  </svg>
);

export default function SaveProgressOverlay({
  active = false,
  message = "Salvando registros...",
}) {
  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="erp-save-progress-overlay fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--erp-color-surface,#fafafa)]/80 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <GradientSpinner />
        <p className="text-center text-sm font-semibold text-[var(--erp-color-primary)]">{message}</p>
      </div>
    </div>,
    document.body
  );
}
