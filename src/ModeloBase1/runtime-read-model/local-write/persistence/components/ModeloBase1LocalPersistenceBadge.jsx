import React from "react";

/**
 * Discreet, presentational badge signaling that LOCAL PERSISTENCE VALIDATION is
 * active (validation-only, never real persistence). Read-only, no side effects,
 * no CSS global. Renders nothing unless validation is enabled.
 *
 * @param {Object} props
 * @param {boolean} props.enabled
 */
function ModeloBase1LocalPersistenceBadge({ enabled }) {
  if (!enabled) return null;
  return (
    <span
      data-mb1-local-persistence-badge="validation"
      className="inline-flex items-center gap-1 rounded bg-teal-100 px-1.5 py-0.5 text-[11px] font-medium text-teal-800"
      title="Validação de persistência local (in-memory) — não persiste de verdade (sem backend, sem Prisma, sem storage)."
    >
      🧪 persistence validation
    </span>
  );
}

export default ModeloBase1LocalPersistenceBadge;
