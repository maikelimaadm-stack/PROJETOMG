/**
 * Small, self-contained safety helpers for the ModeloBase1 runtime read-model
 * wiring. Local on purpose: the ModeloBase1 engine stays decoupled from the
 * runtime module (it never imports `src/runtime/*`). Pure, deterministic, no IO.
 */

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_DEPTH = 8;
const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|cookie|credential/i;
const SENSITIVE_MASK = '[REDACTED]';

/** @param {unknown} value */
export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * True when the value (a React element) carries the React `$$typeof` marker.
 * @param {unknown} value
 */
export function isReactElement(value) {
  return isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, '$$typeof');
}

/**
 * Deep scan for unsafe content in a resolved read payload: functions/handlers,
 * React elements, prototype-pollution keys, or excessive depth. Returns a reason
 * string on the first problem, or `null` when clean.
 * @param {unknown} value
 * @param {number} [depth]
 * @returns {string|null}
 */
export function findUnsafeContent(value, depth = 0) {
  if (depth > MAX_DEPTH) return `payload exceeds maximum depth (${MAX_DEPTH})`;
  if (typeof value === 'function') return 'payload contains a function/handler';
  if (isReactElement(value)) return 'payload contains a React element';
  if (Array.isArray(value)) {
    for (const item of value) {
      const reason = findUnsafeContent(item, depth + 1);
      if (reason) return reason;
    }
    return null;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) return `payload contains a forbidden key: "${key}"`;
      const reason = findUnsafeContent(/** @type {Record<string, unknown>} */ (value)[key], depth + 1);
      if (reason) return reason;
    }
  }
  return null;
}

/**
 * True when any sensitive-looking key in the payload still carries an unmasked
 * (non-`[REDACTED]`) primitive value.
 * @param {unknown} value
 * @param {number} [depth]
 * @returns {boolean}
 */
export function hasUnmaskedSensitive(value, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (Array.isArray(value)) return value.some((v) => hasUnmaskedSensitive(v, depth + 1));
  if (isPlainObject(value)) {
    for (const [key, v] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key) && typeof v !== 'object' && v !== SENSITIVE_MASK && v !== '' && v != null) {
        return true;
      }
      if (hasUnmaskedSensitive(v, depth + 1)) return true;
    }
  }
  return false;
}

/**
 * Detects a forbidden backend/fetch/Prisma/storage reference embedded as a
 * string value anywhere in the payload.
 * @param {unknown} value
 * @param {number} [depth]
 * @returns {boolean}
 */
export function hasForbiddenReference(value, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (typeof value === 'string') {
    return /PrismaClient|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB/.test(value);
  }
  if (Array.isArray(value)) return value.some((v) => hasForbiddenReference(v, depth + 1));
  if (isPlainObject(value)) return Object.values(value).some((v) => hasForbiddenReference(v, depth + 1));
  return false;
}

/**
 * Safe deep copy via JSON round-trip. Drops functions (guard/resolve) — callers
 * re-attach anything live afterwards. Returns `null` for non-serializable input.
 * @param {unknown} value
 */
export function safeClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}
