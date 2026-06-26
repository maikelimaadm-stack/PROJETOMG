/**
 * Contrato mínimo de módulo MAK Framework v1.
 * @typedef {Object} MakModuleConfig
 * @property {string} moduleId
 * @property {string} entityName
 * @property {string} singularLabel
 * @property {string} pluralLabel
 * @property {object} repository
 * @property {object} [api]
 * @property {object} [schema]
 */

const REQUIRED_KEYS = ["moduleId", "entityName", "singularLabel", "pluralLabel", "repository"];

/**
 * Valida definição de módulo cadastro/MAK.
 * @param {unknown} config
 * @returns {asserts config is MakModuleConfig}
 */
export function assertMakModuleConfig(config) {
  if (!config || typeof config !== "object") {
    throw new TypeError("MakModuleConfig: config must be an object");
  }
  for (const key of REQUIRED_KEYS) {
    if (!(key in config) || config[key] == null || config[key] === "") {
      throw new TypeError(`MakModuleConfig: missing required key "${key}"`);
    }
  }
  if (typeof config.moduleId !== "string") {
    throw new TypeError("MakModuleConfig: moduleId must be a string");
  }
}

/**
 * @param {unknown} config
 * @returns {boolean}
 */
export function isMakModuleConfig(config) {
  try {
    assertMakModuleConfig(config);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normaliza metadados de exibição a partir de definição cadastro.
 * @param {MakModuleConfig} config
 */
export function resolveMakModuleLabels(config) {
  assertMakModuleConfig(config);
  return {
    moduleId: config.moduleId,
    title: config.pluralLabel,
    singular: config.singularLabel,
    plural: config.pluralLabel,
    entityName: config.entityName,
  };
}
