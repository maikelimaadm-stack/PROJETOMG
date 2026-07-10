import React from "react";

/**
 * Discreet, presentational badge signaling that the beta screen is in LOCAL
 * WRITE mode and that changes are NOT persisted. Read-only, no side effects, no
 * CSS global. Renders nothing unless local write activation is applied.
 *
 * @param {Object} props
 * @param {boolean} props.activationApplied
 * @param {boolean} [props.hasLocalChanges]
 */
function ModeloBase1LocalDraftBadge({ activationApplied, hasLocalChanges }) {
  if (!activationApplied) return null;
  return (
    <span
      data-mb1-local-write-badge="draft"
      className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800"
      title="Escrita local beta — não persistido (sem backend, sem Prisma, sem storage)."
    >
      📝 local beta{hasLocalChanges ? " · não persistido" : ""}
    </span>
  );
}

export default ModeloBase1LocalDraftBadge;
