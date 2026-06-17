import React, { useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import MgFilterFieldCheck from "@/modules/empresas/layout/MgFilterFieldCheck";
import { filterErpFilterListOptions } from "@/shared/filters/erpFilterListOptions";

/**
 * Listagem de dados do filtro — pesquisa + checkboxes.
 * Operador/valor estreitam as opções exibidas antes da seleção.
 */
export default function ErpFilterDataList({
  filterType = "text",
  operator = "",
  value = "",
  valueTo = "",
  listOptions = [],
  selectedValues = [],
  searchQuery = "",
  onSearchQueryChange,
  searchLoading = false,
  onToggleAll,
  onToggleOption,
  searchAriaLabel = "Pesquisar valores",
}) {
  const filteredOptions = useMemo(
    () =>
      filterErpFilterListOptions(listOptions, {
        filterType,
        operator,
        value,
        valueTo,
        searchQuery,
      }),
    [filterType, listOptions, operator, searchQuery, value, valueTo]
  );

  const allVisibleSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => selectedValues.includes(option));

  return (
    <div className="erp-filter-data-list">
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
            aria-label={searchAriaLabel}
            aria-busy={searchLoading}
          />
        </div>
      </div>

      <div className="mg-cards-config-menu__list emp-filter-value-list emp-col-filter-popup__options erp-filter-data-list__options">
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
  );
}
