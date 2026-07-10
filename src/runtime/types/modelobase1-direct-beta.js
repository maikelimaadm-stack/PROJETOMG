/**
 * Types for the ModeloBase1 DIRECT BETA activation (Empresas + Campos
 * Personalizados). This layer injects a runtime v2 READ-ONLY read model into the
 * ModeloBase1 config behind a feature flag, with total fallback when the flag is
 * off. It never writes, never calls the backend/Prisma, never uses real data.
 *
 * @module runtime/types/modelobase1-direct-beta
 */

/**
 * @typedef {Object} BetaWriteGuardResult
 * @property {false} ok
 * @property {true} blocked
 * @property {string} operation
 * @property {string} code
 * @property {string} reason
 */

/**
 * @typedef {Object} BetaWriteGuard
 * @property {string} kind
 * @property {boolean} enabled
 * @property {boolean} productionBlocked
 * @property {true} readOnly
 * @property {string[]} blockedOperations
 * @property {number} blockedOperationCount
 * @property {(operation: string, payload?: unknown) => BetaWriteGuardResult} attempt
 */

/**
 * The injectable descriptor a beta screen attaches to its ModeloBase1 config
 * under the `runtimeReadModel` slot. Passive and deterministic; carries a live
 * write guard and an async `resolve()` that materializes the full view model.
 *
 * @typedef {Object} ModeloBase1DirectBetaReadModel
 * @property {'modelobase1-direct-beta-read-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {boolean} enabled
 * @property {boolean} injected
 * @property {boolean} productionBlocked
 * @property {true} readOnly
 * @property {string} injectedAt
 * @property {string} source
 * @property {string|null} betaFlag
 * @property {true} writeActionsBlocked
 * @property {false} usesRealData
 * @property {BetaWriteGuard} writeGuard
 * @property {() => Promise<Object>} resolve
 */

/**
 * @typedef {Object} ModeloBase1DirectBetaFallback
 * @property {'modelobase1-direct-beta-fallback'} kind
 * @property {string} moduleId
 * @property {false} injected
 * @property {null} readModel
 * @property {true} usesLegacyConfig
 * @property {'flag-disabled'|'production-blocked'} reason
 * @property {true} reversible
 * @property {string} note
 */

/**
 * @typedef {Object} ModeloBase1DirectBetaScreenDiagnostics
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {string|null} flag
 * @property {boolean} enabled
 * @property {boolean} injected
 * @property {boolean} productionBlocked
 * @property {boolean} readOnly
 * @property {boolean} writeActionsBlocked
 * @property {boolean} usesRealData
 * @property {string|null} source
 * @property {string|null} injectedAt
 * @property {boolean} fallback
 */

/**
 * @typedef {Object} ModeloBase1DirectBetaDiagnostics
 * @property {'modelobase1-direct-beta-diagnostics'} kind
 * @property {ModeloBase1DirectBetaScreenDiagnostics[]} screens
 * @property {number} injectedCount
 * @property {boolean} anyEnabled
 * @property {boolean} allReadOnly
 * @property {boolean} usesRealData
 * @property {Object} invariants
 * @property {string} readinessStatus
 * @property {string} nextAllowedStep
 */

export {};
