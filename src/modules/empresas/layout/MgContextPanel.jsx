import React from "react";
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { formatCadastroRecordPosition } from "@/framework/cadastro/toolbars/formatCadastroRecordCount";
import MgRecordFavoriteStar from "@/modules/empresas/layout/MgRecordFavoriteStar";

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
  interactionLocked = false,
  recordId = null,
  isFavorite = false,
  onToggleFavorite,
}) {
  const counter = formatCadastroRecordPosition(currentIndex, total);
  const navDisabled = disabled || interactionLocked;
  const showNavigation = !interactionLocked;

  return (
    <div data-template-id="context-panel" className="mg-context-panel hidden md:flex">
      <div className="mg-context-panel__meta">
        <div className="mg-context-panel__meta-row">
          {recordId ? (
            <MgRecordFavoriteStar
              active={isFavorite}
              onToggle={onToggleFavorite}
              disabled={interactionLocked}
              className="mg-context-panel__fav-btn"
            />
          ) : null}
          <div className="mg-context-panel__swap-slot min-w-0 flex-1">
            <span
              key={`${code || "new"}-${title || ""}`}
              className="mg-motion-swap mg-motion-swap--text mg-context-panel__meta-text"
            >
              {code ? (
                <>
                  <span className="mg-context-panel__code">{code}</span>
                  <span className="mg-context-panel__sep"> • </span>
                </>
              ) : null}
              <span className="mg-context-panel__title">{title || "Novo registro"}</span>
            </span>
          </div>
        </div>
      </div>
      <div className={`mg-context-panel__nav${showNavigation ? " is-visible" : ""}`}>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onFirst} disabled={navDisabled || currentIndex <= 0} title="Primeiro">
          <SkipBack className="h-3 w-3" />
        </button>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onPrevious} disabled={navDisabled || currentIndex <= 0} title="Anterior">
          <ChevronLeft className="h-3 w-3" />
        </button>
        <div className="mg-context-panel__swap-slot mg-context-panel__swap-slot--counter">
          <span key={counter} className="mg-motion-swap mg-motion-swap--text mg-context-panel__counter">
            {counter}
          </span>
        </div>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onNext} disabled={navDisabled || currentIndex >= total - 1} title="Próximo">
          <ChevronRight className="h-3 w-3" />
        </button>
        <button type="button" className="mg-nav-btn ios-btn" onClick={onLast} disabled={navDisabled || currentIndex >= total - 1} title="Último">
          <SkipForward className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
