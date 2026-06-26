/** @type {Map<string, (userId: string | null) => object>} */
const bootstrapHooks = new Map();

/**
 * Registra hook de bootstrap de preferências para um moduleId.
 * @param {string} moduleId
 * @param {(userId: string | null) => object} useBootstrapHook
 */
export function registerMakPreferencesBootstrapModule(moduleId, useBootstrapHook) {
  const id = String(moduleId || "").trim();
  if (!id) {
    throw new TypeError("registerMakPreferencesBootstrapModule: moduleId is required");
  }
  if (typeof useBootstrapHook !== "function") {
    throw new TypeError("registerMakPreferencesBootstrapModule: hook must be a function");
  }
  bootstrapHooks.set(id, useBootstrapHook);
}

export function getMakPreferencesBootstrapHook(moduleId) {
  return bootstrapHooks.get(String(moduleId || "").trim()) ?? null;
}

export function listMakPreferencesBootstrapModuleIds() {
  return [...bootstrapHooks.keys()];
}

export function clearMakPreferencesBootstrapRegistry() {
  bootstrapHooks.clear();
}
