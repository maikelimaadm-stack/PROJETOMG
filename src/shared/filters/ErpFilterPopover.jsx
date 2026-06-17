import React, { useCallback, useMemo } from "react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import MgFilterFieldCheck from "@/modules/empresas/layout/MgFilterFieldCheck";
import ErpFilterSortSection from "@/shared/filters/ErpFilterSortSection";
import ErpFilterDateInput from "@/shared/filters/ErpFilterDateInput";
import ErpFilterMoneyInput from "@/shared/filters/ErpFilterMoneyInput";
import ErpFilterOperatorSelect from "@/shared/filters/ErpFilterOperatorSelect";
import ErpFilterDataList from "@/shared/filters/ErpFilterDataList";
import { filterErpFilterListOptions } from "@/shared/filters/erpFilterListOptions";
import {
  ERP_OPERATORS_WITHOUT_VALUE,
  ERP_OPERATORS_WITH_RANGE,
  ERP_OPERATORS_WITH_SINGLE_VALUE,
} from "@/shared/filters/erpFilterOperators";
import { cloneErpFilter } from "@/shared/filters/erpFilterState";

const BOOLEAN_OPTIONS = ["Sim", "Não"];

function ErpFilterBooleanContent({ selectedValues = [], onToggle }) {
  return (
    <div className="erp-filter-enum-list">
      {BOOLEAN_OPTIONS.map((option) => (
        <label key={option} className="mg-cards-config-menu__item erp-filter-enum-item">
          <MgFilterFieldCheck
            checked={selectedValues.includes(option)}
            onChange={(event) => onToggle?.(option, event.target.checked)}
          />
          <span className="mg-cards-config-menu__label">{option}</span>
        </label>
      ))}
    </div>
  );
}

function ErpFilterValueContent({
  filterType,
  operator,
  value,
  valueTo,
  onValueChange,
  onValueToChange,
  disabled,
}) {
  if (ERP_OPERATORS_WITHOUT_VALUE.has(operator)) {
    return null;
  }

  if (filterType === "date") {
    if (ERP_OPERATORS_WITH_RANGE.has(operator)) {
      return (
        <div className="erp-filter-range-row">
          <ErpFilterDateInput
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
            disabled={disabled}
          />
          <span className="erp-filter-range-sep">até</span>
          <ErpFilterDateInput
            value={valueTo}
            onChange={(event) => onValueToChange?.(event.target.value)}
            disabled={disabled}
          />
        </div>
      );
    }

    if (ERP_OPERATORS_WITH_SINGLE_VALUE.has(operator)) {
      return (
        <ErpFilterDateInput
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          disabled={disabled}
        />
      );
    }

    return null;
  }

  if (filterType === "money") {
    if (ERP_OPERATORS_WITH_RANGE.has(operator)) {
      return (
        <div className="erp-filter-range-row">
          <ErpFilterMoneyInput
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
            disabled={disabled}
          />
          <span className="erp-filter-range-sep">até</span>
          <ErpFilterMoneyInput
            value={valueTo}
            onChange={(event) => onValueToChange?.(event.target.value)}
            disabled={disabled}
          />
        </div>
      );
    }

    if (ERP_OPERATORS_WITH_SINGLE_VALUE.has(operator)) {
      return (
        <ErpFilterMoneyInput
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          disabled={disabled}
        />
      );
    }

    return null;
  }

  if (filterType === "number") {
    if (ERP_OPERATORS_WITH_RANGE.has(operator)) {
      return (
        <div className="erp-filter-range-row">
          <input
            type="text"
            inputMode="decimal"
            className="erp-filter-field-input"
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
            placeholder="Valor inicial"
            disabled={disabled}
            autoComplete="off"
          />
          <span className="erp-filter-range-sep">até</span>
          <input
            type="text"
            inputMode="decimal"
            className="erp-filter-field-input"
            value={valueTo}
            onChange={(event) => onValueToChange?.(event.target.value)}
            placeholder="Valor final"
            disabled={disabled}
            autoComplete="off"
          />
        </div>
      );
    }

    if (ERP_OPERATORS_WITH_SINGLE_VALUE.has(operator)) {
      return (
        <input
          type="text"
          inputMode="decimal"
          className="erp-filter-field-input"
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder="Digite um valor"
          disabled={disabled}
          autoComplete="off"
        />
      );
    }

    return null;
  }

  if (ERP_OPERATORS_WITH_SINGLE_VALUE.has(operator)) {
    return (
      <input
        type="text"
        className="erp-filter-field-input"
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        placeholder="Digite um valor"
        disabled={disabled}
        autoComplete="off"
      />
    );
  }

  return null;
}

/**
 * Popover global de filtros ERP — mesma UI para colunas de tabela e pills da faixa.
 * Nada é aplicado automaticamente; somente ao clicar em OK.
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
  hasActiveFilter = false,
  onSortAsc,
  onSortDesc,
  onClearColumnFilter,
  onDraftChange,
  onCancel,
  onApply,
}) {
  const safeDraft = useMemo(() => cloneErpFilter(draft || { type: filterType }), [draft, filterType]);
  const operator = safeDraft.operator || "";
  const showOperator = filterType !== "boolean" && filterType !== "enum";
  const dataListOptions =
    listOptions.length > 0 ? listOptions : enumOptions.length > 0 ? enumOptions : [];
  const showDataList = filterType !== "boolean";
  const selectedValues = Array.isArray(safeDraft.values) ? safeDraft.values : [];

  const visibleListOptions = useMemo(
    () =>
      filterErpFilterListOptions(dataListOptions, {
        filterType,
        operator,
        value: safeDraft.value ?? "",
        valueTo: safeDraft.valueTo ?? "",
        searchQuery,
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
    updateDraft({
      operator: nextOperator,
      value: "",
      valueTo: "",
    });
  };

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
          onSortAsc={onSortAsc}
          onSortDesc={onSortDesc}
          onClearColumnFilter={onClearColumnFilter}
        />
      ) : null}

      <div className={`emp-filter-body erp-filter-body${showSortSection ? "" : " erp-filter-body--standalone"}`}>
        {columnLabel && !showSortSection ? (
          <div className="erp-filter-popover__title">{columnLabel}</div>
        ) : null}

        {showOperator ? (
          <ErpFilterOperatorSelect
            filterType={filterType}
            operator={operator}
            onChange={handleOperatorChange}
          />
        ) : null}

        {showOperator && filterType !== "enum" ? (
          <div className="erp-filter-content">
            <ErpFilterValueContent
              filterType={filterType}
              operator={operator}
              value={safeDraft.value ?? ""}
              valueTo={safeDraft.valueTo ?? ""}
              onValueChange={(nextValue) => updateDraft({ value: nextValue })}
              onValueToChange={(nextValue) => updateDraft({ valueTo: nextValue })}
            />
          </div>
        ) : null}

        {filterType === "boolean" ? (
          <ErpFilterBooleanContent
            selectedValues={selectedValues}
            onToggle={handleToggleValue}
          />
        ) : null}

        {showDataList ? (
          <ErpFilterDataList
            filterType={filterType}
            operator={operator}
            value={safeDraft.value ?? ""}
            valueTo={safeDraft.valueTo ?? ""}
            listOptions={dataListOptions}
            selectedValues={selectedValues}
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            searchLoading={searchLoading}
            onToggleAll={handleToggleAll}
            onToggleOption={handleToggleValue}
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
          onClick={() => onApply?.(safeDraft)}
        >
          OK
        </button>
      </div>
    </MgPortalPanel>
  );
}
