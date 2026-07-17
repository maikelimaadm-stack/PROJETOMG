/**
 * Deterministic, key-sorted JSON serialization. Same value graph -> same string, independent of key
 * insertion order. Functions/undefined are dropped (like JSON). No I/O, no clock, no randomness.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function stableSerialize(value) {
  return serialize(value);
}

/** @param {unknown} v @returns {string} */
function serialize(v) {
  if (v === null || v === undefined) return 'null';
  const t = typeof v;
  if (t === 'number') return Number.isFinite(v) ? JSON.stringify(v) : 'null';
  if (t === 'boolean') return v ? 'true' : 'false';
  if (t === 'string') return JSON.stringify(v);
  if (t === 'function' || t === 'symbol' || t === 'bigint') return 'null';
  if (Array.isArray(v)) return `[${v.map((e) => serialize(e)).join(',')}]`;
  if (t === 'object') {
    const keys = Object.keys(v).filter((k) => typeof v[k] !== 'function' && typeof v[k] !== 'undefined' && typeof v[k] !== 'symbol').sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${serialize(v[k])}`).join(',')}}`;
  }
  return 'null';
}

export default stableSerialize;
