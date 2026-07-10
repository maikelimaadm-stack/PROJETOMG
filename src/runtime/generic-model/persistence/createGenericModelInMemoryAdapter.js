import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { validateGenericModelSnapshot } from './validateGenericModelSnapshot.js';

/**
 * An IN-MEMORY, injectable, deterministic persistence adapter for Generic Model
 * snapshots. It VALIDATES the persistence contract — it is NOT real persistence:
 * no backend, no Prisma, no fetch, no `localStorage`/`sessionStorage`/
 * `IndexedDB`. Snapshots live in a plain Map for the adapter's lifetime. Every
 * method returns a structured, local-only result; every read returns a safe
 * copy; inputs are never mutated.
 *
 * @param {Object} [options]
 * @param {'memory_validation'|'injected_adapter_validation'} [options.storageMode]
 * @returns {Object} adapter
 */
export function createGenericModelInMemoryAdapter(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const storageMode = o.storageMode === 'injected_adapter_validation' ? 'injected_adapter_validation' : 'memory_validation';

  /** @type {Map<string, Object>} */
  const store = new Map();
  let reads = 0;
  let writes = 0;

  const envelope = (extra) => ({
    localOnly: true,
    storageMode,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    errors: [],
    warnings: [],
    ...extra,
  });

  const matches = (snap, filter) => {
    if (!isGenericModelPlainObject(filter)) return true;
    if (filter.moduleId && snap.moduleId !== filter.moduleId) return false;
    if (filter.modelId && snap.modelId !== filter.modelId) return false;
    return true;
  };

  function saveSnapshot(snapshot) {
    const validation = validateGenericModelSnapshot({ snapshot });
    if (!validation.safeToUse) {
      return envelope({ ok: false, operation: 'saveSnapshot', errors: [...validation.errors, ...validation.blockers] });
    }
    writes += 1;
    store.set(snapshot.snapshotId, safeCloneGenericModel(snapshot));
    return envelope({ ok: true, operation: 'saveSnapshot', snapshotId: snapshot.snapshotId, snapshotCount: store.size });
  }

  function loadSnapshot(snapshotId) {
    reads += 1;
    const found = store.get(snapshotId);
    if (!found) return envelope({ ok: false, operation: 'loadSnapshot', snapshotId, errors: ['snapshot not found'] });
    return envelope({ ok: true, operation: 'loadSnapshot', snapshotId, snapshot: safeCloneGenericModel(found) });
  }

  function listSnapshots(filter) {
    reads += 1;
    const ids = [];
    for (const [id, snap] of store.entries()) {
      if (matches(snap, filter)) ids.push(id);
    }
    return envelope({ ok: true, operation: 'listSnapshots', filter: isGenericModelPlainObject(filter) ? { ...filter } : null, snapshotIds: ids.sort(), snapshotCount: ids.length });
  }

  function deleteSnapshot(snapshotId) {
    const existed = store.delete(snapshotId);
    return envelope({ ok: existed, operation: 'deleteSnapshot', snapshotId, snapshotCount: store.size, errors: existed ? [] : ['snapshot not found'] });
  }

  function clearSnapshots(filter) {
    let removed = 0;
    for (const [id, snap] of [...store.entries()]) {
      if (matches(snap, filter)) {
        store.delete(id);
        removed += 1;
      }
    }
    return envelope({ ok: true, operation: 'clearSnapshots', removed, snapshotCount: store.size });
  }

  function getDiagnostics() {
    return envelope({ ok: true, operation: 'getDiagnostics', snapshotCount: store.size, reads, writes, mandatoryStorage: false, noSideEffects: true });
  }

  return {
    kind: 'generic-model-in-memory-adapter',
    storageMode,
    saveSnapshot,
    loadSnapshot,
    listSnapshots,
    deleteSnapshot,
    clearSnapshots,
    getDiagnostics,
  };
}

export default createGenericModelInMemoryAdapter;
