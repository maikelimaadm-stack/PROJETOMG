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
  const metaKey = `${code || "new"}-${title || ""}-${currentIndex}-${total}`;

  return (
    <div data-template-id="context-panel" className="mg-context-panel hidden md:flex">
      <div className="mg-context-panel__meta">
        <span key={metaKey} className="mg-motion-swap mg-motion-swap--text mg-context-panel__meta-text">
          {code ? (
            <>
              <span className="mg-context-panel__code">{code}</span>
              <span className="mg-context-panel__sep"> • </span>
            </>
          ) : null}
          <span>{title || "Novo registro"}</span>
        </span>
      </div>
      <div className="mg-context-panel__nav flex items-center gap-1">
        <button type="button" className="mg-nav-btn ios-btn" onClick={onFirst} disabled={disabled || currentIndex <= 0} title="Primeiro">
          <SkipBack className="h-3 w-3" />
        </button>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onPrevious} disabled={disabled || currentIndex <= 0} title="Anterior">
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span key={counter} className="mg-motion-swap mg-motion-swap--text mg-context-panel__counter">
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
