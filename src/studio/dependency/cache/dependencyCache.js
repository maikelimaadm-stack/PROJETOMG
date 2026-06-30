/** Dependency Cache — official cache layer (Program 2.3.3) */

export function createDependencyCache() {
  const store = new Map();

  return Object.freeze({
    get(key) {
      return store.get(key) ?? null;
    },
    set(key, snapshot, metadata = {}) {
      store.set(key, Object.freeze({
        snapshot,
        cachedAt: Date.now(),
        metadata: Object.freeze(metadata),
      }));
      return store.get(key);
    },
    has(key) {
      return store.has(key);
    },
    invalidate(key) {
      if (key === "*") {
        store.clear();
        return [...store.keys()];
      }
      const removed = [];
      [...store.keys()].forEach((k) => {
        if (k === key || k.startsWith(`${key}:`)) {
          store.delete(k);
          removed.push(k);
        }
      });
      return removed;
    },
    keys() {
      return [...store.keys()];
    },
  });
}

export default createDependencyCache;
