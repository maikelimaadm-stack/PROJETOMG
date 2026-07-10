import { isPlainObject, safeClone } from '../../safety.js';
import { validateModeloBase1LocalDraftSnapshot } from './validateModeloBase1LocalDraftSnapshot.js';
import { persistenceError } from './errors.js';

/**
 * An IN-MEMORY, injectable, deterministic persistence adapter for ModeloBase1
 * local draft snapshots. It exists to VALIDATE the persistence contract — it is
 * NOT real persistence: no backend, no Prisma, no fetch, no `localStorage`/
 * `sessionStorage`/`IndexedDB`. Snapshots live in a plain Map for the lifetime
 * of the adapter instance. Every method returns a structured, local-only result.
 * Never mutates inputs; every read returns a safe copy.
 *
 * @param {Object} [options]
 * @param {'memory_validation'|'injected_adapter_validation'} [options.storageMode]
 * @returns {Object} adapter
 */
export function createModeloBase1LocalPersistenceAdapter(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const storageMode = o.storageMode === 'injected_adapter_validation' ? 'injected_adapter_validation' : 'memory_validation';

  /** @type {Map<string, Object>} snapshotId -> snapshot */
  const store = new Map();
  let reads = 0;
  let writes = 0;

  const envelope = (extra) => ({
    localOnly: true,
    storageMode,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    errors: [],
    warnings: [],
    ...extra,
  });

  function saveSnapshot(snapshot) {
    const validation = validateModeloBase1LocalDraftSnapshot({ snapshot });
    if (!validation.safeToRehydrate) {
      return envelope({ ok: false, operation: 'saveSnapshot', errors: [...validation.errors, ...validation.blockers] });
    }
    writes += 1;
    store.set(snapshot.snapshotId, safeClone(snapshot));
    return envelope({ ok: true, operation: 'saveSnapshot', snapshotId: snapshot.snapshotId, snapshotCount: store.size });
  }

  function loadSnapshot(snapshotId) {
    reads += 1;
    const found = store.get(snapshotId);
    if (!found) return envelope({ ok: false, operation: 'loadSnapshot', snapshotId, errors: ['snapshot not found'] });
    return envelope({ ok: true, operation: 'loadSnapshot', snapshotId, snapshot: safeClone(found) });
  }

  function listSnapshots(moduleId) {
    reads += 1;
    const ids = [];
    for (const [id, snap] of store.entries()) {
      if (!moduleId || snap.moduleId === moduleId) ids.push(id);
    }
    return envelope({ ok: true, operation: 'listSnapshots', moduleId: moduleId ?? null, snapshotIds: ids.sort(), snapshotCount: ids.length });
  }

  function deleteSnapshot(snapshotId) {
    const existed = store.delete(snapshotId);
    return envelope({ ok: existed, operation: 'deleteSnapshot', snapshotId, snapshotCount: store.size, errors: existed ? [] : ['snapshot not found'] });
  }

  function clearModuleSnapshots(moduleId) {
    let removed = 0;
    for (const [id, snap] of [...store.entries()]) {
      if (!moduleId || snap.moduleId === moduleId) {
        store.delete(id);
        removed += 1;
      }
    }
    return envelope({ ok: true, operation: 'clearModuleSnapshots', moduleId: moduleId ?? null, removed, snapshotCount: store.size });
  }

  function getDiagnostics() {
    return envelope({
      ok: true,
      operation: 'getDiagnostics',
      snapshotCount: store.size,
      reads,
      writes,
      mandatoryStorage: false,
      noSideEffects: true,
    });
  }

  return {
    kind: 'modelobase1-local-persistence-adapter',
    storageMode,
    saveSnapshot,
    loadSnapshot,
    listSnapshots,
    deleteSnapshot,
    clearModuleSnapshots,
    getDiagnostics,
  };
}

/** @param {string} code @param {string} message */
export function localPersistenceAdapterError(code, message) {
  return persistenceError(/** @type {any} */ (code), message);
}

export default createModeloBase1LocalPersistenceAdapter;
