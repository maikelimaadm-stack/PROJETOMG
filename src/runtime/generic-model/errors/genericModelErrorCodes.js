/**
 * Stable error codes for the Generic Model Runtime foundation. Pure data.
 *
 * @typedef {'GM-RUNTIME-001'|'GM-RUNTIME-002'|'GM-RUNTIME-003'|'GM-RUNTIME-004'|'GM-RUNTIME-005'|'GM-RUNTIME-006'|'GM-RUNTIME-007'|'GM-RUNTIME-008'|'GM-RUNTIME-009'|'GM-RUNTIME-010'} GenericModelErrorCode
 */

/** Map of code → default metadata (category/severity/blocking). */
export const GENERIC_MODEL_ERROR_CODES = Object.freeze({
  'GM-RUNTIME-001': { category: 'safety', severity: 'high', blocking: true, label: 'unsafe payload' },
  'GM-RUNTIME-002': { category: 'contract', severity: 'high', blocking: true, label: 'invalid contract' },
  'GM-RUNTIME-003': { category: 'write', severity: 'high', blocking: true, label: 'blocked operation' },
  'GM-RUNTIME-004': { category: 'persistence', severity: 'high', blocking: true, label: 'invalid snapshot' },
  'GM-RUNTIME-005': { category: 'persistence', severity: 'high', blocking: true, label: 'checksum mismatch' },
  'GM-RUNTIME-006': { category: 'write', severity: 'high', blocking: true, label: 'unsafe write payload' },
  'GM-RUNTIME-007': { category: 'fallback', severity: 'low', blocking: false, label: 'fallback applied' },
  'GM-RUNTIME-008': { category: 'persistence', severity: 'medium', blocking: false, label: 'adapter failure' },
  'GM-RUNTIME-009': { category: 'contract', severity: 'medium', blocking: false, label: 'unsupported model type' },
  'GM-RUNTIME-010': { category: 'safety', severity: 'high', blocking: true, label: 'capability denied' },
});

/** @param {string} code @returns {boolean} */
export function isGenericModelErrorCode(code) {
  return typeof code === 'string' && Object.prototype.hasOwnProperty.call(GENERIC_MODEL_ERROR_CODES, code);
}
