import { isPlainObject, safeClone } from '../safety.js';
import { validateModeloBase1LocalWritePayload } from './validateModeloBase1LocalWritePayload.js';
import { applyModeloBase1LocalWriteMutation } from './applyModeloBase1LocalWriteMutation.js';
import { createModeloBase1LocalWriteDiagnostics } from './modeloBase1LocalWriteDiagnostics.js';
import { localWriteError } from './errors.js';

/**
 * An in-memory CONTROLLED LOCAL WRITE CONTROLLER for the ModeloBase1 beta read
 * model. It seeds an internal LOCAL DRAFT from a SAFE COPY of the applied read
 * state (or read model) and lets planned/simulated mutations run against that
 * copy. It NEVER mutates the original read state, never persists, never calls a
 * backend/Prisma/fetch/storage, never touches the runtime bridge.
 *
 * Every method returns a structured result:
 *   { ok, operation, moduleId, applied, localOnly, backendTouched:false,
 *     prismaTouched:false, runtimeBridgeTouched:false, diagnostics, errors, warnings }
 *
 * @param {Object} options
 * @param {Object} [options.readState] Applied read state (with `table.rows`).
 * @param {Object} [options.runtimeReadModel] Alternative source (its resolved shape).
 * @param {string} [options.moduleId]
 * @returns {Object} controller
 */
export function createModeloBase1LocalWriteController(options = {}) {
  if (!isPlainObject(options)) {
    throw localWriteError('MAK-MB1-LW-001', 'createModeloBase1LocalWriteController() options must be a plain object');
  }
  const source = isPlainObject(options.readState)
    ? options.readState
    : (isPlainObject(options.runtimeReadModel) ? options.runtimeReadModel : {});
  const moduleId = typeof options.moduleId === 'string'
    ? options.moduleId
    : (typeof source.moduleId === 'string' ? source.moduleId : 'unknown');

  // Seed the internal draft from a SAFE COPY — the original is never touched.
  const seedTable = isPlainObject(source.table) ? source.table : { columns: [], rows: [], rowCount: 0 };
  /** @type {any} */
  let draft = safeClone({
    kind: 'modelobase1-local-draft',
    moduleId,
    table: {
      columns: Array.isArray(seedTable.columns) ? seedTable.columns : [],
      rows: Array.isArray(seedTable.rows) ? seedTable.rows : [],
      rowCount: Array.isArray(seedTable.rows) ? seedTable.rows.length : 0,
    },
    form: isPlainObject(source.form) ? source.form : null,
  }) ?? { moduleId, table: { columns: [], rows: [], rowCount: 0 } };

  let sequence = 0;
  /** @type {Object|null} */
  let lastOperation = null;
  /** @type {Array<Object>} */
  const history = [];

  function runMutation(operation, payload) {
    const validation = validateModeloBase1LocalWritePayload({ moduleId, operation, payload });
    if (!validation.safeToApply) {
      const res = {
        ok: false,
        operation,
        moduleId,
        applied: false,
        localOnly: true,
        backendTouched: false,
        prismaTouched: false,
        runtimeBridgeTouched: false,
        errors: [...validation.errors, ...validation.blockers],
        warnings: validation.warnings,
        validation,
      };
      lastOperation = res;
      history.push(res);
      return res;
    }
    sequence += 1;
    const mutation = applyModeloBase1LocalWriteMutation({ draft, operation, payload, moduleId, sequence });
    if (mutation.ok) {
      draft = mutation.nextDraft; // advance the internal draft copy
    }
    const res = { ...mutation, validation };
    delete res.nextDraft; // callers read the draft via inspect()
    lastOperation = res;
    history.push(res);
    return res;
  }

  return {
    kind: 'modelobase1-local-write-controller',
    moduleId,
    createRow: (payload) => runMutation('createRow', payload),
    updateRow: (id, payload) => runMutation('updateRow', { id, ...(isPlainObject(payload) ? payload : {}) }),
    deleteRow: (id) => runMutation('deleteRow', { id }),
    saveDraft: () => runMutation('saveDraft', {}),
    submitDraft: () => runMutation('submitDraft', {}),
    /** Returns a safe copy of the current local draft (never the internal ref). */
    inspectLocalDraft: () => safeClone(draft),
    /** Structured diagnostics for the controller's current state. */
    diagnostics: () => createModeloBase1LocalWriteDiagnostics({
      moduleId,
      enabled: true,
      ready: true,
      lastOperation,
      warnings: [],
      blockers: [],
    }),
    /** Operation history (safe copy). */
    getHistory: () => safeClone(history),
  };
}

export default createModeloBase1LocalWriteController;
