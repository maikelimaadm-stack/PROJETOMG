import React from "react";
import ModeloBase1LocalWriteStatusBadge from "./ModeloBase1LocalWriteStatusBadge.jsx";

/**
 * Dev-only, non-intrusive panel that surfaces the controlled local write PLAN
 * contract + diagnostics. Purely presentational — no side effects, no button
 * that performs an operation, no backend/fetch/storage, no CSS global, never
 * blocks render. Shows only the contract's allowed/blocked operation counts and
 * safety flags (never raw rows or sensitive values). The caller must pass
 * `enabled` from a dev-only flag. Not wired into the real screen in this slice.
 *
 * @param {Object} props
 * @param {boolean} props.enabled
 * @param {Object|null} props.plan
 */
function ModeloBase1LocalWritePlanPanel({ enabled, plan }) {
  if (!enabled || !plan || !plan.enabled) return null;
  const contract = plan.contract ?? {};
  const safety = contract.safety ?? {};
  return (
    <div
      data-mb1-local-write-panel="plan"
      className="flex flex-wrap items-center gap-2 border-b border-violet-200 bg-violet-50 px-3 py-1 text-[11px] text-violet-700"
    >
      <span className="font-semibold uppercase tracking-wide text-violet-500">local write plan</span>
      <span>módulo: {plan.moduleId}</span>
      <span>allowed: {(contract.allowedOperations ?? []).length}</span>
      <span>blocked: {(contract.blockedOperations ?? []).length}</span>
      <span>localOnly: {String(safety.localOnly !== false)}</span>
      <span>backend: {String(Boolean(safety.backendTouched))}</span>
      <span>prisma: {String(Boolean(safety.prismaTouched))}</span>
      <span>persist: {safety.persistence ?? "none"}</span>
      <ModeloBase1LocalWriteStatusBadge plan={plan} />
      <span className="text-violet-400">next: {plan.nextAllowedStep}</span>
    </div>
  );
}

export default ModeloBase1LocalWritePlanPanel;
