import React, { useId } from "react";

export default function ToggleSwitch({
  checked = false,
  disabled = false,
  onChange,
  className = "",
  checkedClassName = "",
  variant = "default",
  ariaLabelledby = undefined,
  id: idProp,
  name,
}) {
  const autoId = useId();
  const inputId = idProp || autoId;
  const loteVariant = variant === "lote";

  return (
    <label
      htmlFor={inputId}
      className={[
        "mak-switch emp-form-toggle-switch",
        loteVariant ? "mak-switch--lote" : "",
        checked && checkedClassName ? checkedClassName : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        id={inputId}
        name={name}
        checked={!!checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        aria-labelledby={ariaLabelledby}
      />
      <span className="mak-track" aria-hidden="true">
        <span className="mak-thumb" />
      </span>
    </label>
  );
}
