/**
 * Recursively deep-freezes a plain value graph (objects + arrays). Returns the same reference frozen.
 * Pure; no I/O, no clock, no randomness. @param {unknown} value @returns {unknown}
 */
export function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Object.isFrozen(value)) return value;
  Object.freeze(value);
  if (Array.isArray(value)) {
    for (const el of value) deepFreeze(el);
  } else {
    for (const k of Object.keys(value)) deepFreeze(value[k]);
  }
  return value;
}

export default deepFreeze;
