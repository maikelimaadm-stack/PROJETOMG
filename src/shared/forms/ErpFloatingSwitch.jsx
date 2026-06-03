import React from "react";
import { cn } from "@/shared/utils/utils";
import ToggleSwitch from "@/shared/components/ToggleSwitch";

/** Switch/checkbox com label lateral (controles booleanos não usam label dentro do input). */
export default function ErpFloatingSwitch({
  label,
  checked,
  onChange,
  disabled,
  className,
  id,
}) {
  return (
    <div className={cn("erp-float-switch-row", className)}>
      <label htmlFor={id} className="erp-float-switch-label">
        {label}
      </label>
      <ToggleSwitch
        id={id}
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        className="emp-form-toggle-switch erp-float-switch"
        checkedClassName="emp-form-toggle-switch-on"
      />
    </div>
  );
}
