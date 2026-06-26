import React from "react";
import { Columns3Cog } from "lucide-react";
import MgFilterPills from "./MgFilterPills";

export default function MgTablePanelStrip({
  onConfigColumns,
  disabled = false,
  empresas = [],
  filterFields = [],
  filterValues = {},
  appliedFilterValues = {},
  onFilterChange,
  onFilterClear,
  onFilterApply,
  onConfigureFilters = null,
  filterPanelActive = false,
  hasActiveFilters = false,
  onRequestDistinctColumnValues = null,
  selectorOptionsContextFilters = undefined,
  columnFilters = {},
  serverSearchTerm = "",
  selectorOptionsMode = "cascade",
}) {
  return (
    <div data-template-id="table-panel" className="mg-table-panel-strip hidden md:flex">
      <div className="mg-panel-strip__filters">
        <MgFilterPills
          filterFields={filterFields}
          values={filterValues}
          appliedValues={appliedFilterValues}
          empresas={empresas}
          onChange={onFilterChange}
          onClear={onFilterClear}
          onApply={onFilterApply}
          disabled={disabled}
          onConfigureFilters={onConfigureFilters}
          filterPanelActive={filterPanelActive}
          hasActiveFilters={hasActiveFilters}
          onRequestDistinctColumnValues={onRequestDistinctColumnValues}
          selectorOptionsContextFilters={selectorOptionsContextFilters}
          columnFilters={columnFilters}
          serverSearchTerm={serverSearchTerm}
          selectorOptionsMode={selectorOptionsMode}
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
            <Columns3Cog className="mg-table-panel-strip__config-icon" strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </div>
  );
}
