import React from "react";
import {
  ERP_TOOLBAR_BTN_ACTIVE,
  ERP_TOOLBAR_BTN_BASE,
  ERP_TOOLBAR_BTN_DANGER,
  ERP_TOOLBAR_BTN_DEFAULT,
  ERP_TOOLBAR_BTN_ICON,
  ERP_TOOLBAR_BTN_PRIMARY,
} from "@/components/emp/toolbars/empToolbarStyles";

const VARIANTS = {
  primary: ERP_TOOLBAR_BTN_PRIMARY,
  default: ERP_TOOLBAR_BTN_DEFAULT,
  danger: ERP_TOOLBAR_BTN_DANGER,
  icon: ERP_TOOLBAR_BTN_ICON,
};

export default function EmpToolbarButton({
  variant = "default",
  active = false,
  icon: Icon,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`${ERP_TOOLBAR_BTN_BASE} ${VARIANTS[variant] || VARIANTS.default} ${active ? ERP_TOOLBAR_BTN_ACTIVE : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />}
      {children ? <span className="leading-none">{children}</span> : null}
    </button>
  );
}
