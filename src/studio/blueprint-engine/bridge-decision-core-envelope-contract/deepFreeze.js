/** Recursively deep-freezes a value. Pure; returns the same (now frozen) reference. @param {any} v @returns {any} */
export function deepFreeze(v) {
  if (v && (typeof v === 'object' || typeof v === 'function') && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const k of Object.keys(v)) { try { deepFreeze(v[k]); } catch { /* ignore */ } }
  }
  return v;
}
export default deepFreeze;
