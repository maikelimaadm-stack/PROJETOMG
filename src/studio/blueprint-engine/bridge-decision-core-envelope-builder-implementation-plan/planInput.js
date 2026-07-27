/** Minimal, deterministic input predicates. Pure; no I/O. */
export function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
    && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
}
export function isNonEmptyString(v) { return typeof v === 'string' && v.length > 0; }
export default { isPlainObject, isNonEmptyString };
