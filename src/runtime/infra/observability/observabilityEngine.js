import { ObservabilityError } from './errors.js';

/** Hard caps — guard against pathological telemetry volume. */
const MAX_EVENTS = 500;
const MAX_METRICS = 1000;
const MAX_TRACES = 200;
const MAX_PAYLOAD_DEPTH = 8;
const MAX_TAGS = 20;
const MAX_NAME_LENGTH = 200;
const MAX_ERROR_MESSAGE_LENGTH = 2000;

/** Never allowed as an object key, anywhere in payload/context/tags — prototype-pollution guard. */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Key names whose values are masked before any record leaves the engine. */
const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|cookie|credential/i;

/** @param {unknown} value */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * @param {unknown} value
 * @param {number} depth
 * @param {string} label
 */
function validateShape(value, depth, label) {
  if (depth > MAX_PAYLOAD_DEPTH) {
    throw new ObservabilityError('MAK-L3-OBSERVABILITY-001', `${label} exceeds maximum depth (${MAX_PAYLOAD_DEPTH})`);
  }
  if (Array.isArray(value)) {
    for (const item of value) validateShape(item, depth + 1, label);
    return;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) {
        throw new ObservabilityError('MAK-L3-OBSERVABILITY-001', `${label} contains a forbidden key: "${key}"`);
      }
      validateShape(/** @type {Record<string, unknown>} */ (value)[key], depth + 1, label);
    }
  }
}

/**
 * Deep-clones `value`, masking any key matching a known sensitive-data
 * pattern (password/token/secret/api key/authorization/cookie/credential).
 * @param {unknown} value
 * @returns {unknown}
 */
function redactSensitive(value) {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (isPlainObject(value)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactSensitive(v);
    }
    return out;
  }
  return value;
}

/** @param {unknown} value */
function safeClone(value) {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

/**
 * Deep-clones an already-sanitized record for return to the caller — every
 * public method returns one of these instead of the internally-stored
 * reference, so mutating a returned value (or a `snapshot()`) can never
 * reach back into the engine's own buffers.
 * @param {unknown} record
 */
function cloneRecord(record) {
  return JSON.parse(JSON.stringify(record));
}

/** @param {unknown} name @param {string} label */
function validateName(name, label) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new ObservabilityError('MAK-L3-OBSERVABILITY-001', `${label} must be a non-empty string`);
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new ObservabilityError('MAK-L3-OBSERVABILITY-001', `${label} exceeds maximum length (${name.length} > ${MAX_NAME_LENGTH})`);
  }
}

/** @param {unknown} tags */
function validateTags(tags) {
  if (tags === undefined) return {};
  if (!isPlainObject(tags)) {
    throw new ObservabilityError('MAK-L3-OBSERVABILITY-002', 'tags must be a plain object of string values');
  }
  const keys = Object.keys(tags);
  if (keys.length > MAX_TAGS) {
    throw new ObservabilityError('MAK-L3-OBSERVABILITY-002', `tags exceed maximum count (${keys.length} > ${MAX_TAGS})`);
  }
  for (const key of keys) {
    if (BLOCKED_KEYS.has(key)) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-002', `tags contain a forbidden key: "${key}"`);
    }
    if (typeof /** @type {Record<string, unknown>} */ (tags)[key] !== 'string') {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-002', `tag "${key}" must be a string value`);
    }
  }
  return /** @type {Record<string, string>} */ (tags);
}

const VALID_LOG_LEVELS = new Set(['info', 'warn', 'error', 'debug']);

let idCounter = 1;
/** @param {string} prefix */
function nextId(prefix) {
  return `${prefix}-${idCounter++}`;
}

/**
 * Observability Engine (M24) — runtime-local diagnostics: events, metrics,
 * traces, error capture, health, and readiness. Never sends telemetry
 * externally (no Sentry/Datadog/etc. integration), never persists to
 * disk/backend/localStorage/sessionStorage/IndexedDB, never uses a
 * WebSocket/BroadcastChannel/worker. Sensitive-looking keys are masked
 * before any record ever leaves the engine (`snapshot()`, `health()`).
 * @implements {import('../../types/observability.js').IObservability}
 */
