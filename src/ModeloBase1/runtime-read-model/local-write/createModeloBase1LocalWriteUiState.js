import { isPlainObject, safeClone } from '../safety.js';
import { createModeloBase1LocalWriteController } from './createModeloBase1LocalWriteController.js';
import { resolveModeloBase1LocalWriteActivation } from './resolveModeloBase1LocalWriteActivation.js';
import { createModeloBase1LocalWriteActivationDiagnostics } from './modeloBase1LocalWriteActivationDiagnostics.js';

/**
 * Builds the pure, deterministic UI STATE snapshot for the controlled local
 * write activation. When active, `rows`/`form` reflect the controller's current
 * LOCAL DRAFT (in-memory, non-persisted); when inactive, they fall back to the
 * applied read state (read-only). Never mutates any input; returns a safe copy.
 *
 * @param {Object} options
 * @param {Object} options.activation Result of resolveModeloBase1LocalWriteActivation.
 * @param {Object|null} options.controller The live local write controller (or null).
 * @param {Object|null} options.readState The applied runtime read state.
 * @param {number} [options.operationCount]
 * @param {boolean} [options.hasLocalChanges]
 * @param {Object|null} [options.lastOperation]
 * @returns {Object}
 */
export function createModeloBase1LocalWriteUiState(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const activation = isPlainObject(o.activation) ? o.activation : { activationApplied: false, readOnlyFallback: true };
  const controller = o.controller && typeof o.controller.inspectLocalDraft === 'function' ? o.controller : null;
  const readState = isPlainObject(o.readState) ? o.readState : null;
  const active = activation.activationApplied === true && controller != null;

  const draft = active ? controller.inspectLocalDraft() : null;
  const table = active && isPlainObject(draft?.table)
    ? draft.table
    : (readState && isPlainObject(readState.table) ? readState.table : { columns: [], rows: [], rowCount: 0 });
  const rows = Array.isArray(table.rows) ? table.rows.filter((r) => !r._localDeleted) : [];
  const form = active && isPlainObject(draft?.form)
    ? draft.form
    : (readState && isPlainObject(readState.form) ? readState.form : null);

  const localRowCount = rows.length;
  const operationCount = Number.isFinite(o.operationCount) ? Number(o.operationCount) : 0;
  const hasLocalChanges = Boolean(o.hasLocalChanges) || operationCount > 0;

  const diagnostics = createModeloBase1LocalWriteActivationDiagnostics({
    moduleId: activation.moduleId,
    activation,
    operationCount,
    localRowCount,
    hasLocalChanges,
    lastOperation: o.lastOperation ?? null,
  });

  return safeClone({
    kind: 'modelobase1-local-write-ui-state',
    moduleId: activation.moduleId ?? (readState ? readState.moduleId : null) ?? null,
    activationApplied: active,
    localOnly: true,
    readOnlyFallback: activation.readOnlyFallback !== false,
    rows,
    form,
    localDraft: draft,
    localRowCount,
    operationCount,
    hasLocalChanges,
    diagnostics,
    persistence: 'none',
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
  });
}

/**
 * A React-FREE, stateful session core for the controlled local write activation.
 * The React hook wraps this; tests drive it directly. It resolves activation,
 * lazily creates the local controller (only when active), runs local mutations
 * against the in-memory draft, tracks operation metadata, and can reset the
 * draft back to the original read state. Never persists, never calls a backend/
 * Prisma/fetch/storage, never touches the runtime bridge, never mutates the
 * original read state.
 *
 * @param {Object} options
 * @param {Object} [options.readState]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} session
 */
export function createModeloBase1LocalWriteSession(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const readState = isPlainObject(o.readState) ? o.readState : null;
  const activation = resolveModeloBase1LocalWriteActivation({ moduleId: o.moduleId, readState, env: o.env });
  const moduleId = activation.moduleId;

  let controller = activation.activationApplied
    ? createModeloBase1LocalWriteController({ readState: readState ?? {}, moduleId })
    : null;
  let operationCount = 0;
  let lastOperation = null;

  function record(res) {
    operationCount += 1;
    lastOperation = res;
    return res;
  }
  const guard = (fn) => {
    if (!controller) {
      const res = { ok: false, applied: false, localOnly: true, backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false, errors: ['local write activation is not enabled'] };
      return res; // do NOT count as an applied op
    }
    return record(fn());
  };

  return {
    kind: 'modelobase1-local-write-session',
    moduleId,
    activation,
    get activationApplied() { return activation.activationApplied === true && controller != null; },
    createRow: (payload) => guard(() => controller.createRow(payload)),
    updateRow: (id, payload) => guard(() => controller.updateRow(id, payload)),
    deleteRow: (id) => guard(() => controller.deleteRow(id)),
    saveDraft: () => guard(() => controller.saveDraft()),
    submitDraft: () => guard(() => controller.submitDraft()),
    resetDraft: () => {
      if (!activation.activationApplied) return { ok: false, reset: false, reason: activation.reason };
      controller = createModeloBase1LocalWriteController({ readState: readState ?? {}, moduleId });
      operationCount = 0;
      lastOperation = { operation: 'resetDraft', ok: true, applied: true };
      return { ok: true, reset: true, localOnly: true };
    },
    getUiState: () => createModeloBase1LocalWriteUiState({
      activation,
      controller,
      readState,
      operationCount,
      hasLocalChanges: operationCount > 0,
      lastOperation,
    }),
    getController: () => controller,
  };
}

export default createModeloBase1LocalWriteUiState;
