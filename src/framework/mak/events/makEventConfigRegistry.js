/**
 * Registry da Events Configuration Engine por módulo.
 */
const engines = new Map();

export function registerMakEventConfigEngine(moduleId, engine) {
  if (!moduleId) throw new Error("registerMakEventConfigEngine: moduleId é obrigatório.");
  engines.set(moduleId, engine);
}

export function getMakEventConfigEngine(moduleId) {
  return engines.get(moduleId) ?? null;
}

export function listMakEventConfigEngines() {
  return [...engines.entries()].map(([id, engine]) => ({ moduleId: id, engine }));
}

export function hasMakEventConfigEngine(moduleId) {
  return engines.has(moduleId);
}

export default {
  registerMakEventConfigEngine,
  getMakEventConfigEngine,
  listMakEventConfigEngines,
  hasMakEventConfigEngine,
};
