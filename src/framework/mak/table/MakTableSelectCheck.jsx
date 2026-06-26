import React, { useEffect, useRef } from "react";
import { Check } from "lucide-react";

/**
 * Checkbox de seleção de linha para tabelas MAK (inclui estado indeterminado).
 */
export default function MakTableSelectCheck({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
  disabled = false,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate) && !checked;
    }
  }, [indeterminate, checked]);

  return (
    <span
      className={`mg-cards-config-menu__check emp-table-select-check${checked ? " is-checked" : ""}${indeterminate && !checked ? " is-indeterminate" : ""}${disabled ? " is-locked" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className="mg-cards-config-menu__checkbox-input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => {
          event.stopPropagation();
          onChange?.(event);
        }}
        onClick={(event) => event.stopPropagation()}
      />
      {checked ? <Check className="mg-cards-config-menu__check-icon" strokeWidth={2.5} aria-hidden="true" /> : null}
      {indeterminate && !checked ? (
        <span className="mg-cards-config-menu__check-dash" aria-hidden="true" />
      ) : null}
    </span>
  );
}
