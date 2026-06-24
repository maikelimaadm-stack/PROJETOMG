import * as React from "react";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import { cn } from "@/shared/utils/utils";

const Switch = ({ className, checked, onCheckedChange, disabled, id, ...props }) => (
  <ToggleSwitch
    id={id}
    checked={checked}
    disabled={disabled}
    onChange={onCheckedChange}
    className={cn(className)}
    {...props}
  />
);
Switch.displayName = "Switch";

export { Switch };
