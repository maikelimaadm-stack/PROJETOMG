const registry = new Map();

export function registerMakFormulaConfigEngine(moduleId, engine) {
  if (!moduleId) throw new Error("registerMakFormulaConfigEngine: moduleId é obrigatório.");
  registry.set(moduleId, engine);
  return engine;
}

export function getMakFormulaConfigEngine(moduleId) {
  return registry.get(moduleId) ?? null;
}

export function listMakFormulaConfigEngines() {
  return [...registry.entries()].map(([moduleId, engine]) => ({ moduleId, engine }));
}

export function hasMakFormulaConfigEngine(moduleId) {
  return registry.has(moduleId);
}

export default {
  registerMakFormulaConfigEngine,
  getMakFormulaConfigEngine,
  listMakFormulaConfigEngines,
  hasMakFormulaConfigEngine,
};
