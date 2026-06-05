import React from "react";

export default function EmpBubbleCounter({
  value,
  title,
  label,
  className = "",
  tailClassName = "",
  tone = "neutral",
}) {
  const toneClass =
    tone === "complete"
      ? "emp-bubble-counter--complete"
      : tone === "incomplete"
        ? "emp-bubble-counter--incomplete"
        : "";

  return (
    <div
      className={`emp-bubble-counter inline-flex shrink-0 ${toneClass} ${className}`.trim()}
      title={title}
      aria-label={title ? `${title}: ${value}` : undefined}
    >
      <span className="emp-bubble-counter__value tabular-nums">
        {label ? (
          <>
            <span className="font-medium">{label}:</span> {value}
          </>
        ) : (
          value
        )}
      </span>
      <span className={`emp-bubble-counter__tail ${tailClassName}`.trim()} aria-hidden="true" />
    </div>
  );
}
