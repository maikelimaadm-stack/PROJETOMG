import React from "react";
import { cn } from "@/shared/utils/utils";
import ErpFloatingField from "./ErpFloatingField";
import { applyMask } from "./masks";

/**
 * Input com floating label, máscaras opcionais e estados padronizados.
 */
export default function ErpFloatingInput({
  label,
  value,
  onChange,
  type = "text",
  mask,
  required,
  error,
  hint,
  disabled,
  readOnly,
  id,
  className,
  inputClassName,
  maxLength,
  autoComplete,
  name,
}) {
  const strValue = value == null ? "" : String(value);
  const filled = strValue.trim().length > 0;

  return (
    <ErpFloatingField
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      disabled={disabled}
      readOnly={readOnly}
      filled={filled}
      className={className}
    >
      <input
        type={type}
        name={name}
        value={strValue}
        onChange={(e) => {
          let next = e.target.value;
          if (mask) next = applyMask(mask, next);
          if (onChange) {
            onChange({ ...e, target: { ...e.target, value: next } });
          }
        }}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={cn("erp-float-input", inputClassName)}
      />
    </ErpFloatingField>
  );
}
