import React from "react";
import { Filter } from "lucide-react";

/** Barra mobile somente filtro — sem duplicar menu/título do ErpShell. */
export default function MgMobileFilterStrip({ onToggleFilter, filterOpen = false }) {
  return (
    <div className="mg-mobile-filter-strip md:hidden">
      <button
        type="button"
        className="ios-btn mg-mobile-filter-btn"
        onClick={onToggleFilter}
        aria-label="Filtros"
        aria-pressed={filterOpen}
      >
        <Filter className="h-4 w-4" />
        <span>Filtrar</span>
      </button>
    </div>
  );
}
