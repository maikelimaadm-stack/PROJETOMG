/** Evaluation Cache — official single cache (Program 2.3.5) */

export function createEvaluationCache() {
  const store = new Map();

  const makeKey = (ownerId, contextSnap) => `${ownerId}:${JSON.stringify(contextSnap?.variables ?? {})}`;

  return Object.freeze({
    get(ownerId, contextSnap) {
      const key = makeKey(ownerId, contextSnap);
      const entry = store.get(key);
      if (!entry) return null;
      return entry.result;
    },
    set(ownerId, contextSnap, result) {
      const key = makeKey(ownerId, contextSnap);
      store.set(key, Object.freeze({ result, cachedAt: Date.now() }));
      return result;
    },
    invalidate(ownerId) {
      [...store.keys()].forEach((key) => {
        if (key.startsWith(`${ownerId}:`)) store.delete(key);
      });
    },
    clear() {
      store.clear();
    },
    size() {
      return store.size;
    },
  });
}

export default createEvaluationCache;
