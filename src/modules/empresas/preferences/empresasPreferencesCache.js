import {
  getActiveUserPreferencesScope,
  isListagemLegacyPreferenceField,
  preferenceEventMatchesScope,
  resolveListagemPreferenceStorageKey,
} from "@/shared/preferences/userPreferencesScope.js";

const EMP_PREFERENCES_CACHE_EVENT = "emp-preferences-cache-updated";

const cacheState = {
  initialized: false,
  map: new Map(),
  batchDepth: 0,
  pendingBatchKeys: new Set(),
  pendingBatchReason: "batch",
};

const canUseWindowStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const ensureCacheHydrated = () => {
  if (cacheState.initialized || !canUseWindowStorage()) return;
  cacheState.initialized = true;
  const storage = window.localStorage;
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;
    cacheState.map.set(key, storage.getItem(key));
  }
};

const resolvePreferenceStorageKey = (legacyOrScopedKey) => {
  const key = String(legacyOrScopedKey || "").trim();
  if (!key) return key;
  if (key.startsWith("mg_pref_v2:")) return key;
  if (isListagemLegacyPreferenceField(key) || key.startsWith("emp_")) {
    return resolveListagemPreferenceStorageKey(key);
  }
  return key;
};

const readRawPreferenceText = (storageKey, fallback = null) => {
  if (!canUseWindowStorage()) return fallback;
  ensureCacheHydrated();
  const normalizedKey = String(storageKey || "").trim();
  if (!normalizedKey) return fallback;
  if (cacheState.map.has(normalizedKey)) {
    const cached = cacheState.map.get(normalizedKey);
    return cached ?? fallback;
  }
  try {
    const fromStorage = window.localStorage.getItem(normalizedKey);
    if (fromStorage != null) {
      cacheState.map.set(normalizedKey, fromStorage);
      return fromStorage;
    }
  } catch {
    return fallback;
  }
  return fallback;
};

const emitCacheUpdate = (keys, reason = "update") => {
  if (typeof window === "undefined") return;
  const scope = getActiveUserPreferencesScope();
  if (cacheState.batchDepth > 0) {
    keys.forEach((key) => cacheState.pendingBatchKeys.add(key));
    cacheState.pendingBatchReason = reason || cacheState.pendingBatchReason;
    return;
  }
  window.dispatchEvent(
    new CustomEvent(EMP_PREFERENCES_CACHE_EVENT, {
      detail: {
        keys: [...new Set(keys)].filter(Boolean),
        reason: reason || "update",
        clienteId: scope.clienteId,
        userId: scope.userId,
        version: "v2",
      },
    })
  );
};

const commitStorageValue = (key, value) => {
  if (!canUseWindowStorage()) return false;
  ensureCacheHydrated();
  const normalizedKey = String(key || "").trim();
  if (!normalizedKey) return false;
  const normalizedValue = value == null ? null : String(value);
  const previousValue = cacheState.map.get(normalizedKey) ?? null;
  if (previousValue === normalizedValue) return false;
  try {
    if (normalizedValue == null) {
      window.localStorage.removeItem(normalizedKey);
      cacheState.map.delete(normalizedKey);
    } else {
      window.localStorage.setItem(normalizedKey, normalizedValue);
      cacheState.map.set(normalizedKey, normalizedValue);
    }
    return true;
  } catch {
    return false;
  }
};

export const resetEmpPreferencesMemoryCache = () => {
  cacheState.initialized = false;
  cacheState.map.clear();
  cacheState.batchDepth = 0;
  cacheState.pendingBatchKeys.clear();
  cacheState.pendingBatchReason = "batch";
};

export const withEmpPreferencesCacheBatch = (callback, reason = "batch") => {
  cacheState.batchDepth += 1;
  try {
    return callback?.();
  } finally {
    cacheState.batchDepth = Math.max(0, cacheState.batchDepth - 1);
    if (cacheState.batchDepth === 0 && cacheState.pendingBatchKeys.size > 0) {
      const keys = [...cacheState.pendingBatchKeys];
      const pendingReason = cacheState.pendingBatchReason || reason;
      cacheState.pendingBatchKeys.clear();
      cacheState.pendingBatchReason = "batch";
      emitCacheUpdate(keys, pendingReason);
    }
  }
};

export const readEmpPreferencesText = (key, fallback = null) => {
  const legacyKey = String(key || "").trim();
  if (!legacyKey) return fallback;

  const scopedKey = resolvePreferenceStorageKey(legacyKey);
  const scopedValue = readRawPreferenceText(scopedKey, null);
  if (scopedValue != null) return scopedValue;

  if (scopedKey !== legacyKey) {
    const legacyValue = readRawPreferenceText(legacyKey, null);
    if (legacyValue != null) return legacyValue;
  }

  return fallback;
};

export const readEmpPreferencesJson = (key, fallback = null) => {
  const raw = readEmpPreferencesText(key, null);
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeEmpPreferencesText = (key, value, { reason = "update", emit = true } = {}) => {
  const scopedKey = resolvePreferenceStorageKey(key);
  const changed = commitStorageValue(scopedKey, value);
  if (changed && emit) {
    emitCacheUpdate([scopedKey, key], reason);
  }
  return changed;
};

export const writeEmpPreferencesJson = (key, value, options = {}) => {
  let serialized = null;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false;
  }
  return writeEmpPreferencesText(key, serialized, options);
};

export const removeEmpPreferencesKey = (key, { reason = "remove", emit = true } = {}) =>
  writeEmpPreferencesText(key, null, { reason, emit });

export const hasScopedPreferenceValue = (legacyKey) =>
  readRawPreferenceText(resolvePreferenceStorageKey(legacyKey), null) != null;

export const subscribeEmpPreferencesCache = (listener) => {
  if (typeof window === "undefined" || typeof listener !== "function") {
    return () => {};
  }
  const handler = (event) => {
    const detail = event?.detail || {};
    if (!preferenceEventMatchesScope(detail)) return;
    listener(detail);
  };
  window.addEventListener(EMP_PREFERENCES_CACHE_EVENT, handler);
  return () => window.removeEventListener(EMP_PREFERENCES_CACHE_EVENT, handler);
};

export const emitEmpPreferencesCacheUpdate = (keys = [], reason = "update") => {
  const resolvedKeys = (Array.isArray(keys) ? keys : [keys])
    .filter(Boolean)
    .flatMap((key) => {
      const scoped = resolvePreferenceStorageKey(key);
      return scoped === key ? [key] : [scoped, key];
    });
  emitCacheUpdate(resolvedKeys, reason);
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    const key = event?.key;
    if (!key) return;
    ensureCacheHydrated();
    cacheState.map.set(key, event.newValue ?? null);
    emitCacheUpdate([key], "storage");
  });
}

export const EMP_PREFERENCES_CACHE_UPDATED_EVENT = EMP_PREFERENCES_CACHE_EVENT;
