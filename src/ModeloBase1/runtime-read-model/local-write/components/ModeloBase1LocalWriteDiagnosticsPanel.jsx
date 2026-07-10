import React from "react";

/**
 * Dev-only, non-intrusive diagnostics strip for the ModeloBase1 local write
 * activation. The caller must pass `enabled` from a dev-only flag. Purely
 * presentational — no side effects, no backend/fetch/storage, no CSS global,
 * never blocks render. Shows only flags/counts (never raw rows or sensitive
 * values). Renders nothing when disabled or without diagnostics.
 *
 * @param {Object} props
 * @param {boolean} props.enabled
 * @param {Object|null} props.diagnostics Output of the activation diagnostics.
 */
function ModeloBase1LocalWriteDiagnosticsPanel({ enabled, diagnostics }) {
  if (!enabled || !diagnostics) return null;
  return (
    <div
      data-mb1-local-write-panel="diagnostics"
      className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600"
    >
      <span className="font-semibold uppercase tracking-wide text-slate-500">local write diag</span>
      <span>módulo: {diagnostics.moduleId ?? "—"}</span>
      <span>activation: {String(diagnostics.activationApplied)}</span>
      <span>localOnly: {String(diagnostics.localOnly !== false)}</span>
      <span>backend: {String(Boolean(diagnostics.backendTouched))}</span>
      <span>prisma: {String(Boolean(diagnostics.prismaTouched))}</span>
      <span>bridge: {String(Boolean(diagnostics.runtimeBridgeTouched))}</span>
      <span>persist: {diagnostics.persistence ?? "none"}</span>
      <span>ops: {diagnostics.operationCount ?? 0}</span>
      <span className="text-slate-400">next: {diagnostics.nextAllowedStep}</span>
    </div>
  );
}

export default ModeloBase1LocalWriteDiagnosticsPanel;
