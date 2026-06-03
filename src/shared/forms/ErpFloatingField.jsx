import React, { useId } from "react";
import { cn } from "@/shared/utils/utils";
import { useFloatingFieldState } from "./useFloatingFieldState";

/**
 * Container com floating label — sem placeholder tradicional.
 */
export default function ErpFloatingField({
  id: idProp,
  label,
  required = false,
  error,
  hint,
  disabled = false,
  readOnly = false,
  filled = false,
  className,
  controlClassName,
  children,
}) {
  const autoId = useId();
  const fieldId = idProp || autoId;
  const { focused, floated, focusHandlers } = useFloatingFieldState(filled);

  const child = React.Children.only(children);
  const mergedChild = React.cloneElement(child, {
    id: child.props.id || fieldId,
    disabled: disabled || child.props.disabled,
    readOnly: readOnly || child.props.readOnly,
    "aria-invalid": error ? true : child.props["aria-invalid"],
    "aria-describedby": error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : child.props["aria-describedby"],
    className: cn("erp-float-control", child.props.className),
    ...focusHandlers({
      onFocus: child.props.onFocus,
      onBlur: child.props.onBlur,
    }),
  });

  return (
    <div
      className={cn(
        "erp-float-field",
        floated && "erp-float-field--floated",
        focused && "erp-float-field--focused",
        error && "erp-float-field--error erp-field-invalid",
        disabled && "erp-float-field--disabled",
        readOnly && "erp-float-field--readonly",
        className
      )}
      data-floated={floated ? "true" : "false"}
    >
      <div className={cn("erp-float-control-wrap", controlClassName)}>{mergedChild}</div>
      <label htmlFor={fieldId} className="erp-float-label">
        {label}
        {required ? <span className="erp-float-required" aria-hidden="true"> *</span> : null}
      </label>
      {error ? (
        <p id={`${fieldId}-error`} className="erp-float-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="erp-float-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
