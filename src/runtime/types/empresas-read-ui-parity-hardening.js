/**
 * Types for the post-Foundation C Empresas Read UI Parity Hardening.
 * A passive, dev-only checklist/score/diagnostics layer over the read UI models.
 * Plain, deterministic data — no real data as primary source, no backend, no
 * execution. Read-only; writes are impossible.
 */

/**
 * @typedef {Object} ParityChecklistItem
 * @property {string} id
 * @property {string} category
 * @property {string} label
 * @property {'pass'|'warn'|'fail'|'skipped'} status
 * @property {'info'|'low'|'medium'|'high'|'critical'} severity
 * @property {string} evidence
 * @property {string} remediation
 * @property {boolean} blocking
 */

/**
 * @typedef {Object} ParityScore
 * @property {'empresas-read-ui-parity-score'} kind
 * @property {number} totalItems
 * @property {number} passCount
 * @property {number} warnCount
 * @property {number} failCount
 * @property {number} skippedCount
 * @property {number} blockingCount
 * @property {number} criticalCount
 * @property {number} scorePercent
 * @property {'ready_for_next_slice'|'needs_hardening'|'blocked'|'skipped'} readinessStatus
 */

/**
 * @typedef {Object} EmpresasReadUiParityDiagnostics
 * @property {'empresas-read-ui-parity-diagnostics'} kind
 * @property {string} moduleId
 * @property {string} flag
 * @property {'on'|'off'|'blocked-in-production'} flagStatus
 * @property {boolean} enabled
 * @property {boolean} production
 * @property {boolean} productionBlocked
 * @property {string} overlayStatus
 * @property {string} guardedReadUiStatus
 * @property {string} dualReadStatus
 * @property {string} readOnlyCandidateStatus
 * @property {ParityScore|null} parityScore
 * @property {string} readinessStatus
 * @property {string[]} blockers
 * @property {string[]} warnings
 * @property {string[]} limitations
 * @property {'available'} rollbackStatus
 * @property {'active'|'inactive'} writeGuardStatus
 * @property {boolean} writeBlocked
 * @property {number} blockedOperationCount
 * @property {boolean} noSideEffects
 */

/**
 * @typedef {Object} EmpresasReadUiParityHardeningModel
 * @property {'empresas-read-ui-parity-hardening-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'read_ui_parity_hardening'} mode
 * @property {boolean} enabled
 * @property {boolean} skipped
 * @property {boolean} noSideEffects
 * @property {boolean} productionBlocked
 * @property {string} source
 * @property {'legacy'} currentRuntime
 * @property {'runtime-v2'} targetRuntime
 * @property {{ mode: string, enabled: boolean, parityStatus: string }|null} overlay
 * @property {{ mode: string, enabled: boolean, parityStatus: string }|null} guardedReadUi
 * @property {Record<string, unknown>|null} readOnlyCandidate
 * @property {{ mode: string, parityStatus: string, summary: import('./empresas-dual-read-shadow-compare.js').DualReadSummary }|null} dualReadCompare
 * @property {ParityChecklistItem[]} parityChecklist
 * @property {ParityScore} parityScore
 * @property {string} readinessStatus
 * @property {string[]} blockers
 * @property {string[]} warnings
 * @property {true} writeBlocked
 * @property {string[]} blockedOperations
 * @property {EmpresasReadUiParityDiagnostics} diagnostics
 * @property {Record<string, unknown>} flags
 * @property {import('./migration-planning.js').MigrationRollbackPlan} rollback
 * @property {string} nextAllowedStep
 * @property {string[]} limitations
 * @property {string[]} evidence
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [writeGuard]
 */

export {};
