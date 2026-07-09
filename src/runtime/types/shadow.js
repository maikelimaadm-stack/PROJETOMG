/**
 * @typedef {Object} ShadowReadinessReport
 * @property {boolean} enabled Whether Shadow Mode is opt-in enabled.
 * @property {boolean} ready True only when every audited module is available.
 * @property {import('./completion.js').ModuleAvailability[]} modules M01–M24 availability (empty when no completion checker is wired).
 * @property {number} availableCount
 * @property {number} missingCount
 * @property {number} generatedAt
 */

/**
 * @typedef {Object} ShadowPassResult
 * @property {boolean} skipped True when Shadow Mode is disabled — nothing was executed.
 * @property {boolean} [success] Present only when not skipped: whether the runtime v2 pass completed.
 * @property {ShadowReadinessReport} [readiness] Structural readiness of the runtime v2 produced by the pass.
 * @property {{name: string, message: string, context?: unknown}} [error] Captured (never thrown) runtime v2 failure.
 * @property {number} [durationMs]
 * @property {number} timestamp
 * @property {string} [reason]
 */

/**
 * @typedef {Object} ShadowComparison
 * @property {boolean} equivalent True when no structural differences were found.
 * @property {Array<{path: string, legacy: unknown, v2: unknown}>} differences
 * @property {string[]} onlyInLegacy Top-level keys present only in the legacy snapshot.
 * @property {string[]} onlyInV2 Top-level keys present only in the runtime v2 snapshot.
 * @property {number} generatedAt
 */

/**
 * @typedef {Object} ShadowDiagnosticRecord
 * @property {string} id
 * @property {'pass'|'compare'|'readiness'} kind
 * @property {boolean} ok
 * @property {unknown} [detail]
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ShadowDiagnostics
 * @property {boolean} enabled
 * @property {number} passCount
 * @property {number} failureCount
 * @property {ShadowDiagnosticRecord[]} records
 */

export {};
