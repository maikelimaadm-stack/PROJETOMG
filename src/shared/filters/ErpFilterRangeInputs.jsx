import React from "react";
import ErpFilterDateRangeInput from "@/shared/filters/ErpFilterDateRangeInput";
import ErpFilterMoneyInput from "@/shared/filters/ErpFilterMoneyInput";

function getRangePlaceholders(filterType) {
  if (filterType === "date") {
    return { from: "Data inicial", to: "Data final" };
  }
  if (filterType === "money") {
    return { from: "Valor inicial", to: "Valor final" };
  }
  return { from: "Valor inicial", to: "Valor final" };
}

/** Dois campos lado a lado para operadores Entre / Não está entre (sem lupa). */
export default function ErpFilterRangeInputs({
  filterType = "text",
  value = "",
  valueTo = "",
  onValueChange,
  onValueToChange,
  disabled = false,
}) {
  const placeholders = getRangePlaceholders(filterType);

  if (filterType === "date") {
    return (
      <div className="erp-filter-range-row erp-filter-range-row--date">
        <ErpFilterDateRangeInput
          value={value}
          valueTo={valueTo}
          onValueChange={onValueChange}
          onValueToChange={onValueToChange}
          disabled={disabled}
        />
      </div>
    );
  }

  if (filterType === "money") {
    return (
      <div className="erp-filter-range-row erp-filter-range-row--inputs">
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

  return (
    <div className="erp-filter-range-row erp-filter-range-row--inputs">
      <input
        type="text"
        inputMode={filterType === "number" ? "decimal" : "text"}
        className="erp-filter-field-input"
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        placeholder={placeholders.from}
        disabled={disabled}
        autoComplete="off"
      />
      <span className="erp-filter-range-sep">até</span>
      <input
        type="text"
        inputMode={filterType === "number" ? "decimal" : "text"}
        className="erp-filter-field-input"
        value={valueTo}
        onChange={(event) => onValueToChange?.(event.target.value)}
        placeholder={placeholders.to}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}
