/**
 * Types for the post-Foundation C Empresas Read UI Runtime Bridge Dry Run.
 * A passive, dev-only simulation of a future read-only bridge. Plain,
 * deterministic data — no real data as primary source, no backend, no
 * execution, no real mount. Read-only; writes are impossible.
 */

/**
 * @typedef {Object} EmpresasRuntimeBridgeReadContract
 * @property {'empresas-runtime-bridge-read-contract'} kind
 * @property {string} contractId
 * @property {string} moduleId
 * @property {'read_only'} mode
 * @property {true} dryRun
 * @property {string[]} allowedOperations
 * @property {string[]} blockedOperations
 * @property {string[]} requiredInputs
 * @property {string[]} producedOutputs
 * @property {string} sourceModel
 * @property {string} targetConsumer
 * @property {{ target: string, mechanism: string, dataSource: string }} fallback
 * @property {{ strategy: string, featureFlagDefault: 'off', destructive: boolean, schemaChange: boolean, realWrite: boolean }} rollback
 * @property {{ readOnly: boolean, noSideEffects: boolean, noBackend: boolean, noPrismaMmm: boolean, noStorage: boolean, noLegacyMutation: boolean, writeImpossible: boolean }} safety
 * @property {Record<string, unknown>} diagnostics
 */

/**
 * @typedef {Object} EmpresasRuntimeBridgeMountSimulation
 * @property {'empresas-runtime-bridge-mount-simulation'} kind
 * @property {string} simulationId
 * @property {true} dryRun
 * @property {boolean} wouldMount
 * @property {'dev_preview_only'} mountTarget
 * @property {'future_guarded_slot'} futureMountTarget
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
 * @typedef {Object} EmpresasRuntimeBridgeDryRunDiagnostics
 * @property {'empresas-runtime-bridge-dry-run-diagnostics'} kind
 * @property {string} moduleId
 * @property {string} flag
 * @property {'on'|'off'|'blocked-in-production'} flagStatus
 * @property {boolean} enabled
 * @property {boolean} production
 * @property {boolean} productionBlocked
 * @property {string} hardeningStatus
 * @property {string} overlayStatus
 * @property {string} guardedReadUiStatus
 * @property {string} readOnlyCandidateStatus
 * @property {string} dualReadStatus
 * @property {string} bridgeContractStatus
 * @property {string} mountSimulationStatus
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
 * @typedef {Object} EmpresasReadUiRuntimeBridgeDryRunModel
 * @property {'empresas-read-ui-runtime-bridge-dry-run-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'read_ui_runtime_bridge_dry_run'} mode
 * @property {boolean} enabled
 * @property {boolean} skipped
 * @property {boolean} noSideEffects
 * @property {boolean} productionBlocked
 * @property {string} source
 * @property {'legacy'} currentRuntime
 * @property {'runtime-v2'} targetRuntime
 * @property {'dry_run'} bridgeMode
 * @property {Record<string, unknown>|null} hardening
 * @property {Record<string, unknown>|null} overlay
 * @property {Record<string, unknown>|null} guardedReadUi
 * @property {Record<string, unknown>|null} readOnlyCandidate
 * @property {Record<string, unknown>|null} dualReadCompare
 * @property {EmpresasRuntimeBridgeReadContract|null} bridgeContract
 * @property {EmpresasRuntimeBridgeMountSimulation|null} mountSimulation
 * @property {string} readinessStatus
 * @property {boolean} bridgeReady
 * @property {string[]} blockers
 * @property {string[]} warnings
 * @property {true} writeBlocked
 * @property {string[]} blockedOperations
 * @property {EmpresasRuntimeBridgeDryRunDiagnostics} diagnostics
 * @property {Record<string, unknown>} flags
 * @property {import('./migration-planning.js').MigrationRollbackPlan} rollback
 * @property {string} nextAllowedStep
 * @property {string[]} limitations
 * @property {string[]} evidence
 * @property {import('./empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [writeGuard]
 */

export {};
