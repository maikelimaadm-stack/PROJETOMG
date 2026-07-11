import {
  isGenericModelPlainObject,
  createGenericModelSnapshot,
  validateGenericModelSnapshot,
  createGenericModelInMemoryAdapter,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from './modeloBase2PrototypeConfig.js';

/**
 * Serializes a ModeloBase2 operational draft into a generic-kernel SNAPSHOT
 * (operational modelType). Local-only; persistenceReal:false; deterministic
 * checksum. Pure. Returns a snapshot or a generic-model error object.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft]
 * @param {() => string} [options.clock]
 * @returns {Object} snapshot or error
 */
export function createModeloBase2OperationalSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const draft = isGenericModelPlainObject(o.draft) ? o.draft : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : (typeof draft.moduleId === 'string' ? draft.moduleId : 'operacional-prototype');
  const clock = typeof o.clock === 'function' ? o.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;

  return createGenericModelSnapshot({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    data: {
      draft: { draftId: draft.draftId ?? null, status: draft.status ?? null, operationType: draft.operationType ?? null },
      entries: Array.isArray(draft.entries) ? draft.entries : [],
      events: Array.isArray(draft.events) ? draft.events : [],
      summary: isGenericModelPlainObject(draft.summary) ? draft.summary : null,
    },
    draftVersion: isGenericModelPlainObject(draft.version) && Number.isInteger(draft.version.draftVersion) ? draft.version.draftVersion : undefined,
    clock,
  });
}

/**
 * Validates a ModeloBase2 operational snapshot (checksum fail-closed).
 * @param {Object} [options]
 * @param {Object} [options.snapshot]
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToUse: boolean }}
 */
export function validateModeloBase2OperationalSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  return validateGenericModelSnapshot({ snapshot: o.snapshot, modelId: MODELOBASE2_MODEL_ID });
}

/**
 * Round-trips an operational draft through a generic in-memory adapter (save →
 * load), proving local persistence VALIDATION without real persistence.
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft]
 * @param {Object} [options.adapter] Injectable generic in-memory adapter.
 * @param {() => string} [options.clock]
 * @returns {{ ok: boolean, snapshot: Object|null, saved: Object|null, loaded: Object|null, persistenceReal: boolean, backendTouched: boolean, storageMode: string|null, errors: string[] }}
 */
export function roundTripModeloBase2OperationalSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const adapter = isGenericModelPlainObject(o.adapter) ? o.adapter : createGenericModelInMemoryAdapter({ storageMode: 'memory_validation' });
  const snapshot = createModeloBase2OperationalSnapshot({ moduleId: o.moduleId, draft: o.draft, clock: o.clock });
  if (snapshot.kind !== 'generic-model-snapshot') {
    return { ok: false, snapshot: null, saved: null, loaded: null, persistenceReal: false, backendTouched: false, storageMode: adapter.storageMode ?? null, errors: ['snapshot creation failed'] };
  }
  const saved = adapter.saveSnapshot(snapshot);
  const loaded = adapter.loadSnapshot(snapshot.snapshotId);
  return {
    ok: saved.ok === true && loaded.ok === true,
    snapshot,
    saved,
    loaded: loaded.snapshot ?? null,
    persistenceReal: false,
    backendTouched: false,
    storageMode: adapter.storageMode ?? null,
    errors: [...(saved.errors ?? []), ...(loaded.errors ?? [])],
  };
}

export default createModeloBase2OperationalSnapshot;
