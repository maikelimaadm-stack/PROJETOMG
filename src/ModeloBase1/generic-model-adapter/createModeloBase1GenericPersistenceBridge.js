import {
  isGenericModelPlainObject,
  createGenericModelInMemoryAdapter,
  createGenericModelSnapshot,
  validateGenericModelSnapshot,
  createGenericModelVersion,
  createGenericModelChecksum,
} from '../../runtime/generic-model/index.js';
import { MODELOBASE1_MODEL_ID } from './mapModeloBase1RuntimeReadToGenericModel.js';

/**
 * A PERSISTENCE BRIDGE that represents a ModeloBase1 local draft as a
 * GenericModelSnapshot and proves a safe round-trip through the generic in-memory
 * adapter. Pure/local-only: memory adapter, `persistenceReal:false`, no backend/
 * Prisma/fetch/storage. It does NOT replace the ModeloBase1 persistence layer —
 * it validates that ModeloBase1 drafts are representable in the generic kernel.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} persistence bridge
 */
export function createModeloBase1GenericPersistenceBridge(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const adapter = createGenericModelInMemoryAdapter({ storageMode: 'memory_validation' });

  /**
   * Builds a GenericModelSnapshot from a ModeloBase1 local draft.
   * @param {Object} draft The controller draft ({ table:{rows}, form }).
   * @param {Object} [opts]
   * @param {number} [opts.draftVersion]
   * @param {() => string} [opts.clock]
   * @returns {Object} snapshot or generic error
   */
  function toSnapshot(draft, opts = {}) {
    const d = isGenericModelPlainObject(draft) ? draft : {};
    const data = {
      table: isGenericModelPlainObject(d.table) ? { columns: d.table.columns ?? [], rows: d.table.rows ?? [] } : { columns: [], rows: [] },
      form: isGenericModelPlainObject(d.form) ? d.form : null,
    };
    return createGenericModelSnapshot({
      modelId: MODELOBASE1_MODEL_ID,
      moduleId,
      modelType: 'cadastro',
      data,
      draftVersion: opts.draftVersion,
      clock: opts.clock,
    });
  }

  /**
   * Round-trips a ModeloBase1 draft: snapshot → validate → save → load → return.
   * Everything is local/in-memory; nothing is persisted for real.
   * @param {Object} draft
   * @returns {Object}
   */
  function roundTrip(draft) {
    const snapshot = toSnapshot(draft);
    if (snapshot.kind !== 'generic-model-snapshot') {
      return { ok: false, snapshot: null, validation: { valid: false }, persistenceReal: false, error: snapshot };
    }
    const validation = validateGenericModelSnapshot({ snapshot, moduleId });
    if (!validation.valid) {
      return { ok: false, snapshot, validation, persistenceReal: false };
    }
    const saved = adapter.saveSnapshot(snapshot);
    const loaded = adapter.loadSnapshot(snapshot.snapshotId);
    return {
      ok: saved.ok && loaded.ok,
      snapshot,
      loaded: loaded.snapshot ?? null,
      validation,
      storageMode: adapter.storageMode,
      persistenceReal: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
    };
  }

  return {
    kind: 'modelobase1-generic-persistence-bridge',
    moduleId,
    adapter,
    toSnapshot,
    validateSnapshot: (snapshot) => validateGenericModelSnapshot({ snapshot, moduleId }),
    roundTrip,
    version: (opts = {}) => createGenericModelVersion({ modelId: MODELOBASE1_MODEL_ID, moduleId, draftVersion: opts.draftVersion, clock: opts.clock }),
    checksum: (value) => createGenericModelChecksum({ value }),
  };
}

export default createModeloBase1GenericPersistenceBridge;
