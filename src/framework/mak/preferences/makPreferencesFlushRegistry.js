/**
 * Registry genérico de flush de preferências — multi-módulo.
 */
const FLUSH_TIMEOUT_MS = 5_000;

/** @type {Map<string, () => Promise<void>>} */
const flushHandlers = new Map();

export function registerMakPreferencesFlushHandler(moduleId, handler) {
  const id = String(moduleId || "").trim();
  if (!id) return;
  if (typeof handler !== "function") {
    flushHandlers.delete(id);
    return;
  }
  flushHandlers.set(id, handler);
}

export async function flushMakPreferencesNow(moduleIds = null) {
  const ids =
    Array.isArray(moduleIds) && moduleIds.length > 0
      ? moduleIds
      : [...flushHandlers.keys()];
  const handlers = ids
    .map((id) => flushHandlers.get(String(id)))
    .filter((handler) => typeof handler === "function");

  await Promise.allSettled(
    handlers.map((handler) =>
      Promise.race([
        handler(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("preferences flush timeout")), FLUSH_TIMEOUT_MS);
        }),
      ])
    )
  );
}

export function listMakPreferencesFlushModuleIds() {
  return [...flushHandlers.keys()];
}