export class ObservabilityEngine {
  /**
   * @param {Object} [options]
   * @param {() => number} [options.clock] Injectable clock (ms since epoch) — deterministic timing in tests.
   */
  constructor(options = {}) {
    const { clock = () => Date.now() } = options;
    if (typeof clock !== 'function') {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-005', 'ObservabilityEngine "clock" option must be a function');
    }
    this._clock = clock;
    /** @type {import('../../types/observability.js').EventRecord[]} */
    this._events = [];
    /** @type {import('../../types/observability.js').MetricRecord[]} */
    this._metrics = [];
    /** @type {Map<string, import('../../types/observability.js').TraceRecord>} */
    this._traces = new Map();
    /** @type {import('../../types/observability.js').ErrorRecord[]} */
    this._errors = [];
  }

  /**
   * @param {string} type
   * @param {unknown} payload
   * @param {unknown} [context]
   */
  recordEvent(type, payload, context) {
    validateName(type, 'Event type');
    validateShape(payload, 0, 'Event payload');
    validateShape(context, 0, 'Event context');
    if (this._events.length >= MAX_EVENTS) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-004', `Too many events recorded (> ${MAX_EVENTS})`);
    }
    const record = {
      id: nextId('event'),
      type,
      payload: redactSensitive(safeClone(payload)),
      context: context === undefined ? undefined : redactSensitive(safeClone(context)),
      timestamp: this._clock(),
    };
    this._events.push(record);
    return cloneRecord(record);
  }

  /**
   * @param {string} name
   * @param {number} value
   * @param {Record<string, string>} [tags]
   */
  recordMetric(name, value, tags) {
    validateName(name, 'Metric name');
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-002', 'Metric value must be a finite number');
    }
    const safeTags = validateTags(tags);
    if (this._metrics.length >= MAX_METRICS) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-004', `Too many metrics recorded (> ${MAX_METRICS})`);
    }
    const record = { name, value, tags: { ...safeTags }, timestamp: this._clock() };
    this._metrics.push(record);
    return cloneRecord(record);
  }

  /** SSOT-literal alias of `recordMetric` (`IObservability.metric`). */
  metric(name, value, tags) {
    this.recordMetric(name, value, tags);
  }

  /**
   * @param {string} name
   * @param {unknown} [context]
   */
  startTrace(name, context) {
    validateName(name, 'Trace name');
    validateShape(context, 0, 'Trace context');
    if (this._traces.size >= MAX_TRACES) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-004', `Too many active traces (> ${MAX_TRACES})`);
    }
    const record = {
      id: nextId('trace'),
      name,
      context: context === undefined ? undefined : redactSensitive(safeClone(context)),
      startedAt: this._clock(),
    };
    this._traces.set(record.id, record);
    return cloneRecord(record);
  }

  /**
   * @param {string} traceId
   * @param {unknown} [result]
   */
  endTrace(traceId, result) {
    const record = this._traces.get(traceId);
    if (!record) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-003', `Unknown trace: ${traceId}`);
    }
    if (record.endedAt !== undefined) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-003', `Trace "${traceId}" already ended`);
    }
    validateShape(result, 0, 'Trace result');
    record.endedAt = this._clock();
    record.durationMs = record.endedAt - record.startedAt;
    record.result = result === undefined ? undefined : redactSensitive(safeClone(result));
    return cloneRecord(record);
  }

  /**
   * SSOT-literal (`IObservability.startSpan`) — returns a `Span` handle
   * whose `end()` delegates to `endTrace()`.
   * @param {string} name
   * @param {unknown} ctx
   * @returns {import('../../types/observability.js').Span}
   */
  startSpan(name, ctx) {
    const trace = this.startTrace(name, ctx);
    const engine = this;
    return {
      name,
      traceId: trace.id,
      ended: false,
      end(result) {
        this.ended = true;
        engine.endTrace(trace.id, result);
      },
    };
  }

  /**
   * SSOT-literal (`IObservability.log`) — runtime-local only; never sends
   * telemetry externally. Recorded as an event of type `log.<level>`.
   * @param {import('../../types/observability.js').LogLevel} level
   * @param {string} message
   * @param {object} [meta]
   */
  log(level, message, meta) {
    if (!VALID_LOG_LEVELS.has(level)) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-001', `Invalid log level: ${level}`);
    }
    this.recordEvent(`log.${level}`, { message: truncate(message, MAX_ERROR_MESSAGE_LENGTH) }, meta);
  }

  /**
   * Normalizes and records a captured error without leaking raw stack
   * traces or secrets — message is truncated and any sensitive-looking
   * key in `context` is masked.
   * @param {unknown} error
   * @param {unknown} [context]
   */
  captureError(error, context) {
    validateShape(context, 0, 'Error context');
    if (this._errors.length >= MAX_EVENTS) {
      throw new ObservabilityError('MAK-L3-OBSERVABILITY-004', `Too many errors captured (> ${MAX_EVENTS})`);
    }
    const name = error instanceof Error ? error.name : 'Error';
    const rawMessage = error instanceof Error ? error.message : String(error);
    const record = {
      id: nextId('error'),
      name,
      message: truncate(rawMessage, MAX_ERROR_MESSAGE_LENGTH),
      context: context === undefined ? undefined : redactSensitive(safeClone(context)),
      timestamp: this._clock(),
    };
    this._errors.push(record);
    return cloneRecord(record);
  }

  /** SSOT-literal (`IObservability.health`). @returns {import('../../types/observability.js').HealthReport} */
  health() {
    return {
      status: 'ok',
      eventsCount: this._events.length,
      metricsCount: this._metrics.length,
      tracesCount: this._traces.size,
      errorsCount: this._errors.length,
    };
  }

  /**
   * Lightweight, generic capability check over whatever `runtime`-shaped
   * object is provided — not a substitute for the M01-M24 audit performed
   * by `core/completion/runtimeCompletion.js`.
   * @param {{ serviceLocator?: unknown, _serviceLocator?: unknown, registry?: unknown }} [runtime]
   * @returns {import('../../types/observability.js').ReadinessReport}
   */
  readiness(runtime) {
    if (runtime === undefined || runtime === null) {
      return { ready: false, reason: 'no runtime provided', checks: [] };
    }
    const locator = runtime.serviceLocator ?? runtime._serviceLocator;
    const hasServiceLocator = Boolean(locator && typeof (/** @type {any} */ (locator).resolve) === 'function');
    const hasRegistry = Boolean(runtime.registry);
    const checks = [
      { name: 'serviceLocator', ok: hasServiceLocator },
      { name: 'registry', ok: hasRegistry },
    ];
    return { ready: checks.every((c) => c.ok), checks };
  }

  /** Deep, independent snapshot of every buffered event/metric/trace/error. */
  snapshot() {
    return {
      events: this._events.map((e) => cloneRecord(e)),
      metrics: this._metrics.map((m) => cloneRecord(m)),
      traces: [...this._traces.values()].map((t) => cloneRecord(t)),
      errors: this._errors.map((e) => cloneRecord(e)),
    };
  }

  /** Clears every buffer (testing/reset utility). */
  clear() {
    this._events = [];
    this._metrics = [];
    this._traces.clear();
    this._errors = [];
  }
}

/** @param {string} value @param {number} maxLength */
function truncate(value, maxLength) {
  const str = typeof value === 'string' ? value : String(value);
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
}

/**
 * @param {Object} [options]
 * @param {() => number} [options.clock]
 * @returns {ObservabilityEngine}
 */
export function createObservabilityEngine(options) {
  return new ObservabilityEngine(options);
}

export { ObservabilityError };
