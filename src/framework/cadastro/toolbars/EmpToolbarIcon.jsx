import React from "react";

export const EMP_TOOLBAR_NAV_ICON_CLASS = "emp-toolbar-nav-icon shrink-0";
export const EMP_TOOLBAR_ICON_CLASS = "emp-toolbar-action-icon shrink-0";

export default function EmpToolbarIcon({ icon: Icon, nav = false, strokeWidth, className = "", ...props }) {
  if (!Icon) return null;
  return (
    <Icon
      className={`${nav ? EMP_TOOLBAR_NAV_ICON_CLASS : EMP_TOOLBAR_ICON_CLASS} ${className}`.trim()}
      strokeWidth={strokeWidth ?? (nav ? 2 : 2.25)}
      {...props}
    />
  );
}
