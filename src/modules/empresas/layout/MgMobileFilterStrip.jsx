import React from "react";
import { Filter } from "lucide-react";

/** Barra mobile somente filtro — menus ficam no ErpShell. */
export default function MgMobileFilterStrip({ filterOpen, onToggleFilter }) {
  return (
    <div className="mg-mobile-filter-strip md:hidden">
      <button
        type="button"
        className="mg-mobile-filter-btn ios-btn"
        onClick={onToggleFilter}
        aria-pressed={filterOpen}
      >
        <Filter className="h-3.5 w-3.5" />
        <span>Filtrar</span>
      </button>
    </div>
  );
}
