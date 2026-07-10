/**
 * Types for the post-Foundation C Empresas Dual Read Shadow Compare.
 * Everything here is plain, deterministic data — no rendering, no execution, no
 * real data as primary source, no backend. Read-only; writes are impossible.
 */

/**
 * @typedef {Object} EmpresasReadSnapshot
 * @property {'legacy'|'runtime-v2'} sourceRuntime
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {{ columns: Array<Record<string, unknown>>, visibleColumns: string[], rows: Array<{id: string, valid: boolean, cells: Record<string, unknown>}>, rowCount: number }} table
 * @property {{ fields: Array<Record<string, unknown>>, visibleFields: string[] }} form
 * @property {Array<{id: string, permission: string|null, denied: boolean}>} permissions
 * @property {Array<{id: string, rules: string[], source: string}>} validations
 * @property {Array<{id: string, kind: string, ref: string, scope: string, blocked?: boolean}>} actions
 * @property {string[]} [blockedOperations]
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [writeGuard]
 * @property {Record<string, unknown>} metadata
 * @property {Record<string, unknown>} diagnostics
 */

/**
 * @typedef {Object} EmpresasReadDifference
 * @property {string} id
 * @property {string} path
 * @property {string} category
 * @property {string} severity
 * @property {unknown} legacyValue
 * @property {unknown} runtimeV2Value
 * @property {string} message
 * @property {string} recommendedAction
 * @property {boolean} blocking
 * @property {string} gate
 */

/**
 * @typedef {Object} DualReadSummary
 * @property {number} totalDifferences
 * @property {number} criticalCount
 * @property {number} highCount
 * @property {number} mediumCount
 * @property {number} lowCount
 * @property {number} infoCount
 * @property {number} blockingCount
 * @property {'parity'|'acceptable_drift'|'blocked'} parityStatus
 */

/**
 * @typedef {Object} EmpresasReadComparison
 * @property {string} moduleId
 * @property {string} legacyRuntime
 * @property {string} runtimeV2
 * @property {EmpresasReadDifference[]} differences
 * @property {DualReadSummary} summary
 */

/**
 * @typedef {Object} EmpresasDualReadDiagnostics
 * @property {'empresas-dual-read-diagnostics'} kind
 * @property {string} moduleId
 * @property {string} flag
 * @property {'on'|'off'|'blocked-in-production'} flagStatus
 * @property {boolean} enabled
 * @property {boolean} production
 * @property {boolean} productionBlocked
 * @property {string} legacySnapshotStatus
 * @property {string} runtimeV2SnapshotStatus
 * @property {string} compareStatus
 * @property {DualReadSummary|null} differenceSummary
 * @property {string} parityStatus
 * @property {string} readinessStatus
 * @property {'available'} rollbackStatus
 * @property {'active'|'inactive'} writeGuardStatus
 * @property {boolean} noSideEffects
 * @property {string[]} limitations
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} EmpresasDualReadShadowCompare
 * @property {'empresas-dual-read-shadow-compare'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'dual_read_shadow_compare'} mode
 * @property {boolean} enabled
 * @property {boolean} skipped
 * @property {boolean} noSideEffects
 * @property {boolean} productionBlocked
 * @property {string} source
 * @property {'legacy'} currentRuntime
 * @property {'runtime-v2'} targetRuntime
 * @property {EmpresasReadSnapshot|null} legacySnapshot
 * @property {EmpresasReadSnapshot|null} runtimeV2Snapshot
 * @property {EmpresasReadDifference[]} differences
 * @property {DualReadSummary} summary
 * @property {EmpresasDualReadDiagnostics} diagnostics
 * @property {{ status: string, canAdvance: boolean, parityStatus?: string }} readiness
 * @property {import('./migration-planning.js').MigrationRollbackPlan} rollback
 * @property {string[]} blockedOperations
 * @property {string} nextAllowedStep
 * @property {string[]} warnings
 * @property {string[]} limitations
 * @property {string[]} evidence
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [writeGuard]
 */

export {};
