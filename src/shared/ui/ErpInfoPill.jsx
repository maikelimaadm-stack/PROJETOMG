import React from "react";

export default function ErpInfoPill({ icon: Icon, children, className = "", title, truncateText = true }) {
  if (children == null || children === "") return null;

  return (
    <span
      className={`erp-info-pill inline-flex items-center gap-1.5 ${className}`.trim()}
      title={title}
    >
      {Icon ? (
        <Icon className="erp-info-pill__icon h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      ) : null}
      <span
        className={`erp-info-pill__text min-w-0 ${truncateText ? "truncate" : "whitespace-nowrap"}`}
      >
        {children}
      </span>
    </span>
  );
}
