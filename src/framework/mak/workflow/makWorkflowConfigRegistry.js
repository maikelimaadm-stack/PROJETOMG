/**
 * Registry da Workflow Configuration Engine por módulo.
 */
const engines = new Map();

export function registerMakWorkflowConfigEngine(moduleId, engine) {
  if (!moduleId) throw new Error("registerMakWorkflowConfigEngine: moduleId é obrigatório.");
  engines.set(moduleId, engine);
}

export function getMakWorkflowConfigEngine(moduleId) {
  return engines.get(moduleId) ?? null;
}

export function listMakWorkflowConfigEngines() {
  return [...engines.entries()].map(([id, engine]) => ({ moduleId: id, engine }));
}

export function hasMakWorkflowConfigEngine(moduleId) {
  return engines.has(moduleId);
}

export default {
  registerMakWorkflowConfigEngine,
  getMakWorkflowConfigEngine,
  listMakWorkflowConfigEngines,
  hasMakWorkflowConfigEngine,
};
