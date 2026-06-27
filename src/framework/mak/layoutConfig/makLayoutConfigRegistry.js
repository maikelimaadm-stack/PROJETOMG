const engines = new Map();

/**
 * @param {string} moduleId
 * @param {ReturnType<import("./createMakLayoutConfigEngine.js").createMakLayoutConfigEngine>} engine
 */
export function registerMakLayoutConfigEngine(moduleId, engine) {
  engines.set(moduleId, engine);
}

/** @param {string} moduleId */
export function getMakLayoutConfigEngine(moduleId) {
  return engines.get(moduleId) ?? null;
}

export function listMakLayoutConfigEngines() {
  return [...engines.values()];
}

export function hasMakLayoutConfigEngine(moduleId) {
  return engines.has(moduleId);
}
