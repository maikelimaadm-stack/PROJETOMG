/**
 * @typedef {Object} ResourceRef
 * @property {string} bundleId
 * @property {string} [tenantId]
 * @property {string} [definitionVersionId]
 */

/**
 * @typedef {Object} ILoader
 * @property {(ref: ResourceRef, ctx?: import('./loader.js').LoaderContext) => Promise<object>} load
 * @property {(ref: ResourceRef) => Promise<object>} loadCached
 * @property {(ref: ResourceRef) => void} invalidate
 */

export {};
