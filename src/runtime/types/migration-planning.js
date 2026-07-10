/**
 * Types for the post-Foundation C first real module migration planning layer.
 * Everything here is plain, deterministic data — no rendering, no execution, no
 * real data, no backend.
 */

/**
 * @typedef {'not_ready'|'shadow_ready'|'preview_ready'|'read_only_candidate'|'migration_candidate'|'blocked'} MigrationReadinessStatus
 */

/**
 * @typedef {Object} MigrationReadinessSignals
 * @property {boolean} shadowReady
 * @property {boolean} tableFormShadowReady
 * @property {boolean} controlledPreviewReady
 * @property {boolean} previewHubReady
 * @property {boolean} controlledDatasetReady
 * @property {boolean} devPreviewRouteReady
 * @property {boolean} routeActivationReady
 * @property {boolean} legacyStillSourceOfTruth
 * @property {boolean} usesRealData
 * @property {boolean} writesRealData
 */

/**
 * @typedef {Object} MigrationReadinessModel
 * @property {'migration-readiness-model'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'runtime-v2'} targetRuntime
 * @property {'legacy'} currentRuntime
 * @property {MigrationReadinessStatus} readinessStatus
 * @property {MigrationReadinessStatus} maxStatusThisSlice
 * @property {Record<string, unknown>} signals
 * @property {string[]} blockers
 * @property {string[]} warnings
 * @property {string[]} risks
 * @property {string[]} requiredGates
 * @property {string[]} requiredTests
 * @property {boolean} reversible
 * @property {boolean} rollbackAvailable
 * @property {string} nextAllowedStep
 * @property {string[]} notAllowedYet
 * @property {string[]} evidenceLinks
 */

/**
 * @typedef {Object} MigrationRisk
 * @property {string} id
 * @property {string} severity
 * @property {string} description
 * @property {string} mitigation
 * @property {string} gate
 * @property {string} rollbackNote
 */

/**
 * @typedef {Object} MigrationRiskModel
 * @property {'migration-risk-model'} kind
 * @property {string} moduleId
 * @property {MigrationRisk[]} risks
 * @property {{ total: number, high: number, medium: number, low: number }} summary
 */

/**
 * @typedef {Object} MigrationRollbackPlan
 * @property {'migration-rollback-plan'} kind
 * @property {string} moduleId
 * @property {string} strategy
 * @property {string} featureFlag
 * @property {'off'} featureFlagDefault
 * @property {string[]} guarantees
 * @property {{ target: string, mechanism: string, dataSource: string }} fallback
 * @property {string[]} criteria
 * @property {{ commands: string[], note: string }} validation
 * @property {string[]} residualRisks
 * @property {boolean} destructive
 * @property {boolean} schemaChange
 * @property {boolean} realWrite
 */

/**
 * @typedef {Object} MigrationPhase
 * @property {string} id
 * @property {string} name
 * @property {boolean} inScope
 * @property {boolean} executedThisSlice
 * @property {boolean} [likelyNextSlice]
 * @property {boolean} [outOfScope]
 * @property {string[]} goals
 * @property {boolean} writes
 * @property {boolean} reversible
 */

/**
 * @typedef {Object} MigrationNextSlice
 * @property {string} recommended
 * @property {boolean} allowed
 * @property {string[]} onlyIf
 * @property {string[]} stillNotAllowed
 */

/**
 * @typedef {Object} FirstModuleMigrationPlan
 * @property {'first-module-migration-plan'} kind
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {string} generatedBy
 * @property {boolean} migratesThisSlice
 * @property {boolean} legacyRemainsSourceOfTruth
 * @property {boolean} realWriteInScope
 * @property {MigrationPhase} currentState
 * @property {MigrationPhase[]} phases
 * @property {MigrationReadinessModel} readiness
 * @property {MigrationRiskModel} risks
 * @property {MigrationRollbackPlan} rollback
 * @property {MigrationNextSlice} nextSlice
 * @property {string[]} outOfScope
 */

export {};
