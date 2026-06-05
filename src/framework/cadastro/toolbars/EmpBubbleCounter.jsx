import React from "react";
import ErpInfoPill from "@/shared/ui/ErpInfoPill";

export default function EmpBubbleCounter({
  value,
  title,
  label,
  className = "",
  tone = "neutral",
  usePillStyle = true,
}) {
  if (usePillStyle) {
    return (
      <ErpInfoPill
        className={`emp-toolbar-record-counter ${className}`.trim()}
        title={title || (label ? `${label}: ${value}` : value)}
      >
        {value}
      </ErpInfoPill>
    );
  }

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
      <span className="emp-bubble-counter__value tabular-nums">{value}</span>
      <span className="emp-bubble-counter__tail" aria-hidden="true" />
    </div>
  );
}
