import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Loading centralizado — Tela Mãe MAK.
 */
export default function MakLoadingState({
  label = "Carregando...",
  className = "",
}) {
  return (
    <div
      className={`mak-loading-state flex flex-1 flex-col items-center justify-center gap-2 p-8${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-hidden="true" />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
