import React, { useCallback, useId, useMemo } from "react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import MgFilterFieldCheck from "@/modules/empresas/layout/MgFilterFieldCheck";
import ErpFilterSortSection from "@/shared/filters/ErpFilterSortSection";
import ErpFilterDateInput from "@/shared/filters/ErpFilterDateInput";
import ErpFilterMoneyInput from "@/shared/filters/ErpFilterMoneyInput";
import {
  ERP_OPERATORS_WITHOUT_VALUE,
  ERP_OPERATORS_WITH_RANGE,
  ERP_OPERATORS_WITH_SINGLE_VALUE,
  getErpFilterOperators,
} from "@/shared/filters/erpFilterOperators";
import { clearErpFilter, cloneErpFilter } from "@/shared/filters/erpFilterState";

const BOOLEAN_OPTIONS = ["Sim", "Não"];

function ErpFilterOperatorSelect({ filterType, operator, onChange, disabled }) {
  const operators = getErpFilterOperators(filterType);
  const selectId = useId();

  return (
    <div className="erp-filter-field">
      <label className="erp-filter-field__label" htmlFor={selectId}>
        Operador
      </label>
      <select
        id={selectId}
        className="erp-filter-operator-select"
        value={operator || ""}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
      >
        <option value="">Selecionar Operador</option>
        {operators.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ErpFilterEnumContent({ options = [], selectedValues = [], onToggle }) {
  if (options.length === 0) {
    return <div className="erp-filter-empty">Nenhuma opção disponível.</div>;
  }

  return (
    <div className="erp-filter-enum-list">
      {options.map((option) => (
        <label key={option} className="mg-cards-config-menu__item erp-filter-enum-item">
          <MgFilterFieldCheck
            checked={selectedValues.includes(option)}
            onChange={(event) => onToggle?.(option, event.target.checked)}
          />
          <span className="mg-cards-config-menu__label truncate" title={option}>
            {option}
          </span>
        </label>
      ))}
    </div>
  );
}

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
  const valueId = useId();
  const valueToId = useId();

  if (ERP_OPERATORS_WITHOUT_VALUE.has(operator)) {
    return null;
  }

  if (filterType === "date") {
    if (ERP_OPERATORS_WITH_RANGE.has(operator)) {
      return (
        <div className="erp-filter-range-row">
          <ErpFilterDateInput
            inputId={valueId}
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
            placeholder="Data Inicial"
            disabled={disabled}
          />
          <span className="erp-filter-range-sep">até</span>
          <ErpFilterDateInput
            inputId={valueToId}
            value={valueTo}
            onChange={(event) => onValueToChange?.(event.target.value)}
            placeholder="Data Final"
            disabled={disabled}
          />
        </div>
      );
    }

    if (ERP_OPERATORS_WITH_SINGLE_VALUE.has(operator)) {
      return (
        <ErpFilterDateInput
          inputId={valueId}
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder="Selecionar Data"
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
            inputId={valueId}
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
            disabled={disabled}
          />
          <span className="erp-filter-range-sep">até</span>
          <ErpFilterMoneyInput
            inputId={valueToId}
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
          inputId={valueId}
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
            id={valueId}
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
            id={valueToId}
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
          id={valueId}
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
        id={valueId}
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
  enumOptions = [],
  showSortSection = false,
  hasActiveFilter = false,
  onSortAsc,
  onSortDesc,
  onClearColumnFilter,
  onDraftChange,
  onCancel,
  onApply,
  onClear,
}) {
  const safeDraft = useMemo(() => cloneErpFilter(draft || { type: filterType }), [draft, filterType]);
  const operator = safeDraft.operator || "";
  const showOperator = filterType !== "enum" && filterType !== "boolean";

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

  const handleToggleEnum = (option, checked) => {
    const current = Array.isArray(safeDraft.values) ? safeDraft.values : [];
    const next = checked
      ? [...new Set([...current, option])]
      : current.filter((item) => item !== option);
    updateDraft({ values: next });
  };

  const handleClear = () => {
    const cleared = clearErpFilter(filterType);
    onDraftChange?.(cleared);
    onClear?.(cleared);
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

        <div className="erp-filter-content">
          {filterType === "enum" ? (
            <ErpFilterEnumContent
              options={enumOptions}
              selectedValues={safeDraft.values || []}
              onToggle={handleToggleEnum}
            />
          ) : null}

          {filterType === "boolean" ? (
            <ErpFilterBooleanContent
              selectedValues={safeDraft.values || []}
              onToggle={handleToggleEnum}
            />
          ) : null}

          {showOperator ? (
            <ErpFilterValueContent
              filterType={filterType}
              operator={operator}
              value={safeDraft.value ?? ""}
              valueTo={safeDraft.valueTo ?? ""}
              onValueChange={(nextValue) => updateDraft({ value: nextValue })}
              onValueToChange={(nextValue) => updateDraft({ valueTo: nextValue })}
            />
          ) : null}
        </div>
      </div>

      <div className="mg-cards-config-menu__footer mg-search-dropdown__config-footer emp-col-filter-popup__footer erp-filter-popover__footer">
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-search-dropdown__config-action"
          onClick={handleClear}
        >
          Limpar
        </button>
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
