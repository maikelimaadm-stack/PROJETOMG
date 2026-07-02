/**
 * CRB and Runtime Bundle types.
 * @see docs/runtime-implementation/03-INTERFACES.md
 */

/**
 * @typedef {Object} EnvironmentPin
 * @property {string} tenantId
 * @property {string} applicationId
 * @property {'dev'|'staging'|'prod'} environment
 * @property {string} bundleId
 * @property {string} definitionVersionId
 * @property {string} [moduleId]
 * @property {string} [baseTemplateId]
 */

/**
 * @typedef {Object} CrbPayload
 * @property {'mmm-crb-v1'} crbVersion
 * @property {string} bundleId
 * @property {string} definitionVersionId
 * @property {string} tenantId
 * @property {string} moduleId
 * @property {string} [baseTemplateId]
 * @property {string} contentHash
 * @property {string} integrityHash
 * @property {string|null} signatureRef
 * @property {Record<string, Record<string, unknown[]>>} registries
 * @property {Array<{objectId: string, path: string, moduleId?: string}>} route
 * @property {unknown[]} menu
 * @property {unknown[]} objects
 * @property {{engines?: string[], views?: string[]}} [capabilities]
 * @property {{objectCount?: number, semver?: string}} [metadata]
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} valid
 * @property {string[]} errors
 * @property {number} validationsExecuted
 */

/**
 * @typedef {Object} HydrationResult
 * @property {boolean} success
 * @property {number} entriesRegistered
 * @property {string[]} registryTypes
 * @property {number} hydrationMs
 */

/**
 * @typedef {Object} RuntimeBundle
 * @property {CrbPayload} crb
 * @property {EnvironmentPin} pin
 * @property {'verified'|'hydrated'|'ready'} status
 * @property {import('./context.js').RuntimeMetricsSnapshot} [metrics]
 */

export {};
