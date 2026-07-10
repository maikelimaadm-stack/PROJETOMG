/**
 * Generic CRUD module descriptor — plain metadata only, never behavior/data.
 * @typedef {Object} GenericModuleDescriptor
 * @property {string} moduleId
 * @property {string} [moduleName]
 * @property {string} [entityName]
 * @property {import('./shadow-table-form.js').TableFormFieldDescriptor[]} fields
 * @property {{ columns?: import('./shadow-table-form.js').TableColumnDescriptor[], actions?: import('./shadow-table-form.js').ActionMetadata[] }} [table]
 * @property {{ actions?: import('./shadow-table-form.js').ActionMetadata[], workflows?: Array<{id: string, ref: string}> }} [form]
 * @property {string[]} [requiredFields]
 * @property {Record<string, unknown>} [meta]
 */

/**
 * @typedef {Object} GenericModuleShadowReport
 * @property {boolean} skipped
 * @property {string} moduleId
 * @property {boolean} [ok]
 * @property {boolean} [equivalent]
 * @property {import('./shadow.js').ShadowComparison} [comparison]
 * @property {import('./shadow-table-form.js').TableFormProjectionResult} [legacySnapshot]
 * @property {import('./shadow-table-form.js').TableFormProjectionResult} [runtimeProjection]
 * @property {{name: string, message: string}} [error]
 * @property {number} timestamp
 * @property {string} [reason]
 */

/**
 * @typedef {Object} GenericModuleDiagnostics
 * @property {boolean} enabled
 * @property {string} moduleId
 * @property {number} runCount
 * @property {number} failureCount
 * @property {Array<{id: string, ok: boolean, detail: unknown, timestamp: number}>} records
 */

export {};
