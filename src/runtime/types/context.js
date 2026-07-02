/**
 * Runtime context types.
 * @see docs/runtime-implementation/03-INTERFACES.md
 */

/**
 * @typedef {'web' | 'mobile' | 'desktop' | 'embedded'} RuntimeHost
 */

/**
 * @typedef {'dev' | 'staging' | 'prod'} RuntimeEnvironment
 */

/**
 * @typedef {Object} BootstrapConfig
 * @property {RuntimeHost} host
 * @property {string} tenantId
 * @property {string} applicationId
 * @property {RuntimeEnvironment} environment
 * @property {string} apiBaseUrl
 */

/**
 * @typedef {Object} RuntimeInstance
 * @property {import('./uec.js').AccessScope} accessScope
 * @property {import('../core/context/RuntimeContext.js').RuntimeContext} context
 * @property {BootstrapConfig} config
 * @property {'RT-0'|'RT-3'} phase
 * @property {'shell-ready'|'hydrated'|'destroyed'} status
 * @property {import('../core/registry/registryManager.js').RegistryManager|null} [registry]
 * @property {import('./crb.js').RuntimeBundle|null} [bundle]
 * @property {() => Promise<void>} destroy
 */

/**
 * @typedef {Object} HydratedRuntime
 * @property {RuntimeInstance} instance
 * @property {import('./crb.js').RuntimeBundle} bundle
 * @property {import('../core/registry/registryManager.js').RegistryManager} registry
 */

/**
 * @typedef {Object} CrbReference
 * @property {string} bundleId
 * @property {string} definitionVersionId
 * @property {string} [moduleId]
 * @property {import('./crb.js').CrbPayload} [payload]
 */

export {};
