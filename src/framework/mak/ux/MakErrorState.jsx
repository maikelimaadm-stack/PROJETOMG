import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

/**
 * Estado de erro reutilizável — Tela Mãe MAK.
 */
export default function MakErrorState({
  title = "Não foi possível carregar os dados",
  description = null,
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`mak-error-state flex flex-col items-center justify-center gap-3 p-8 text-center${className ? ` ${className}` : ""}`}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-8 w-8 text-rose-500" strokeWidth={1.75} aria-hidden="true" />
      <p className="mak-error-state__title text-sm font-semibold text-slate-800">{title}</p>
      {description ? (
        <p className="mak-error-state__description max-w-md text-xs text-slate-500">{description}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled mt-1 inline-flex items-center gap-1.5"
          onClick={onRetry}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}
