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
 * @property {'RT-0'} phase
 * @property {'shell-ready' | 'destroyed'} status
 * @property {() => Promise<void>} destroy
 */

/**
 * @typedef {Object} CrbReference
 * @property {string} bundleId
 * @property {string} [definitionVersionId]
 */

export {};
