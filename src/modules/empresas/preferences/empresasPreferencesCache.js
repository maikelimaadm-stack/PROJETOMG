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

const emitCacheUpdate = (keys, reason = "update") => {
  if (typeof window === "undefined") return;
  if (cacheState.batchDepth > 0) {
    keys.forEach((key) => cacheState.pendingBatchKeys.add(key));
    cacheState.pendingBatchReason = reason || cacheState.pendingBatchReason;
    return;
  }
  window.dispatchEvent(
    new CustomEvent(EMP_PREFERENCES_CACHE_EVENT, {
      detail: { keys: [...new Set(keys)].filter(Boolean), reason: reason || "update" },
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
  if (!canUseWindowStorage()) return fallback;
  ensureCacheHydrated();
  const normalizedKey = String(key || "").trim();
  if (!normalizedKey) return fallback;
  if (cacheState.map.has(normalizedKey)) {
    return cacheState.map.get(normalizedKey);
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
  const changed = commitStorageValue(key, value);
  if (changed && emit) {
    emitCacheUpdate([key], reason);
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

export const subscribeEmpPreferencesCache = (listener) => {
  if (typeof window === "undefined" || typeof listener !== "function") {
    return () => {};
  }
  const handler = (event) => listener(event?.detail || {});
  window.addEventListener(EMP_PREFERENCES_CACHE_EVENT, handler);
  return () => window.removeEventListener(EMP_PREFERENCES_CACHE_EVENT, handler);
};

export const emitEmpPreferencesCacheUpdate = (keys = [], reason = "update") => {
  emitCacheUpdate(Array.isArray(keys) ? keys : [keys], reason);
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
