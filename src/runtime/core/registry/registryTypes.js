/** @typedef {'entity'|'field'|'layout'|'validation'|'route'|'permission'|'action'|'workflow'|'renderer'|'handler'|'connector'|'plugin'} RegistryType */

/** @type {RegistryType[]} */
export const REGISTRY_TYPES = Object.freeze([
  'entity',
  'field',
  'layout',
  'validation',
  'route',
  'permission',
  'action',
  'workflow',
  'renderer',
  'handler',
  'connector',
  'plugin',
]);

/**
 * @param {string} type
 * @returns {type is RegistryType}
 */
export function isRegistryType(type) {
  return REGISTRY_TYPES.includes(/** @type {RegistryType} */ (type));
}
