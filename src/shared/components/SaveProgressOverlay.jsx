import React from "react";

export default function SaveProgressOverlay({
  active = false,
  message = "Salvando registro...",
  hint = "Aguarde para evitar conflitos de numeração.",
}) {
  if (!active) return null;

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-white/75 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-lg">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#1e3a5f]"
          aria-hidden="true"
        />
        <p className="text-center text-sm font-semibold text-slate-800">{message}</p>
        {hint ? <p className="text-center text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}
