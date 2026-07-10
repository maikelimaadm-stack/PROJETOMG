/**
 * Types for the ModeloBase1 Runtime Wiring — the engine's consumption of
 * `config.runtimeReadModel` (the runtime v2 direct-beta read model). READ-ONLY,
 * additive, reversible; safe-by-fallback.
 *
 * @module ModeloBase1/runtime-read-model/types
 */

/**
 * @typedef {Object} ModeloBase1RuntimeReadResolution
 * @property {boolean} present   Is a runtime read model attached to the config?
 * @property {boolean} enabled   Is it enabled (own flag on, not disabled)?
 * @property {object|null} readModel The normalized descriptor, or null.
 */

/**
 * @typedef {Object} ModeloBase1RuntimeReadValidation
 * @property {boolean} valid
 * @property {string[]} reasons  Human-readable reasons when invalid.
 * @property {string|null} code  The first error code, when invalid.
 */

/**
 * The applied state returned by the wiring. When `betaApplied` is true the
 * engine may consume `table`/`form`/`diagnostics` (read-only) and MUST treat
 * writes as blocked. When `fallbackApplied` is true the engine keeps the legacy
 * behavior.
 *
 * @typedef {Object} ModeloBase1RuntimeReadState
 * @property {'modelobase1-runtime-read-state'} kind
 * @property {string|null} moduleId
 * @property {boolean} betaApplied
 * @property {boolean} fallbackApplied
 * @property {string|null} fallbackReason
 * @property {string|null} fallbackSource
 * @property {boolean} runtimeReadModelPresent
 * @property {boolean} runtimeReadModelValid
 * @property {string} source
 * @property {object|null} table
 * @property {object|null} form
 * @property {boolean} tableApplied
 * @property {boolean} formApplied
 * @property {boolean} writeBlocked
 * @property {string|null} writeBlockMessage
 * @property {object|null} diagnostics
 * @property {boolean} noSideEffects
 */

export {};
