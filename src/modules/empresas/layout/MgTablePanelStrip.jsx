import React from "react";
import { Settings2 } from "lucide-react";
import MgFilterPills from "@/modules/empresas/layout/MgFilterPills";

export default function MgTablePanelStrip({
  onConfigColumns,
  disabled = false,
  filterValues = {},
  appliedFilterValues = {},
  onFilterChange,
  onFilterClear,
  onFilterApply,
  onRequestDistinctValues,
}) {
  return (
    <div data-template-id="table-panel" className="mg-table-panel-strip hidden md:flex">
      <div className="mg-panel-strip__filters">
        <MgFilterPills
          values={filterValues}
          appliedValues={appliedFilterValues}
          onChange={onFilterChange}
          onClear={onFilterClear}
          onApply={onFilterApply}
          onRequestDistinctValues={onRequestDistinctValues}
          disabled={disabled}
        />
      </div>
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
