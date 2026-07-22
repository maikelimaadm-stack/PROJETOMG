/** @param {unknown} v @returns {boolean} */
export function isPlainObject(v) { return typeof v === 'object' && v !== null && !Array.isArray(v); }
/** @param {unknown} v @returns {boolean} */
export function isNonEmptyString(v) { return typeof v === 'string' && v.length > 0; }
/** @param {unknown} v @returns {boolean} */
export function isNonNegativeInteger(v) { return Number.isInteger(v) && v >= 0; }
