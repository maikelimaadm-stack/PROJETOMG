import React, { useCallback } from "react";
import { parseNumberFilterValue } from "@/shared/filters/erpFilterEvaluate";

function formatMoneyDisplay(value) {
  const num = parseNumberFilterValue(value);
  if (!Number.isFinite(num)) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Campo monetário compacto para filtros ERP. */
export default function ErpFilterMoneyInput({
  value = "",
  onChange,
  placeholder = "0,00",
  inputId,
  disabled = false,
}) {
  const displayValue = formatMoneyDisplay(value);

  const handleChange = useCallback(
    (event) => {
      const raw = event.target.value;
      const parsed = parseNumberFilterValue(raw);
      onChange?.({ target: { value: Number.isFinite(parsed) ? String(parsed) : raw } });
    },
    [onChange]
  );

  return (
    <div className="erp-filter-money-input">
      <span className="erp-filter-money-input__prefix" aria-hidden="true">
        R$
      </span>
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        className="erp-filter-field-input erp-filter-money-input__field"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}
