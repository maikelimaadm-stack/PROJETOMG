import React from "react";
import ModeloBase1RuntimeReadWriteBlockedBadge from "./ModeloBase1RuntimeReadWriteBlockedBadge.jsx";
import ModeloBase1RuntimeReadFallbackBadge from "./ModeloBase1RuntimeReadFallbackBadge.jsx";

/**
 * Dev-only, non-intrusive diagnostics strip for the ModeloBase1 beta read model.
 * It is DEV-ONLY: the caller must pass `enabled` from
 * `isModeloBase1BetaUiDiagnosticsEnabled(env)` (opt-in flag, fail-closed in
 * production). Purely presentational — no side effects, no fetch/backend/
 * storage, no CSS global, never blocks render. Shows only counts and flags
 * (never raw rows or sensitive values). Renders nothing when disabled or when
 * there is no hardening model.
 *
 * @param {Object} props
 * @param {boolean} props.enabled
 * @param {Object|null} props.hardeningModel Output of createModeloBase1BetaUiHardeningModel.
 */
function ModeloBase1RuntimeReadDiagnosticsPanel({ enabled, hardeningModel }) {
  if (!enabled || !hardeningModel) return null;
  const diag = hardeningModel.diagnostics ?? {};
  const counts = diag.counts ?? { pass: 0, warn: 0, fail: 0, skipped: 0 };
  return (
    <div
      data-mb1-runtime-read-panel="diagnostics"
      className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600"
    >
      <span className="font-semibold uppercase tracking-wide text-slate-500">beta diag</span>
      <span>módulo: {hardeningModel.moduleId}</span>
      <span>status: {hardeningModel.hardeningStatus}</span>
      <span>source: {hardeningModel.source ?? "—"}</span>
      <span className="text-emerald-700">✓ {counts.pass}</span>
      <span className="text-amber-700">⚠ {counts.warn}</span>
      <span className="text-rose-700">✗ {counts.fail}</span>
      <span className="text-slate-400">skip {counts.skipped}</span>
      <ModeloBase1RuntimeReadWriteBlockedBadge writeBlocked={hardeningModel.writeBlocked} />
      <ModeloBase1RuntimeReadFallbackBadge
        fallbackApplied={hardeningModel.fallbackApplied}
        fallbackReason={hardeningModel.fallbackReason}
      />
    </div>
  );
}

export default ModeloBase1RuntimeReadDiagnosticsPanel;
