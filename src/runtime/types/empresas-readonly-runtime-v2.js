/**
 * Types for the post-Foundation C Empresas Read-Only Runtime v2 Candidate.
 * Everything here is plain, deterministic data — no rendering, no execution, no
 * real data, no backend. The candidate is read-only; writes are impossible.
 */

/**
 * @typedef {Object} WriteGuardResult
 * @property {false} ok
 * @property {true} blocked
 * @property {string} operation
 * @property {string} code
 * @property {string} reason
 */

/**
 * @typedef {Object} EmpresasReadOnlyWriteGuard
 * @property {'empresas-readonly-write-guard'} kind
 * @property {boolean} enabled
 * @property {boolean} productionBlocked
 * @property {true} readOnly
 * @property {string[]} blockedOperations
 * @property {number} blockedOperationCount
 * @property {(operation: string, payload?: unknown) => WriteGuardResult} attempt
 */

/**
 * @typedef {Object} EmpresasReadOnlyViewModel
 * @property {'empresas-readonly-view-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {true} readOnly
 * @property {string} source
 * @property {{ columns: Array<Record<string, unknown>>, visibleColumns: string[], rows: Array<{id: string, valid: boolean, cells: Record<string, unknown>}>, rowCount: number }} table
 * @property {{ fields: Array<Record<string, unknown>>, visibleFields: string[], permissionsApplied: boolean }} form
 * @property {Array<{id: string, permission: string|null, denied: boolean}>} permissions
 * @property {Array<{id: string, rules: string[], source: string}>} validations
 * @property {Array<{id: string, kind: string, ref: string, blocked: boolean, reason: string}>} actions
 * @property {Array<{id: string, ref: string, blocked: boolean, reason: string}>} workflows
 * @property {true} writeActionsBlocked
 * @property {Record<string, unknown>|null} datasetDiagnostics
 * @property {{ empty: boolean, message?: string }} emptyState
 * @property {Record<string, unknown>} diagnostics
 */

/**
 * @typedef {Object} EmpresasReadOnlyDiagnostics
 * @property {'empresas-readonly-diagnostics'} kind
 * @property {string} moduleId
 * @property {string} flag
 * @property {'on'|'off'|'blocked-in-production'} flagStatus
 * @property {boolean} enabled
 * @property {boolean} production
 * @property {boolean} productionBlocked
 * @property {string} readinessStatus
 * @property {string} sourceStatus
 * @property {string} projectionStatus
 * @property {string} datasetStatus
 * @property {string} shadowStatus
 * @property {string[]} blockedOperations
 * @property {number} blockedOperationCount
 * @property {Array<{path: string}>} differences
 * @property {string[]} limitations
 * @property {string[]} warnings
 * @property {'available'} rollbackStatus
 */

/**
 * @typedef {Object} EmpresasReadOnlyRuntimeCandidate
 * @property {'empresas-readonly-runtime-candidate'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'read_only_candidate'} mode
 * @property {boolean} enabled
 * @property {boolean} skipped
 * @property {boolean} noSideEffects
 * @property {boolean} productionBlocked
 * @property {string} source
 * @property {'runtime-v2'} targetRuntime
 * @property {'legacy'} currentRuntime
 * @property {string} readinessStatus
 * @property {EmpresasReadOnlyViewModel|null} viewModel
 * @property {EmpresasReadOnlyDiagnostics} diagnostics
 * @property {Array<{path: string}>} differences
 * @property {EmpresasReadOnlyWriteGuard} writeGuard
 * @property {string[]} blockedOperations
 * @property {import('./migration-planning.js').MigrationRollbackPlan} rollback
 * @property {string} nextAllowedStep
 * @property {string[]} warnings
 * @property {string[]} limitations
 * @property {string[]} evidence
 */

export {};
