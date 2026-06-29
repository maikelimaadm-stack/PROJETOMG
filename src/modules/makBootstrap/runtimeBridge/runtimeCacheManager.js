import {
  RUNTIME_BRIDGE_CACHE_VERSION,
  RUNTIME_BRIDGE_HYDRATED_EVENT,
  RUNTIME_BRIDGE_RELOAD_EVENT,
} from "./runtimeBridgeConstants.js";
import { validateRuntimeBridgeCacheEnvelope } from "./runtimeValidation.js";
import { verifyRuntimeBridgeCacheIntegrity } from "./runtimeIntegrityCheck.js";

const memoryCache = new Map();
const hydrationSourceByModule = new Map();

const STORAGE_PREFIX = "mak:runtime-bridge:";

const readSessionCache = (moduleId) => {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${moduleId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSessionCache = (moduleId, envelope) => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${moduleId}`, JSON.stringify(envelope));
  } catch {
    // quota or private mode — memory cache remains authoritative
  }
};

const clearSessionCache = (moduleId) => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${moduleId}`);
  } catch {
    // noop
  }
};

/**
 * @param {string} moduleId
 * @param {object} envelope
 * @param {"boot-cache"|"api"|"export"} source
 */
export function setRuntimeCrbCache(moduleId, envelope, source = "boot-cache") {
  const validation = validateRuntimeBridgeCacheEnvelope(envelope);
  if (!validation.valid) {
    throw new Error(`Runtime cache inválido (${moduleId}): ${validation.errors.join(" ")}`);
  }
  const integrity = verifyRuntimeBridgeCacheIntegrity(envelope);
  if (!integrity.ok) {
    throw new Error(`Runtime cache integrity failed (${moduleId}): ${integrity.reason}`);
  }

  memoryCache.set(moduleId, envelope);
  hydrationSourceByModule.set(moduleId, source);
  writeSessionCache(moduleId, envelope);
}

/** @param {string} moduleId */
export function getRuntimeCrbCache(moduleId) {
  if (memoryCache.has(moduleId)) return memoryCache.get(moduleId);
  const session = readSessionCache(moduleId);
  if (session) {
    memoryCache.set(moduleId, session);
    return session;
  }
  return null;
}

/** @param {string} moduleId */
export function invalidateRuntimeCache(moduleId) {
  memoryCache.delete(moduleId);
  hydrationSourceByModule.delete(moduleId);
  clearSessionCache(moduleId);
}

export function clearAllRuntimeCaches() {
  [...memoryCache.keys()].forEach((moduleId) => invalidateRuntimeCache(moduleId));
}

/** @param {string} moduleId */
export function getRuntimeHydrationSource(moduleId) {
  return hydrationSourceByModule.get(moduleId) ?? null;
}

export function listRuntimeHydratedModules() {
  return [...memoryCache.keys()];
}

export function getRuntimeBridgeCacheSnapshot() {
  return {
    version: RUNTIME_BRIDGE_CACHE_VERSION,
    modules: listRuntimeHydratedModules().map((moduleId) => ({
      moduleId,
      source: getRuntimeHydrationSource(moduleId),
      versionId: getRuntimeCrbCache(moduleId)?.versionId ?? null,
      integrityHash: getRuntimeCrbCache(moduleId)?.integrityHash ?? null,
    })),
  };
}

export function emitRuntimeBridgeHydrated(moduleId, detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(RUNTIME_BRIDGE_HYDRATED_EVENT, {
      detail: { moduleId, ...detail },
    })
  );
}

export function emitRuntimeBridgeReloaded(moduleId, detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(RUNTIME_BRIDGE_RELOAD_EVENT, {
      detail: { moduleId, ...detail },
    })
  );
}
