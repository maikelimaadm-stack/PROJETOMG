import React from "react";

/**
 * Discreet, presentational badge for the ModeloBase1 controlled local write
 * PLAN status. Read-only, no side effects, no CSS global, no button. Renders
 * nothing unless the plan is enabled. It reflects that any write is LOCAL-ONLY
 * (no backend/Prisma/runtimeBridge). Not wired into the real screen in this
 * slice — provided for the next (activation) slice.
 *
 * @param {Object} props
 * @param {Object|null} props.plan Output of createModeloBase1ControlledLocalWritePlan.
 */
function ModeloBase1LocalWriteStatusBadge({ plan }) {
  if (!plan || !plan.enabled) return null;
  return (
    <span
      data-mb1-local-write-badge="plan"
      className="inline-flex items-center gap-1 rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-800"
      title="Plano de escrita local (in-memory) — sem backend, sem Prisma, sem persistência."
    >
      📝 local write plan ({plan.moduleId})
    </span>
  );
}

export default ModeloBase1LocalWriteStatusBadge;
