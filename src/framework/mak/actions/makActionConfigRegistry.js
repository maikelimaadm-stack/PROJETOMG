/**
 * Registry da Actions Configuration Engine por módulo.
 */
const engines = new Map();

export function registerMakActionConfigEngine(moduleId, engine) {
  if (!moduleId) throw new Error("registerMakActionConfigEngine: moduleId é obrigatório.");
  engines.set(moduleId, engine);
}

export function getMakActionConfigEngine(moduleId) {
  return engines.get(moduleId) ?? null;
}

export function listMakActionConfigEngines() {
  return [...engines.entries()].map(([id, engine]) => ({ moduleId: id, engine }));
}

export function hasMakActionConfigEngine(moduleId) {
  return engines.has(moduleId);
}

export default {
  registerMakActionConfigEngine,
  getMakActionConfigEngine,
  listMakActionConfigEngines,
  hasMakActionConfigEngine,
};
