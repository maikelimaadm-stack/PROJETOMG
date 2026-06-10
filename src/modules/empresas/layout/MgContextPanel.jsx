import React from "react";
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { formatCadastroRecordPosition } from "@/framework/cadastro/toolbars/formatCadastroRecordCount";

export default function MgContextPanel({
  code,
  title,
  total = 0,
  currentIndex = 0,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  disabled = false,
}) {
  const counter = formatCadastroRecordPosition(currentIndex, total);

  return (
    <div data-template-id="context-panel" className="mg-context-panel hidden md:flex">
      <div style={{ fontSize: 12, color: "var(--text-1)" }}>
        {code ? (
          <>
            <span style={{ fontWeight: 600 }}>{code}</span>
            <span style={{ color: "var(--text-3)" }}> • </span>
          </>
        ) : null}
        <span>{title || "Novo registro"}</span>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className="mg-nav-btn ios-btn" onClick={onFirst} disabled={disabled || currentIndex <= 0} title="Primeiro">
          <SkipBack className="h-3 w-3" />
        </button>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onPrevious} disabled={disabled || currentIndex <= 0} title="Anterior">
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500, minWidth: 50, textAlign: "center" }}>
          {counter}
        </span>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onNext} disabled={disabled || currentIndex >= total - 1} title="Próximo">
          <ChevronRight className="h-3 w-3" />
        </button>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onLast} disabled={disabled || currentIndex >= total - 1} title="Último">
          <SkipForward className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
