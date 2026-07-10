import React from "react";

/**
 * Discreet, presentational badge that surfaces a beta-read FALLBACK reason (for
 * dev visibility only — it is rendered by the diagnostics panel, itself
 * flag-gated). Read-only, no side effects, no CSS global. Renders nothing unless
 * a fallback with a reason is present.
 *
 * @param {Object} props
 * @param {boolean} props.fallbackApplied
 * @param {string|null} [props.fallbackReason]
 */
function ModeloBase1RuntimeReadFallbackBadge({ fallbackApplied, fallbackReason }) {
  if (!fallbackApplied || !fallbackReason) return null;
  return (
    <span
      data-mb1-runtime-read-badge="fallback"
      className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800"
      title={`Fallback: ${fallbackReason}`}
    >
      ↩ fallback: {fallbackReason}
    </span>
  );
}

export default ModeloBase1RuntimeReadFallbackBadge;
