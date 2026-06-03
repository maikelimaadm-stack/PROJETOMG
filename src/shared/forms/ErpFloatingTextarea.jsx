import React from "react";
import { cn } from "@/shared/utils/utils";
import ErpFloatingField from "./ErpFloatingField";

export default function ErpFloatingTextarea({
  label,
  value,
  onChange,
  required,
  error,
  hint,
  disabled,
  readOnly,
  id,
  className,
  rows = 3,
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
      className={cn("erp-float-field--textarea", className)}
    >
      <textarea
        name={name}
        value={strValue}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        className="erp-float-input erp-float-textarea"
      />
    </ErpFloatingField>
  );
}
