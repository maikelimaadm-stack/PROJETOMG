/**
 * Cache em memória com TTL — nível 2 do cache multinível.
 */
const store = new Map();

export class MemoryCache {
  get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs = 60_000) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key) {
    store.delete(key);
  }

  invalidatePrefix(prefix) {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  }

  clear() {
    store.clear();
  }
}

export const globalMemoryCache = new MemoryCache();
