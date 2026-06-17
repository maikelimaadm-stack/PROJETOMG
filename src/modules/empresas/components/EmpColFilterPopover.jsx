import React from "react";
import { ArrowDown, ArrowUp, Loader2, Search, X } from "lucide-react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import MgFilterFieldCheck from "@/modules/empresas/layout/MgFilterFieldCheck";

export default function EmpColFilterPopover({
  open,
  panelRef,
  style,
  columnLabel = "",
  showSortSection = false,
  hasActiveFilter = false,
  onSortAsc,
  onSortDesc,
  onClearColumnFilter,
  searchQuery = "",
  onSearchQueryChange,
  searchLoading = false,
  filteredOptions = [],
  selectedValues = [],
  allVisibleSelected = false,
  onToggleAll,
  onToggleOption,
  onCancel,
  onApply,
  searchAriaLabel,
}) {
  return (
    <MgPortalPanel
      open={open}
      panelRef={panelRef}
      panelClassName="dropdown-menu mg-cards-config-menu open emp-col-filter-popup emp-filter-popover"
      style={style}
      onClick={(event) => event.stopPropagation()}
    >
      {showSortSection ? (
        <div className="emp-filter-sort-section">
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
      ) : null}

      <div className="emp-filter-body">
        <div className="mg-search-pill-wrap emp-col-filter-popup__search">
          <div className="mg-search-pill emp-col-filter-popup__search-pill" role="search">
            {searchLoading ? (
              <Loader2
                className="mg-search-pill-icon mg-search-pill-icon--loading h-3.5 w-3.5 shrink-0 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Search className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange?.(event.target.value)}
              placeholder="Pesquisar..."
              aria-label={searchAriaLabel || `Pesquisar valores de ${columnLabel}`}
              aria-busy={searchLoading}
            />
          </div>
        </div>

        <div className="mg-cards-config-menu__list emp-filter-value-list emp-col-filter-popup__options">
          <label className="mg-cards-config-menu__item emp-filter-value-list-header">
            <MgFilterFieldCheck
              checked={allVisibleSelected}
              disabled={filteredOptions.length === 0}
              onChange={onToggleAll}
            />
            <span className="mg-cards-config-menu__label">(Selecionar Tudo)</span>
          </label>
          {filteredOptions.map((option) => (
            <label key={option} className="mg-cards-config-menu__item emp-filter-value-list-item">
              <MgFilterFieldCheck
                checked={selectedValues.includes(option)}
                onChange={(event) => onToggleOption?.(option, event.target.checked)}
              />
              <span className="mg-cards-config-menu__label truncate" title={option}>
                {option}
              </span>
            </label>
          ))}
          {filteredOptions.length === 0 && !searchLoading ? (
            <div className="mg-search-dropdown__empty">Nenhum valor encontrado.</div>
          ) : null}
        </div>
      </div>

      <div className="mg-cards-config-menu__footer mg-search-dropdown__config-footer emp-col-filter-popup__footer">
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-search-dropdown__config-action"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-green mg-search-dropdown__config-action"
          onClick={onApply}
        >
          Filtrar
        </button>
      </div>
    </MgPortalPanel>
  );
}
