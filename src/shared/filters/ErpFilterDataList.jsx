import React, { useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import MgFilterFieldCheck from "@/modules/empresas/layout/MgFilterFieldCheck";
import ErpFilterRangeInputs from "@/shared/filters/ErpFilterRangeInputs";
import ErpFilterSingleDateInput from "@/shared/filters/ErpFilterSingleDateInput";
import { filterErpFilterListOptions } from "@/shared/filters/erpFilterListOptions";
import {
  ERP_DATE_OPERATORS_WITH_SINGLE_DATE,
  ERP_OPERATORS_WITHOUT_VALUE,
  ERP_OPERATORS_WITH_RANGE,
} from "@/shared/filters/erpFilterOperators";

/**
 * Listagem de dados do filtro — pesquisa ou intervalo + checkboxes.
 * Operador + pesquisa/intervalo estreitam as opções exibidas antes da seleção.
 */
export default function ErpFilterDataList({
  filterType = "text",
  operator = "",
  rangeValue = "",
  rangeValueTo = "",
  onRangeValueChange,
  onRangeValueToChange,
  listOptions = [],
  selectedValues = [],
  searchQuery = "",
  onSearchQueryChange,
  searchLoading = false,
  onToggleAll,
  onToggleOption,
  searchAriaLabel = "Pesquisar valores",
}) {
  const isRangeOperator = ERP_OPERATORS_WITH_RANGE.has(operator);
  const isDateSingleOperator =
    filterType === "date" && ERP_DATE_OPERATORS_WITH_SINGLE_DATE.has(operator);
  const isWithoutValueOperator = ERP_OPERATORS_WITHOUT_VALUE.has(operator);
  const showSearchField = !isRangeOperator && !isDateSingleOperator && !isWithoutValueOperator;

  const filteredOptions = useMemo(
    () =>
      filterErpFilterListOptions(listOptions, {
        filterType,
        operator,
        searchQuery: showSearchField ? searchQuery : "",
        rangeValue,
        rangeValueTo,
      }),
    [filterType, listOptions, operator, rangeValue, rangeValueTo, searchQuery, showSearchField]
  );

  const allVisibleSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => selectedValues.includes(option));

  return (
    <div className="erp-filter-data-list">
      {isRangeOperator ? (
        <ErpFilterRangeInputs
          filterType={filterType}
          value={rangeValue}
          valueTo={rangeValueTo}
          onValueChange={onRangeValueChange}
          onValueToChange={onRangeValueToChange}
        />
      ) : isDateSingleOperator ? (
        <ErpFilterSingleDateInput
          value={rangeValue}
          onValueChange={onRangeValueChange}
          placeholder="Data"
        />
      ) : showSearchField ? (
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
      ) : null}

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
