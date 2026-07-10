import React from "react";
import ModeloBase1LocalPersistenceBadge from "./ModeloBase1LocalPersistenceBadge.jsx";

/**
 * Dev-only, non-intrusive panel that surfaces the local persistence VALIDATION
 * contract + diagnostics. Purely presentational — no side effects, no adapter
 * calls, no auto-save/auto-restore, no backend/fetch/storage, no CSS global,
 * never blocks render. Shows only flags/counts (never raw rows or sensitive
 * values). The caller must pass `enabled` from a dev-only flag. Renders nothing
 * when disabled.
 *
 * @param {Object} props
 * @param {boolean} props.enabled
 * @param {Object|null} props.contract
 * @param {Object|null} props.diagnostics
 */
function ModeloBase1LocalPersistencePanel({ enabled, contract, diagnostics }) {
  if (!enabled || !contract) return null;
  const safety = contract.safety ?? {};
  const generic = contract.genericModelReady ?? {};
  return (
    <div
      data-mb1-local-persistence-panel="validation"
      className="flex flex-wrap items-center gap-2 border-b border-teal-200 bg-teal-50 px-3 py-1 text-[11px] text-teal-700"
    >
      <span className="font-semibold uppercase tracking-wide text-teal-500">persistence validation</span>
      <span>módulo: {contract.moduleId}</span>
      <span>storage: {contract.storageMode}</span>
      <span>localOnly: {String(safety.localOnly !== false)}</span>
      <span>persistReal: {String(Boolean(safety.persistenceReal))}</span>
      <span>allowed: {(contract.allowedOperations ?? []).length}</span>
      <span>blocked: {(contract.blockedOperations ?? []).length}</span>
      <span>snapshots: {diagnostics?.snapshotCount ?? 0}</span>
      <span>generic: {String(Boolean(generic.ready))}</span>
      <ModeloBase1LocalPersistenceBadge enabled={contract.enabled} />
      <span className="text-teal-400">next: {contract.nextAllowedStep}</span>
    </div>
  );
}

export default ModeloBase1LocalPersistencePanel;
