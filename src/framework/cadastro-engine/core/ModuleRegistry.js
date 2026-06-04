/** @type {Map<string, import('./CadastroModuleConfig.js').CadastroModuleConfig>} */
const modules = new Map();

/**
 * @param {import('./CadastroModuleConfig.js').CadastroModuleConfig} config
 */
export function registerCadastroModule(config) {
  modules.set(config.moduleId, config);
  return config;
}

/** @param {string} moduleId */
export function getCadastroModule(moduleId) {
  const config = modules.get(moduleId);
  if (!config) {
    throw new Error(`Módulo de cadastro não registrado: ${moduleId}`);
  }
  return config;
}

export function hasCadastroModule(moduleId) {
  return modules.has(moduleId);
}

export function listCadastroModules() {
  return [...modules.values()];
}

export function resetCadastroModules() {
  modules.clear();
}
