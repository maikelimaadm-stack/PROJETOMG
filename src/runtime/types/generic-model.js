/**
 * Types for the Generic Model Runtime foundation. Pure, React-free,
 * ModeloBase1-free. This layer is the FOUNDATION only — ModeloBase1 is not
 * replaced; a future adapter (Fase 3 — ModeloBase1 Adapter to Generic Kernel)
 * will consume these contracts.
 *
 * @module runtime/types/generic-model
 */

/**
 * @typedef {'cadastro'|'operacional'|'movimentacao'|'financeiro'|'relatorio'|'dashboard'|'workflow'|'custom'} GenericModelType
 */

/**
 * @typedef {Object} GenericModelReadModel
 * @property {string} modelId
 * @property {string} moduleId
 * @property {GenericModelType} modelType
 * @property {string} source
 * @property {Object} [table]
 * @property {Object} [form]
 * @property {Array} [actions]
 * @property {Array} [permissions]
 * @property {Array} [validations]
 * @property {Object} [diagnostics]
 * @property {Object} [safety]
 * @property {Object} [fallback]
 */

/**
 * @typedef {Object} GenericModelSnapshot
 * @property {'generic-model-snapshot'} kind
 * @property {string} snapshotId
 * @property {string} modelId
 * @property {string} moduleId
 * @property {GenericModelType|null} modelType
 * @property {string} version
 * @property {number} schemaVersion
 * @property {string} source
 * @property {true} localOnly
 * @property {false} persistenceReal
 * @property {unknown} data
 * @property {Object} metadata
 * @property {Object} diagnostics
 * @property {string} checksum
 */

/**
 * @typedef {Object} GenericModelWriteContract
 * @property {string[]} allowedOperations
 * @property {string[]} blockedOperations
 * @property {true} localOnly
 * @property {boolean} backendAllowed
 * @property {'none'|'local_validation'|'local'} persistenceMode
 */

/**
 * @typedef {Object} GenericModelSafetyPolicy
 * @property {Object} defaults
 * @property {Object} capabilities
 * @property {string[]} dangerousCapabilities
 * @property {true} localOnly
 * @property {false} persistenceReal
 */

/**
 * @typedef {Object} GenericModelRuntimeContract
 * @property {'generic-model-runtime-contract'} kind
 * @property {string} modelId
 * @property {string} moduleId
 * @property {GenericModelType} modelType
 * @property {Object} capabilities
 * @property {GenericModelReadModel} readContract
 * @property {GenericModelWriteContract} writeContract
 * @property {Object} persistenceContract
 * @property {GenericModelSafetyPolicy} safetyPolicy
 * @property {true} localOnly
 * @property {false} persistenceReal
 * @property {string} nextAllowedStep
 */

export {};
