import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelInMemoryAdapter } from '../../runtime/generic-model/index.js';
import {
  createModeloBase2OperationalSnapshot,
  validateModeloBase2OperationalSnapshot,
} from '../prototype-adapter/createModeloBase2OperationalSnapshot.js';
import { MODELOBASE2_DEFAULT_CREATED_AT } from './modeloBase2OperationalRuntimeConfig.js';

/**
 * A SNAPSHOT BRIDGE for the operational runtime. Builds/validates/restores local
 * snapshots via the generic kernel (checksum fail-closed, in-memory adapter). Never
 * persists for real. Pure aside from the in-memory store it owns.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.adapter] Injectable generic in-memory adapter.
 * @param {() => string} [options.clock]
 * @returns {Object} snapshot bridge
 */
export function createModeloBase2OperationalSnapshotBridge(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-runtime';
  const clock = typeof o.clock === 'function' ? o.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  const adapter = isGenericModelPlainObject(o.adapter) ? o.adapter : createGenericModelInMemoryAdapter({ storageMode: 'memory_validation' });

  /** Assemble a draft-like object from a session snapshot input (draft + events). */
  function draftFrom(input) {
    const i = isGenericModelPlainObject(input) ? input : {};
    const draft = isGenericModelPlainObject(i.draft) ? i.draft : {};
    const events = Array.isArray(i.events)
      ? i.events
      : (i.eventLog && typeof i.eventLog.list === 'function' ? i.eventLog.list() : (Array.isArray(draft.events) ? draft.events : []));
    return { ...draft, moduleId: typeof draft.moduleId === 'string' ? draft.moduleId : moduleId, entries: Array.isArray(draft.entries) ? draft.entries : [], events };
  }

  function createSnapshotFromSession(session) {
    return createModeloBase2OperationalSnapshot({ moduleId, draft: draftFrom(session), clock });
  }

  function validateSnapshot(snapshot) {
    return validateModeloBase2OperationalSnapshot({ snapshot });
  }

  /** Restore a plain session state from a snapshot WITHOUT mutating the snapshot. */
  function restoreSessionFromSnapshot(snapshot) {
    if (!isGenericModelPlainObject(snapshot) || snapshot.kind !== 'generic-model-snapshot') {
      return { ok: false, session: null, errors: ['snapshot is not a generic-model-snapshot'] };
    }
    const validation = validateSnapshot(snapshot);
    if (!validation.safeToUse) return { ok: false, session: null, errors: [...validation.errors, ...validation.blockers] };
    const data = isGenericModelPlainObject(snapshot.data) ? snapshot.data : {};
    const restored = safeCloneGenericModel({
      draft: isGenericModelPlainObject(data.draft) ? data.draft : { status: null },
      entries: Array.isArray(data.entries) ? data.entries : [],
      events: Array.isArray(data.events) ? data.events : [],
      summary: isGenericModelPlainObject(data.summary) ? data.summary : null,
      localOnly: true,
      persistenceReal: false,
      sent: false,
    });
    return { ok: true, session: restored, errors: [] };
  }

  function roundtripSnapshot(session) {
    const snapshot = createSnapshotFromSession(session);
    if (snapshot.kind !== 'generic-model-snapshot') return { ok: false, snapshot: null, saved: null, loaded: null, persistenceReal: false, storageMode: adapter.storageMode ?? null, errors: ['snapshot creation failed'] };
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

  function clearSnapshots() {
    return adapter.clearSnapshots();
  }

  return {
    kind: 'modelobase2-operational-snapshot-bridge',
    moduleId,
    storageMode: adapter.storageMode,
    localOnly: true,
    persistenceReal: false,
    createSnapshotFromSession,
    validateSnapshot,
    restoreSessionFromSnapshot,
    roundtripSnapshot,
    clearSnapshots,
  };
}

export default createModeloBase2OperationalSnapshotBridge;
