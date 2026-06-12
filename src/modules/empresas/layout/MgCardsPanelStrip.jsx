import React from "react";
import { Settings } from "lucide-react";

export default function MgCardsPanelStrip({ onConfigure, disabled = false }) {
  return (
    <div data-template-id="cards-panel" className="mg-cards-panel-strip hidden md:flex">
      <div className="mg-cards-panel-strip__meta">
        <span className="mg-cards-panel-strip__label">Visualização em cards</span>
      </div>
      <div className="mg-cards-panel-strip__actions">
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-ghost tb-btn-labeled mg-cards-panel-strip__config-btn"
          onClick={onConfigure}
          disabled={disabled}
          title="Configurar campos dos cards"
        >
          <Settings className="h-3.5 w-3.5" />
          Configurar cards
        </button>
      </div>
    </div>
  );
}
