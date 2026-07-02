/**
 * @typedef {import('../core/registry/registryTypes.js').RegistryType} RegistryType
 * @typedef {() => T} RegistryFactory
 * @template T
 */

/**
 * @typedef {Object} IRegistry
 * @property {(type: RegistryType, key: string, factory: RegistryFactory) => void} register
 * @property {(type: RegistryType, key: string) => unknown} resolve
 * @property {(type: RegistryType, key: string) => boolean} has
 * @property {(type: RegistryType) => string[]} keys
 */

export {};
