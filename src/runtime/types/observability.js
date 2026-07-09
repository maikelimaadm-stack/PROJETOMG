/**
 * @typedef {'info'|'warn'|'error'|'debug'} LogLevel
 */

/**
 * @typedef {Object} Span
 * @property {string} name
 * @property {string} traceId
 * @property {boolean} ended
 * @property {(result?: unknown) => void} end
 */

/**
 * @typedef {Object} EventRecord
 * @property {string} id
 * @property {string} type
 * @property {unknown} payload
 * @property {unknown} [context]
 * @property {number} timestamp
 */

/**
 * @typedef {Object} MetricRecord
 * @property {string} name
 * @property {number} value
 * @property {Record<string, string>} tags
 * @property {number} timestamp
 */

/**
 * @typedef {Object} TraceRecord
 * @property {string} id
 * @property {string} name
 * @property {unknown} [context]
 * @property {number} startedAt
 * @property {number} [endedAt]
 * @property {number} [durationMs]
 * @property {unknown} [result]
 */

/**
 * @typedef {Object} ErrorRecord
 * @property {string} id
 * @property {string} name
 * @property {string} message
 * @property {unknown} [context]
 * @property {number} timestamp
 */

/**
 * @typedef {Object} HealthReport
 * @property {'ok'} status
 * @property {number} eventsCount
 * @property {number} metricsCount
 * @property {number} tracesCount
 * @property {number} errorsCount
 */

/**
 * @typedef {Object} ReadinessCheck
 * @property {string} name
 * @property {boolean} ok
 */

/**
 * @typedef {Object} ReadinessReport
 * @property {boolean} ready
 * @property {string} [reason]
 * @property {ReadinessCheck[]} checks
 */

/**
 * @typedef {Object} ObservabilitySnapshot
 * @property {EventRecord[]} events
 * @property {MetricRecord[]} metrics
 * @property {TraceRecord[]} traces
 * @property {ErrorRecord[]} errors
 */

/**
 * Observability Engine (M24) — runtime-local diagnostics: events, metrics,
 * traces, error capture, health, and readiness. Never sends telemetry
 * externally, never persists, never calls the backend. Sensitive-looking
 * keys are masked before any record ever leaves the engine.
 * @typedef {Object} IObservability
 * @property {(name: string, ctx: unknown) => Span} startSpan SSOT-literal (03-INTERFACES.md).
 * @property {(level: LogLevel, message: string, meta?: object) => void} log SSOT-literal.
 * @property {(name: string, value: number, tags?: Record<string, string>) => void} metric SSOT-literal.
 * @property {() => HealthReport} health SSOT-literal.
 */

export {};
