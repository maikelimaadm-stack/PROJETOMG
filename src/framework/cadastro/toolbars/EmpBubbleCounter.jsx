import React from "react";

export default function EmpBubbleCounter({ value, title, className = "", tailClassName = "" }) {
  return (
    <div
      className={`emp-bubble-counter inline-flex shrink-0 ${className}`.trim()}
      title={title}
      aria-label={title ? `${title}: ${value}` : undefined}
    >
      <span className="emp-bubble-counter__value tabular-nums">{value}</span>
      <span className={`emp-bubble-counter__tail ${tailClassName}`.trim()} aria-hidden="true" />
    </div>
  );
}
