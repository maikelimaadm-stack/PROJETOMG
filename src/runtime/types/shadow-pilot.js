/**
 * @typedef {Object} EmpresasFieldDescriptor
 * @property {string} id
 * @property {string} type
 * @property {boolean} required
 */

/**
 * @typedef {Object} EmpresasModuleDescriptor
 * @property {string} moduleId
 * @property {string} entityName
 * @property {EmpresasFieldDescriptor[]} fields
 * @property {string[]} requiredFields
 * @property {Record<string, unknown>} [meta]
 */

/**
 * Normalized structural snapshot of the Empresas module — the unit compared
 * between the legacy runtime and runtime v2. Deterministic: fields sorted by
 * id, sensitive keys masked.
 * @typedef {Object} EmpresasStructuralSnapshot
 * @property {string} moduleId
 * @property {string} entityName
 * @property {number} fieldCount
 * @property {EmpresasFieldDescriptor[]} fields
 * @property {string[]} requiredFields
 * @property {Record<string, unknown>} meta
 */

/**
 * @typedef {Object} EmpresasShadowPilotReport
 * @property {boolean} skipped True when the pilot is disabled — nothing ran.
 * @property {string} moduleId Always "empresas".
 * @property {boolean} [ok] Present when not skipped: whether the pilot run completed without an internal failure.
 * @property {boolean} [equivalent] Whether the legacy and runtime v2 structural snapshots matched.
 * @property {import('./shadow.js').ShadowComparison} [comparison]
 * @property {import('./shadow.js').ShadowReadinessReport|null} [readiness]
 * @property {boolean|null} [passSuccess] Result of the underlying shadow pass, when run.
 * @property {{name: string, message: string}} [error] Captured (never thrown) shadow failure.
 * @property {number} timestamp
 * @property {string} [reason]
 */

/**
 * @typedef {Object} EmpresasShadowPilotDiagnostics
 * @property {boolean} enabled
 * @property {string} moduleId
 * @property {number} runCount
 * @property {number} failureCount
 * @property {Array<{id: string, ok: boolean, detail: unknown, timestamp: number}>} records
 */

export {};
