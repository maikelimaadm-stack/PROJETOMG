const listeners = new Map();

/**
 * Event bus leve para comunicação entre módulos MAK (cross-cutting UX).
 */
export function subscribeMakEvent(eventName, handler) {
  if (typeof handler !== "function") {
    throw new TypeError("subscribeMakEvent: handler must be a function");
  }
  const set = listeners.get(eventName) ?? new Set();
  set.add(handler);
  listeners.set(eventName, set);
  return () => {
    set.delete(handler);
    if (set.size === 0) listeners.delete(eventName);
  };
}

export function emitMakEvent(eventName, payload) {
  const set = listeners.get(eventName);
  if (!set) return;
  for (const handler of set) {
    handler(payload);
  }
}

export function clearMakEventListeners(eventName) {
  if (eventName) {
    listeners.delete(eventName);
    return;
  }
  listeners.clear();
}
