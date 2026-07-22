/**
 * Tiny, pure type guards used by the PLAN-ONLY subtree. No I/O, no mutation, no runtime consumer behaviour.
 */
/** @param {any} v @returns {boolean} */
export function isPlainObject(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
    && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
}
/** @param {any} v @returns {boolean} */
export function isNonEmptyString(v) { return typeof v === 'string' && v.length > 0; }
/** @param {any} v @returns {boolean} */
export function isNonNegativeInteger(v) { return typeof v === 'number' && Number.isInteger(v) && v >= 0; }
export default isPlainObject;
