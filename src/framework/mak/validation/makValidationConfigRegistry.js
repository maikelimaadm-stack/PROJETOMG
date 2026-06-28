const registry = new Map();

export function registerMakValidationConfigEngine(moduleId, engine) {
  if (!moduleId) throw new Error("registerMakValidationConfigEngine: moduleId é obrigatório.");
  registry.set(moduleId, engine);
  return engine;
}

export function getMakValidationConfigEngine(moduleId) {
  return registry.get(moduleId) ?? null;
}

export function listMakValidationConfigEngines() {
  return [...registry.entries()].map(([moduleId, engine]) => ({ moduleId, engine }));
}

export function hasMakValidationConfigEngine(moduleId) {
  return registry.has(moduleId);
}

export default {
  registerMakValidationConfigEngine,
  getMakValidationConfigEngine,
  listMakValidationConfigEngines,
  hasMakValidationConfigEngine,
};
