/** @type {Map<string, object>} */
const importConfigs = new Map();

/**
 * Registra configuração de importação por moduleId.
 * @param {string} moduleId
 * @param {object} config
 */
export function registerMakImportModule(moduleId, config = {}) {
  const id = String(moduleId || "").trim();
  if (!id) throw new TypeError("registerMakImportModule: moduleId is required");
  importConfigs.set(id, { moduleId: id, ...config });
}

export function getMakImportModuleConfig(moduleId) {
  return importConfigs.get(String(moduleId || "").trim()) ?? null;
}

export function listMakImportModuleIds() {
  return [...importConfigs.keys()];
}

export function clearMakImportRegistry() {
  importConfigs.clear();
}
