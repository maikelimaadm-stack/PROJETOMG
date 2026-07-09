import { RuntimeShadowModeError } from './errors.js';

/** Hard caps — Shadow Mode must never grow unbounded, even under a misbehaving runtime v2. */
const MAX_INPUT_DEPTH = 8;
const MAX_SNAPSHOT_DEPTH = 8;
const MAX_DIAGNOSTICS = 500;
const MAX_COMPARE_KEYS = 200;

/** Never allowed as an object key, anywhere in input/snapshots — prototype-pollution guard. */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Key names whose values are masked before any record leaves the adapter. */
const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|cookie|credential/i;

/** @param {unknown} value */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * Rejects prototype-pollution keys and over-deep structures anywhere in a
 * caller-supplied value. Throws (structural failure) — this runs on inputs
 * the adapter is asked to trust, before anything else happens.
 * @param {unknown} value
 * @param {number} depth
 * @param {string} label
 */
function validateShape(value, depth, label) {
  if (depth > MAX_INPUT_DEPTH) {
    throw new RuntimeShadowModeError('MAK-L3-SHADOW-001', `${label} exceeds maximum depth (${MAX_INPUT_DEPTH})`);
  }
  if (Array.isArray(value)) {
    for (const item of value) validateShape(item, depth + 1, label);
    return;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) {
        throw new RuntimeShadowModeError('MAK-L3-SHADOW-001', `${label} contains a forbidden key: "${key}"`);
      }
      validateShape(/** @type {Record<string, unknown>} */ (value)[key], depth + 1, label);
    }
  }
}

/**
 * Deep-clones `value`, masking any key matching a known sensitive-data
 * pattern and truncating recursion at `MAX_SNAPSHOT_DEPTH`.
 * @param {unknown} value
 * @param {number} [depth]
 * @returns {unknown}
 */
