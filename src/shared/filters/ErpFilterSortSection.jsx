import React from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";

export default function ErpFilterSortSection({
  columnLabel = "",
  hasActiveFilter = false,
  onSortAsc,
  onSortDesc,
  onClearColumnFilter,
}) {
  return (
    <div className="emp-filter-sort-section erp-filter-sort-section">
      <div className="px-1 text-[11px] font-semibold text-slate-500">{columnLabel}</div>
      <button type="button" className="emp-filter-sort-btn" onClick={onSortAsc}>
        <ArrowUp className="w-4 h-4 mr-2 shrink-0" />
        <span>Ordenar A → Z</span>
      </button>
      <button type="button" className="emp-filter-sort-btn" onClick={onSortDesc}>
        <ArrowDown className="w-4 h-4 mr-2 shrink-0" />
        <span>Ordenar Z → A</span>
      </button>
      <button
        type="button"
        className="emp-filter-sort-btn"
        disabled={!hasActiveFilter}
        onClick={onClearColumnFilter}
      >
        <X className="w-4 h-4 mr-2 shrink-0" />
        <span className="truncate">Limpar Filtro de &apos;{columnLabel}&apos;</span>
      </button>
    </div>
  );
}
