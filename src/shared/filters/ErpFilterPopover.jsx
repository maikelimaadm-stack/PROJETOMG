import React, { useCallback, useMemo } from "react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import ErpFilterSortSection from "@/shared/filters/ErpFilterSortSection";
import ErpFilterOperatorSelect from "@/shared/filters/ErpFilterOperatorSelect";
import ErpFilterDataList from "@/shared/filters/ErpFilterDataList";
import { filterErpFilterListOptions } from "@/shared/filters/erpFilterListOptions";
import {
  ERP_DATE_OPERATORS_WITH_SINGLE_DATE,
  ERP_OPERATORS_WITH_RANGE,
  normalizeErpFilterOperator,
} from "@/shared/filters/erpFilterOperators";
import { cloneErpFilter } from "@/shared/filters/erpFilterState";

/**
 * Popover global de filtros ERP — mesma UI para colunas de tabela e pills da faixa.
 * Operador + Pesquisar filtram a listagem; seleção só aplica ao clicar OK.
 */
export default function ErpFilterPopover({
  open,
  panelRef,
  style,
  columnLabel = "",
  filterType = "text",
  draft,
  listOptions = [],
  enumOptions = [],
  searchQuery = "",
  onSearchQueryChange,
  searchLoading = false,
  showSortSection = false,
  showSortActions = true,
  hasActiveFilter = false,
  onSortAsc,
  onSortDesc,
  onClearColumnFilter,
  onDraftChange,
  onCancel,
  onApply,
  hasMoreOptions = false,
  loadingMoreOptions = false,
  onLoadMoreOptions,
}) {
  const safeDraft = useMemo(() => cloneErpFilter(draft || { type: filterType }), [draft, filterType]);
  const isBoolean = filterType === "boolean";
  const operator = isBoolean
    ? (Array.isArray(safeDraft.values) && safeDraft.values.length === 1 ? safeDraft.values[0] : "")
    : normalizeErpFilterOperator(safeDraft.operator, filterType);
  const showOperator = filterType !== "enum";
  const dataListOptions =
    listOptions.length > 0 ? listOptions : enumOptions.length > 0 ? enumOptions : [];
  const showDataList = !isBoolean;
  const selectedValues = Array.isArray(safeDraft.values) ? safeDraft.values : [];

  const visibleListOptions = useMemo(
    () =>
      filterErpFilterListOptions(dataListOptions, {
        filterType,
        operator,
        searchQuery,
        rangeValue: safeDraft.value ?? "",
        rangeValueTo: safeDraft.valueTo ?? "",
      }),
    [dataListOptions, filterType, operator, safeDraft.value, safeDraft.valueTo, searchQuery]
  );

  const updateDraft = useCallback(
    (patch) => {
      onDraftChange?.({
        ...safeDraft,
        type: filterType,
        ...patch,
      });
    },
    [filterType, onDraftChange, safeDraft]
  );

  const handleOperatorChange = (nextOperator) => {
    if (isBoolean) {
      updateDraft({ values: nextOperator ? [nextOperator] : [] });
      return;
    }
    const normalized = normalizeErpFilterOperator(nextOperator, filterType);
    updateDraft({
      operator: normalized,
      value: "",
      valueTo: "",
    });
    if (onSearchQueryChange) onSearchQueryChange("");
  };

  const isRangeOperator = ERP_OPERATORS_WITH_RANGE.has(operator);
  const isDateSingleOperator =
    filterType === "date" && ERP_DATE_OPERATORS_WITH_SINGLE_DATE.has(operator);

  const handleToggleValue = (option, checked) => {
    const current = Array.isArray(safeDraft.values) ? safeDraft.values : [];
    const next = checked
      ? [...new Set([...current, option])]
      : current.filter((item) => item !== option);
    updateDraft({ values: next });
  };

  const handleToggleAll = (event) => {
    const current = Array.isArray(safeDraft.values) ? safeDraft.values : [];
    if (event.target.checked) {
      updateDraft({ values: [...new Set([...current, ...visibleListOptions])] });
      return;
    }
    updateDraft({ values: current.filter((item) => !visibleListOptions.includes(item)) });
  };

  const handleApply = () => {
    onApply?.({
      ...safeDraft,
      type: filterType,
      operator: isBoolean ? "" : operator,
      value: isRangeOperator || isDateSingleOperator ? (safeDraft.value ?? "") : "",
      valueTo: isRangeOperator ? (safeDraft.valueTo ?? "") : "",
      values: [...selectedValues],
    });
  };

  return (
    <MgPortalPanel
      open={open}
      panelRef={panelRef}
      panelClassName="dropdown-menu mg-cards-config-menu open emp-col-filter-popup emp-filter-popover erp-filter-popover"
      style={style}
      onClick={(event) => event.stopPropagation()}
    >
      {showSortSection ? (
        <ErpFilterSortSection
          columnLabel={columnLabel}
          hasActiveFilter={hasActiveFilter}
          showSortActions={showSortActions}
          onSortAsc={onSortAsc}
          onSortDesc={onSortDesc}
          onClearColumnFilter={onClearColumnFilter}
        />
      ) : null}

      <div className={`emp-filter-body erp-filter-body${showSortSection ? "" : " erp-filter-body--standalone"}`}>
        {showOperator ? (
          <ErpFilterOperatorSelect
            filterType={filterType}
            operator={operator}
            onChange={handleOperatorChange}
          />
        ) : null}

        {showDataList ? (
          <ErpFilterDataList
            filterType={filterType}
            operator={operator}
            rangeValue={safeDraft.value ?? ""}
            rangeValueTo={safeDraft.valueTo ?? ""}
            onRangeValueChange={(nextValue) => updateDraft({ value: nextValue })}
            onRangeValueToChange={(nextValue) => updateDraft({ valueTo: nextValue })}
            listOptions={dataListOptions}
            selectedValues={selectedValues}
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            searchLoading={searchLoading}
            onToggleAll={handleToggleAll}
            onToggleOption={handleToggleValue}
            hasMoreOptions={hasMoreOptions}
            loadingMoreOptions={loadingMoreOptions}
            onLoadMoreOptions={onLoadMoreOptions}
            searchAriaLabel={
              columnLabel ? `Pesquisar valores de ${columnLabel}` : "Pesquisar valores"
            }
          />
        ) : null}
      </div>

      <div className="mg-cards-config-menu__footer mg-search-dropdown__config-footer emp-col-filter-popup__footer erp-filter-popover__footer">
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
          onClick={handleApply}
        >
          OK
        </button>
      </div>
    </MgPortalPanel>
  );
}
