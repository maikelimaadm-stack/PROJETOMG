/**
 * Types for the post-Foundation C Empresas Guarded Read UI Overlay.
 * A dev-only preview surface for the guarded read UI. Plain, deterministic data
 * — no real data as primary source, no backend, no execution. Read-only; writes
 * are impossible.
 */

/**
 * @typedef {Object} EmpresasGuardedReadUiOverlayFlagEntry
 * @property {string} flag
 * @property {boolean} [enabled]
 * @property {boolean} [requested]
 * @property {boolean} [composedWhenOverlayOn]
 */

/**
 * @typedef {Object} EmpresasGuardedReadUiOverlayFlags
 * @property {EmpresasGuardedReadUiOverlayFlagEntry} overlay
 * @property {EmpresasGuardedReadUiOverlayFlagEntry} guardedReadUi
 * @property {EmpresasGuardedReadUiOverlayFlagEntry} dualRead
 * @property {EmpresasGuardedReadUiOverlayFlagEntry} readOnly
 * @property {EmpresasGuardedReadUiOverlayFlagEntry} devPreviewRoute
 * @property {EmpresasGuardedReadUiOverlayFlagEntry} devPreviewHub
 */

/**
 * @typedef {Object} EmpresasGuardedReadUiOverlayDiagnostics
 * @property {'empresas-guarded-read-ui-overlay-diagnostics'} kind
 * @property {string} moduleId
 * @property {string} flag
 * @property {'on'|'off'|'blocked-in-production'} flagStatus
 * @property {boolean} enabled
 * @property {boolean} production
 * @property {boolean} productionBlocked
 * @property {string} guardedReadUiStatus
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
 * @typedef {Object} EmpresasGuardedReadUiOverlayModel
 * @property {'empresas-guarded-read-ui-overlay-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'guarded_read_ui_overlay'} mode
 * @property {boolean} enabled
 * @property {boolean} skipped
 * @property {boolean} noSideEffects
 * @property {boolean} productionBlocked
 * @property {string} source
 * @property {'legacy'} currentRuntime
 * @property {'runtime-v2'} targetRuntime
 * @property {import('./empresas-guarded-read-ui-slice.js').EmpresasGuardedReadUiModel|null} guardedReadUi
 * @property {string} parityStatus
 * @property {number} totalDifferences
 * @property {number} blockingCount
 * @property {number} criticalCount
 * @property {true} writeBlocked
 * @property {string[]} blockedOperations
 * @property {EmpresasGuardedReadUiOverlayDiagnostics} diagnostics
 * @property {EmpresasGuardedReadUiOverlayFlags} flags
 * @property {import('./migration-planning.js').MigrationRollbackPlan} rollback
 * @property {string} nextAllowedStep
 * @property {string[]} warnings
 * @property {string[]} limitations
 * @property {string[]} evidence
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [writeGuard]
 */

export {};
