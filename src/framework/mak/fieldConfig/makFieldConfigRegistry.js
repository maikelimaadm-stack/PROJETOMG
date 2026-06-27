const engines = new Map();

/** @param {string} moduleId @param {ReturnType<import("./createMakFieldConfigEngine.js").createMakFieldConfigEngine>} engine */
export function registerMakFieldConfigEngine(moduleId, engine) {
  engines.set(moduleId, engine);
}

/** @param {string} moduleId */
export function getMakFieldConfigEngine(moduleId) {
  return engines.get(moduleId) ?? null;
}

export function listMakFieldConfigEngines() {
  return [...engines.values()];
}

export function hasMakFieldConfigEngine(moduleId) {
  return engines.has(moduleId);
}
