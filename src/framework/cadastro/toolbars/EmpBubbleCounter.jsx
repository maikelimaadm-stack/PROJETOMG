import React from "react";
import ErpInfoPill from "@/shared/ui/ErpInfoPill";
import { EMP_TOOLBAR_COUNTER } from "@/framework/cadastro/toolbars/empToolbarStyles";

export default function EmpBubbleCounter({
  value,
  title,
  label,
  className = "",
  tone = "neutral",
  usePillStyle = true,
  variant = "auto",
}) {
  const resolvedTitle = title || (label ? `${label}: ${value}` : value);
  const isToolbarCounter =
    variant === "toolbar" ||
    className.includes("emp-toolbar-record-counter") ||
    className.includes("emp-toolbar-bubble-counter");

  if (isToolbarCounter) {
    return (
      <div
        className={`${EMP_TOOLBAR_COUNTER} emp-toolbar-record-counter ${className}`.trim()}
        title={resolvedTitle}
        aria-label={resolvedTitle || undefined}
      >
        {value}
      </div>
    );
  }

  if (usePillStyle) {
    return (
      <ErpInfoPill className={className.trim()} title={resolvedTitle}>
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
      title={resolvedTitle}
      aria-label={resolvedTitle ? `${resolvedTitle}: ${value}` : undefined}
    >
      <span className="emp-bubble-counter__value tabular-nums">{value}</span>
      <span className="emp-bubble-counter__tail" aria-hidden="true" />
    </div>
  );
}
