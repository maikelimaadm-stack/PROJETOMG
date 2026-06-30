/** Studio Shell localStorage persistence — Program 2.1B */

const STORAGE_PREFIX = "mak-studio:v1";

export function buildPersistenceKey(moduleId, scopeId = "default") {
  return `${STORAGE_PREFIX}:${scopeId}:${moduleId}`;
}

/**
 * @param {string} key
 * @returns {{ dock?: object, tabs?: object, workspace?: object, panels?: object }|null}
 */
export function loadStudioPersistence(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {object} snapshot
 */
export function saveStudioPersistence(key, snapshot) {
  try {
    localStorage.setItem(key, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract persistable slices from domain state.
 * @param {object} state
 */
export function extractPersistableState(state) {
  return {
    dock: state.dock,
    tabs: state.tabs,
    workspace: {
      moduleId: state.workspace.moduleId,
      designerId: state.workspace.designerId,
    },
    panels: {
      left: state.tabs.left,
      right: state.tabs.right,
      bottom: state.tabs.bottom,
    },
    version: 1,
    savedAt: new Date().toISOString(),
  };
}

/**
 * Merge persisted data into initial domain state overrides.
 * @param {object|null} persisted
 * @param {object} base
 */
export function mergePersistedIntoInitialState(persisted, base = {}) {
  if (!persisted) return base;
  return {
    ...base,
    dock: persisted.dock ?? base.dock,
    tabs: persisted.tabs ?? base.tabs,
    workspace: {
      ...(base.workspace ?? {}),
      ...(persisted.workspace ?? {}),
    },
  };
}

/** Future sync adapter stub — user-scoped remote persistence. */
export function createStudioPersistenceSyncAdapter() {
  return Object.freeze({
    pull: async () => null,
    push: async () => ({ ok: false, reason: "not-configured" }),
  });
}

export default {
  buildPersistenceKey,
  loadStudioPersistence,
  saveStudioPersistence,
  extractPersistableState,
  mergePersistedIntoInitialState,
  createStudioPersistenceSyncAdapter,
};
