import React from "react";
import { GalleryThumbnails } from "lucide-react";

export default function MgCardsPanelStrip({ onConfigure, disabled = false }) {
  return (
    <div data-template-id="cards-panel" className="mg-cards-panel-strip hidden md:flex">
      <div className="mg-cards-panel-strip__actions">
        <button
          type="button"
          className="mg-nav-btn ios-btn tb-btn tb-btn-ghost tb-btn-icon mg-cards-panel-strip__config-btn"
          onClick={onConfigure}
          disabled={disabled}
          title="Configurar campos dos cards"
          aria-label="Configurar campos dos cards"
        >
          <GalleryThumbnails className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
