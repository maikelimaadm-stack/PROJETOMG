import React from "react";
import ModeloBase1LocalDraftBadge from "./ModeloBase1LocalDraftBadge.jsx";

/**
 * Dev-only, controlled toolbar for the ModeloBase1 local write ACTIVATION. Its
 * buttons drive ONLY the in-memory local write operations passed in via
 * `localWrite.operations` — they never call a backend/Prisma/fetch/storage and
 * never touch the runtime bridge. `submitDraft` is a simulated submit. No CSS
 * global. Renders nothing unless activation is applied.
 *
 * @param {Object} props
 * @param {Object} props.localWrite Result of useModeloBase1ControlledLocalWrite.
 */
function ModeloBase1LocalWriteToolbar({ localWrite }) {
  if (!localWrite || !localWrite.activationApplied) return null;
  const ops = localWrite.operations ?? {};
  const btn = "rounded border border-violet-300 bg-white px-1.5 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-50";
  return (
    <div
      data-mb1-local-write-toolbar="beta"
      className="flex flex-wrap items-center gap-2 border-b border-violet-200 bg-violet-50 px-3 py-1 text-[11px] text-violet-700"
    >
      <span className="font-semibold uppercase tracking-wide text-violet-500">local write</span>
      <button type="button" className={btn} onClick={() => ops.createRow?.({ cells: {} })}>＋ linha local</button>
      <button type="button" className={btn} onClick={() => ops.saveDraft?.()}>💾 salvar rascunho</button>
      <button type="button" className={btn} onClick={() => ops.submitDraft?.()}>📤 submeter (simulado)</button>
      <button type="button" className={btn} onClick={() => ops.resetDraft?.()}>↺ reset</button>
      <span className="text-violet-500">linhas locais: {localWrite.localRowCount}</span>
      <ModeloBase1LocalDraftBadge activationApplied={localWrite.activationApplied} hasLocalChanges={localWrite.hasLocalChanges} />
    </div>
  );
}

export default ModeloBase1LocalWriteToolbar;
