/**
 * Deterministic, side-effect-free input normalization for the bridge. Deep-clones plain data (dropping
 * functions/symbols/undefined), preserves array order, and returns a fresh graph so the caller's input is
 * never mutated and no external reference is retained. @param {unknown} value @returns {unknown}
 */
export function normalizeBridgeInput(value) {
  return clone(value);
}

/** @param {unknown} v @returns {unknown} */
function clone(v) {
  if (v === null || v === undefined) return null;
  const t = typeof v;
  if (t === 'number') return Number.isFinite(v) ? v : null;
  if (t === 'boolean' || t === 'string') return v;
  if (t === 'function' || t === 'symbol' || t === 'bigint') return null;
  if (Array.isArray(v)) return v.map((e) => clone(e));
  if (t === 'object') {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const k of Object.keys(v)) {
      const vt = typeof v[k];
      if (vt === 'function' || vt === 'symbol' || vt === 'undefined') continue;
      out[k] = clone(v[k]);
    }
    return out;
  }
  return null;
}

/** @param {unknown} v @returns {boolean} */
export function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** @param {unknown} v @returns {boolean} */
export function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

/** @param {unknown} v @returns {boolean} */
export function isNonNegativeInteger(v) {
  return Number.isInteger(v) && v >= 0;
}

export default normalizeBridgeInput;
