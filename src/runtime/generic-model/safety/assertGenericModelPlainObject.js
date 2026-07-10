/**
 * Plain-object primitives for the Generic Model Runtime. Pure, dependency-free.
 */

/** @param {unknown} value @returns {boolean} */
export function isGenericModelPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Returns a safe deep copy via JSON round-trip (drops functions/undefined).
 * Returns `null` when the value is not JSON-serializable.
 * @param {unknown} value
 */
export function safeCloneGenericModel(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

/**
 * Asserts that a value is a plain object; returns a structured result instead of
 * throwing by default (fail-closed callers can inspect `ok`).
 * @param {unknown} value
 * @param {string} [label]
 * @returns {{ ok: boolean, reason: string|null }}
 */
export function assertGenericModelPlainObject(value, label = 'value') {
  if (!isGenericModelPlainObject(value)) {
    return { ok: false, reason: `${label} must be a plain object` };
  }
  return { ok: true, reason: null };
}
