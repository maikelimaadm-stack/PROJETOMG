import React from "react";
import { Settings2 } from "lucide-react";

export default function MgTablePanelStrip({
  onConfigColumns,
  disabled = false,
}) {
  return (
    <div data-template-id="table-panel" className="mg-table-panel-strip hidden md:flex">
      <div className="mg-table-panel-strip__actions">
        <div className="mg-table-panel-strip__action">
          <button
            type="button"
            className="mg-nav-btn ios-btn mg-table-panel-strip__config-btn"
            onClick={onConfigColumns}
            disabled={disabled || !onConfigColumns}
            title="Configurar colunas da tabela"
            aria-label="Configurar colunas da tabela"
          >
            <Settings2 className="mg-table-panel-strip__config-icon" strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </div>
  );
}
