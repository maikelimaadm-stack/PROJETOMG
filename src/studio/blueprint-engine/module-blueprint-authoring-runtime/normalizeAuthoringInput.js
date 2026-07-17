/**
 * Deterministic, side-effect-free input normalization for the authoring runtime. Deep-clones plain
 * data (dropping functions/symbols/undefined), sorts nothing structural (preserves array order), and
 * returns a fresh graph so the caller's input is never mutated and no external reference is retained.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
export function normalizeAuthoringInput(value) {
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

/** @param {Record<string, unknown>} v @returns {boolean} */
export function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Coerce to a safe, length-bounded string. @param {unknown} v @param {string} fallback @param {number} maxLen */
export function safeString(v, fallback, maxLen) {
  const s = typeof v === 'string' && v.length > 0 ? v : fallback;
  if (typeof maxLen === 'number' && s.length > maxLen) return s.slice(0, maxLen);
  return s;
}

/** Coerce to a non-negative integer. @param {unknown} v @param {number} fallback */
export function safeNonNegativeInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

export default normalizeAuthoringInput;
