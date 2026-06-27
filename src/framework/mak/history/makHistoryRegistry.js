/** @type {Map<string, object>} */
const historyConfigs = new Map();

export function registerMakHistoryModule(moduleId, config = {}) {
  const id = String(moduleId || "").trim();
  if (!id) throw new TypeError("registerMakHistoryModule: moduleId is required");
  historyConfigs.set(id, { moduleId: id, ...config });
}

export function getMakHistoryModuleConfig(moduleId) {
  return historyConfigs.get(String(moduleId || "").trim()) ?? null;
}

export function listMakHistoryModuleIds() {
  return [...historyConfigs.keys()];
}

export function clearMakHistoryRegistry() {
  historyConfigs.clear();
}
