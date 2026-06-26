import React from "react";

/**
 * Dock inferior reutilizável para tabelas e cards MAK.
 * Encapsula classes emp-table-bottom-dock / emp-cards-bottom-dock.
 */
export default function MakDock({
  variant = "table",
  className = "",
  children,
  ...props
}) {
  const baseClass =
    variant === "cards" ? "emp-cards-bottom-dock flex-shrink-0" : "emp-table-bottom-dock";
  return (
    <div className={`${baseClass}${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </div>
  );
}
