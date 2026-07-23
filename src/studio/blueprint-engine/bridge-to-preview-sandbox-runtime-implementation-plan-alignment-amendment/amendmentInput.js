/** Tiny pure type guards for the AMENDMENT-ONLY subtree. No I/O, no mutation, no runtime consumer behaviour. */
/** @param {any} v @returns {boolean} */
export function isPlainObject(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
    && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
}
/** @param {any} v @returns {boolean} */
export function isNonEmptyString(v) { return typeof v === 'string' && v.length > 0; }
export default isPlainObject;
