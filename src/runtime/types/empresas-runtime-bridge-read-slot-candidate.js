/**
 * Types for the post-Foundation C Empresas Runtime Bridge Read Slot Candidate.
 * A passive, dev-only description of a future read-only slot. Plain,
 * deterministic data — no real data as primary source, no backend, no
 * execution, no real mount. Read-only; writes are impossible.
 */

/**
 * @typedef {Object} EmpresasReadSlotContract
 * @property {'empresas-runtime-bridge-read-slot-contract'} kind
 * @property {string} contractId
 * @property {string} slotId
 * @property {string} moduleId
 * @property {'read_only'} mode
 * @property {true} candidate
 * @property {boolean} dryRunVerified
 * @property {string[]} allowedOperations
 * @property {string[]} blockedOperations
 * @property {string[]} requiredInputs
 * @property {string[]} producedOutputs
 * @property {string[]} slotConsumers
 * @property {{ target: string, mechanism: string, dataSource: string }} fallback
 * @property {{ strategy: string, featureFlagDefault: 'off', destructive: boolean, schemaChange: boolean, realWrite: boolean }} rollback
 * @property {Record<string, boolean>} safety
 * @property {Record<string, unknown>} diagnostics
 */

/**
 * @typedef {Object} EmpresasReadSlotPayload
 * @property {'empresas-runtime-bridge-read-slot-payload'} kind
 * @property {string} payloadId
 * @property {string} slotId
 * @property {string} moduleId
 * @property {'read_only'} mode
 * @property {'runtime-v2'} source
 * @property {string} generatedAtSource
 * @property {{ columns: Array<Record<string, unknown>>, visibleColumns: string[], rows: Array<Record<string, unknown>>, rowCount: number }} table
 * @property {{ fields: Array<Record<string, unknown>>, visibleFields: string[], permissionsApplied: boolean }} form
 * @property {Record<string, unknown>} diagnostics
 * @property {{ readOnly: boolean, writeBlocked: boolean, blockedOperations: string[], blockedOperationCount: number }} writeGuard
 * @property {{ parityStatus: string, totalDifferences: number, blockingCount: number, criticalCount: number }} parity
 * @property {Record<string, unknown>} flags
 * @property {Record<string, boolean>} safety
 * @property {{ strategy: string, featureFlagDefault: 'off', destructive: boolean }} rollback
 */

/**
 * @typedef {Object} EmpresasReadSlotPayloadValidation
 * @property {'empresas-read-slot-payload-validation'} kind
 * @property {boolean} valid
 * @property {string[]} errors
 * @property {string[]} warnings
 * @property {string[]} blockers
 * @property {number} score
 * @property {boolean} safeToProceed
 */

/**
 * @typedef {Object} EmpresasReadSlotMountPlan
 * @property {'empresas-runtime-bridge-read-slot-mount-plan'} kind
 * @property {string} mountPlanId
 * @property {string} slotId
 * @property {boolean} dryRunVerified
 * @property {boolean} wouldMount
 * @property {'dev_preview_only'} mountTarget
 * @property {'runtime_bridge_read_slot'} futureMountTarget
 * @property {string[]} requiredFlags
 * @property {Array<{ id: string, ok: boolean, detail: string }>} preconditions
 * @property {string[]} blockedReasons
 * @property {string[]} warnings
 * @property {boolean} safeToProceed
 * @property {{ strategy: string, featureFlagDefault: 'off', destructive: boolean }} rollback
 * @property {boolean} noSideEffects
 * @property {boolean} mountedAnythingReal
 * @property {boolean} touchedAppJsx
 * @property {boolean} touchedRealScreen
 * @property {boolean} touchedRuntimeBridge
 * @property {string} evidence
 */

/**
 * @typedef {Object} EmpresasReadSlotDiagnostics
 * @property {'empresas-runtime-bridge-read-slot-diagnostics'} kind
 * @property {string} moduleId
 * @property {string} flag
 * @property {'on'|'off'|'blocked-in-production'} flagStatus
 * @property {boolean} enabled
 * @property {boolean} production
 * @property {boolean} productionBlocked
 * @property {string} bridgeDryRunStatus
 * @property {string} hardeningStatus
 * @property {string} overlayStatus
 * @property {string} guardedReadUiStatus
 * @property {string} readOnlyCandidateStatus
 * @property {string} readSlotContractStatus
 * @property {string} payloadValidationStatus
 * @property {string} mountPlanStatus
 * @property {'active'|'inactive'} writeGuardStatus
 * @property {'available'} rollbackStatus
 * @property {string[]} blockers
 * @property {string[]} warnings
 * @property {string[]} limitations
 * @property {boolean} writeBlocked
 * @property {number} blockedOperationCount
 * @property {boolean} noSideEffects
 */

/**
 * @typedef {Object} EmpresasReadSlotCandidateModel
 * @property {'empresas-runtime-bridge-read-slot-candidate-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'runtime_bridge_read_slot_candidate'} mode
 * @property {boolean} enabled
 * @property {boolean} skipped
 * @property {boolean} noSideEffects
 * @property {boolean} productionBlocked
 * @property {string} source
 * @property {'legacy'} currentRuntime
 * @property {'runtime-v2'} targetRuntime
 * @property {'read_only_candidate'} slotMode
 * @property {Record<string, unknown>|null} dryRun
 * @property {EmpresasReadSlotContract|null} readSlotContract
 * @property {EmpresasReadSlotPayload|null} readSlotPayload
 * @property {EmpresasReadSlotPayloadValidation|null} payloadValidation
 * @property {EmpresasReadSlotMountPlan|null} mountPlan
 * @property {Record<string, unknown>|null} bridgeDryRun
 * @property {Record<string, unknown>|null} hardening
 * @property {Record<string, unknown>|null} overlay
 * @property {Record<string, unknown>|null} guardedReadUi
 * @property {Record<string, unknown>|null} readOnlyCandidate
 * @property {string} readinessStatus
 * @property {boolean} slotReady
 * @property {boolean} safeToProceed
 * @property {string[]} blockers
 * @property {string[]} warnings
 * @property {true} writeBlocked
 * @property {string[]} blockedOperations
 * @property {EmpresasReadSlotDiagnostics} diagnostics
 * @property {Record<string, unknown>} flags
 * @property {import('./migration-planning.js').MigrationRollbackPlan} rollback
 * @property {string} nextAllowedStep
 * @property {string[]} limitations
 * @property {string[]} evidence
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [writeGuard]
 */

export {};