function redactSensitive(value, depth = 0) {
  if (depth > MAX_SNAPSHOT_DEPTH) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.map((v) => redactSensitive(v, depth + 1));
  if (isPlainObject(value)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactSensitive(v, depth + 1);
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

let idCounter = 1;
/** @param {string} prefix */
function nextId(prefix) {
  return `${prefix}-${idCounter++}`;
}

/**
 * Runtime v2 Shadow Mode adapter (post-Foundation C).
 *
 * Runs the new runtime v2 *alongside* the legacy runtime, purely for
 * diagnostics — it never renders real UI, never executes an
 * action/workflow/connector with side effects, never queries Prisma/MMM,
 * and never calls the backend. It is **opt-in**: with `enabled: false`
 * (the default) every pass short-circuits to a no-op `{ skipped: true }`,
 * so production behavior is completely unchanged and the feature is safe
 * to ship dark. A runtime v2 failure during a shadow pass is captured and
 * reported, never propagated to the caller / UI.
 */
export class RuntimeShadowMode {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.enabled=false] Opt-in switch. Off by default.
   * @param {() => number} [options.clock] Injectable clock (ms) for deterministic timestamps.
   * @param {() => (Promise<unknown>|unknown)} [options.loadRuntime] Builds a runtime v2 result to inspect. MUST be side-effect-free w.r.t. production UI.
   * @param {{ recordEvent?: Function, recordMetric?: Function, captureError?: Function }} [options.observability] Optional Observability Engine (M24) for diagnostics.
   * @param {{ checkRuntimeCompleteness?: Function, createFoundationCReport?: Function }} [options.completion] Optional Runtime Completion (audit) for readiness.
   */
  constructor(options = {}) {
    const {
      enabled = false,
      clock = () => Date.now(),
      loadRuntime,
      observability,
      completion,
    } = options;

    if (typeof clock !== 'function') {
      throw new RuntimeShadowModeError('MAK-L3-SHADOW-002', 'RuntimeShadowMode "clock" option must be a function');
    }
    if (loadRuntime !== undefined && typeof loadRuntime !== 'function') {
      throw new RuntimeShadowModeError('MAK-L3-SHADOW-002', 'RuntimeShadowMode "loadRuntime" option must be a function');
    }

    this._enabled = Boolean(enabled);
    this._clock = clock;
    this._loadRuntime = loadRuntime ?? null;
    this._observability = observability ?? null;
    this._completion = completion ?? null;

    /** @type {import('../types/shadow.js').ShadowDiagnosticRecord[]} */
    this._records = [];
    this._passCount = 0;
    this._failureCount = 0;
  }

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /**
   * Structural readiness of a runtime v2 result — delegates to Runtime
   * Completion when wired, else reports "unknown". Never throws for a
   * missing/partial runtime.
   * @param {unknown} runtime
   * @returns {import('../types/shadow.js').ShadowReadinessReport}
   */
  checkReadiness(runtime) {
    /** @type {import('./../types/completion.js').ModuleAvailability[]} */
    let modules = [];
    if (this._completion && typeof this._completion.checkRuntimeCompleteness === 'function') {
      try {
        modules = this._completion.checkRuntimeCompleteness(runtime) ?? [];
      } catch {
        modules = [];
      }
    }
    const availableCount = modules.filter((m) => m.status === 'available').length;
    const missingCount = modules.length - availableCount;
    return {
      enabled: this._enabled,
      ready: modules.length > 0 && missingCount === 0,
      modules,
      availableCount,
      missingCount,
      generatedAt: this._clock(),
    };
  }

  /**
   * Runs one runtime v2 shadow pass. When disabled, returns a no-op
   * `{ skipped: true }` and touches nothing. When enabled, builds the
   * runtime v2 via `loadRuntime`, checks its readiness, records
   * diagnostics — and, crucially, captures any failure as data instead of
   * throwing it toward the (production) caller.
   * @param {unknown} [input]
   * @returns {Promise<import('../types/shadow.js').ShadowPassResult>}
   */
  async runShadowPass(input) {
    validateShape(input, 0, 'Shadow pass input');

    if (!this._enabled) {
      return { skipped: true, timestamp: this._clock(), reason: 'shadow mode disabled' };
    }

    if (!this._loadRuntime) {
      const result = {
        skipped: false,
        success: false,
        error: { name: 'RuntimeShadowModeError', message: 'no loadRuntime provided — cannot build runtime v2' },
        timestamp: this._clock(),
      };
      this._pushRecord('pass', false, result.error);
      return result;
    }

    const started = this._clock();
    try {
      const runtime = await this._loadRuntime(safeClone(input));
      const readiness = this.checkReadiness(runtime);
      const durationMs = this._clock() - started;
      this._passCount += 1;
      this._emit('shadow.pass', { ok: true, ready: readiness.ready, availableCount: readiness.availableCount });
      this._emitMetric('shadow.pass.duration_ms', durationMs);
      this._pushRecord('pass', true, { ready: readiness.ready, availableCount: readiness.availableCount });
      return { skipped: false, success: true, readiness, durationMs, timestamp: this._clock() };
    } catch (err) {
      // Runtime v2 failure is isolated here — never rethrown toward production.
      this._failureCount += 1;
      const normalized = {
        name: err instanceof Error ? err.name : 'Error',
        message: err instanceof Error ? err.message : String(err),
      };
      this._captureError(err);
      this._pushRecord('pass', false, normalized);
      return { skipped: false, success: false, error: normalized, durationMs: this._clock() - started, timestamp: this._clock() };
    }
  }

  /**
   * Structural comparison of a legacy-runtime snapshot against a runtime v2
   * snapshot. Read-only, bounded, sensitive-data-masked. Both arguments are
   * prototype-pollution-guarded before inspection.
   * @param {unknown} legacySnapshot
   * @param {unknown} runtimeV2Snapshot
   * @returns {import('../types/shadow.js').ShadowComparison}
   */
  compareWithLegacy(legacySnapshot, runtimeV2Snapshot) {
    if (!isPlainObject(legacySnapshot) || !isPlainObject(runtimeV2Snapshot)) {
      throw new RuntimeShadowModeError('MAK-L3-SHADOW-003', 'compareWithLegacy() requires two plain-object snapshots');
    }
    validateShape(legacySnapshot, 0, 'Legacy snapshot');
    validateShape(runtimeV2Snapshot, 0, 'Runtime v2 snapshot');

    // Compare the RAW cloned values so that two *different* sensitive values
    // are still detected as a difference; only the values reported back out
    // are masked (below), never the ones used for the equality test.
    const legacy = /** @type {Record<string, unknown>} */ (safeClone(legacySnapshot) ?? {});
    const v2 = /** @type {Record<string, unknown>} */ (safeClone(runtimeV2Snapshot) ?? {});

    const legacyKeys = Object.keys(legacy);
    const v2Keys = Object.keys(v2);
    if (legacyKeys.length > MAX_COMPARE_KEYS || v2Keys.length > MAX_COMPARE_KEYS) {
      throw new RuntimeShadowModeError('MAK-L3-SHADOW-003', `snapshot exceeds maximum comparable keys (${MAX_COMPARE_KEYS})`);
    }

    const onlyInLegacy = legacyKeys.filter((k) => !(k in v2));
    const onlyInV2 = v2Keys.filter((k) => !(k in legacy));
    /** @type {Array<{path: string, legacy: unknown, v2: unknown}>} */
    const differences = [];
    for (const key of legacyKeys) {
      if (!(key in v2)) continue;
      if (JSON.stringify(legacy[key]) !== JSON.stringify(v2[key])) {
        const masked = SENSITIVE_KEY_PATTERN.test(key);
        differences.push({
          path: key,
          legacy: masked ? '[REDACTED]' : redactSensitive(legacy[key]),
          v2: masked ? '[REDACTED]' : redactSensitive(v2[key]),
        });
      }
    }

    const comparison = {
      equivalent: differences.length === 0 && onlyInLegacy.length === 0 && onlyInV2.length === 0,
      differences,
      onlyInLegacy,
      onlyInV2,
      generatedAt: this._clock(),
    };
    this._pushRecord('compare', comparison.equivalent, {
      differences: differences.length,
      onlyInLegacy: onlyInLegacy.length,
      onlyInV2: onlyInV2.length,
    });
    return comparison;
  }

  /**
   * Deep, independent copy of the accumulated diagnostics — mutating the
   * returned value can never reach back into the adapter's state.
   * @returns {import('../types/shadow.js').ShadowDiagnostics}
   */
  getDiagnostics() {
    return {
      enabled: this._enabled,
      passCount: this._passCount,
      failureCount: this._failureCount,
      records: this._records.map((r) => safeClone(r)),
    };
  }

  /** Resets the diagnostics buffer and counters (safe off switch / testing). */
  clear() {
    this._records = [];
    this._passCount = 0;
    this._failureCount = 0;
  }

  // --- internals ---

  /** @param {'pass'|'compare'|'readiness'} kind @param {boolean} ok @param {unknown} detail */
  _pushRecord(kind, ok, detail) {
    if (this._records.length >= MAX_DIAGNOSTICS) {
      throw new RuntimeShadowModeError('MAK-L3-SHADOW-004', `Too many diagnostic records (> ${MAX_DIAGNOSTICS})`);
    }
    this._records.push({
      id: nextId('shadow'),
      kind,
      ok,
      detail: redactSensitive(safeClone(detail)),
      timestamp: this._clock(),
    });
  }

  /** @param {string} type @param {unknown} payload */
  _emit(type, payload) {
    if (this._observability && typeof this._observability.recordEvent === 'function') {
      try {
        this._observability.recordEvent(type, payload, { source: 'runtime-shadow-mode' });
      } catch {
        // Observability failure must never break a shadow pass.
      }
    }
  }

  /** @param {string} name @param {number} value */
  _emitMetric(name, value) {
    if (this._observability && typeof this._observability.recordMetric === 'function') {
      try {
        this._observability.recordMetric(name, value, { source: 'shadow' });
      } catch {
        // ignore
      }
    }
  }

  /** @param {unknown} err */
  _captureError(err) {
    if (this._observability && typeof this._observability.captureError === 'function') {
      try {
        this._observability.captureError(err, { source: 'runtime-shadow-mode' });
      } catch {
        // ignore
      }
    }
  }
}

/**
 * @param {ConstructorParameters<typeof RuntimeShadowMode>[0]} [options]
 * @returns {RuntimeShadowMode}
 */
export function createRuntimeShadowMode(options) {
  return new RuntimeShadowMode(options);
}

export { RuntimeShadowModeError };
