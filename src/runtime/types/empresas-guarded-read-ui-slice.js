/**
 * Types for the post-Foundation C Empresas Guarded Read UI Slice.
 * Everything here is plain, deterministic data — no real data as primary source,
 * no backend, no execution. Read-only; writes are impossible.
 */

/**
 * @typedef {Object} EmpresasGuardedReadUiDiagnostics
 * @property {'empresas-guarded-read-ui-diagnostics'} kind
 * @property {string} moduleId
 * @property {string} flag
 * @property {'on'|'off'|'blocked-in-production'} flagStatus
 * @property {boolean} enabled
 * @property {boolean} production
 * @property {boolean} productionBlocked
 * @property {string} viewModelStatus
 * @property {string} compareStatus
 * @property {string} parityStatus
 * @property {number} totalDifferences
 * @property {number} blockingCount
 * @property {number} criticalCount
 * @property {string} readinessStatus
 * @property {'available'} rollbackStatus
 * @property {'active'|'inactive'} writeGuardStatus
 * @property {number} blockedOperationCount
 * @property {boolean} noSideEffects
 * @property {string[]} limitations
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} EmpresasGuardedReadUiModel
 * @property {'empresas-guarded-read-ui-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'guarded_read_ui_slice'} mode
 * @property {boolean} enabled
 * @property {boolean} skipped
 * @property {boolean} noSideEffects
 * @property {boolean} productionBlocked
 * @property {string} source
 * @property {'legacy'} currentRuntime
 * @property {'runtime-v2'} targetRuntime
 * @property {{ enabled: boolean, mode: string, source: string, readinessStatus: string }|null} readOnlyCandidate
 * @property {{ mode: string, parityStatus: string, summary: import('./empresas-dual-read-shadow-compare.js').DualReadSummary }|null} dualReadCompare
 * @property {string} parityStatus
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel|null} viewModel
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel['table']|null} table
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel['form']|null} form
 * @property {EmpresasGuardedReadUiDiagnostics} diagnostics
 * @property {import('./empresas-dual-read-shadow-compare.js').EmpresasReadDifference[]} differences
 * @property {true} writeBlocked
 * @property {string[]} blockedOperations
 * @property {import('./migration-planning.js').MigrationRollbackPlan} rollback
 * @property {string} nextAllowedStep
 * @property {string[]} warnings
 * @property {string[]} limitations
 * @property {string[]} evidence
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [writeGuard]
 */

export {};
