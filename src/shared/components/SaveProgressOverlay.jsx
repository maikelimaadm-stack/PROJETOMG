import React from "react";

const GradientSpinner = () => (
  <svg
    className="h-16 w-16 animate-spin"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="save-progress-gradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2899f5" stopOpacity="1" />
        <stop offset="55%" stopColor="#5eb3f8" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#d6ecfd" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    <circle
      cx="32"
      cy="32"
      r="24"
      stroke="url(#save-progress-gradient)"
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
  if (!active) return null;

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-white/75 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <GradientSpinner />
        <p className="text-center text-sm font-semibold text-[#2899f5]">{message}</p>
      </div>
    </div>
  );
}
