/**
 * @typedef {'MAK-L3-OBSERVABILITY-001'|'MAK-L3-OBSERVABILITY-002'|'MAK-L3-OBSERVABILITY-003'|'MAK-L3-OBSERVABILITY-004'|'MAK-L3-OBSERVABILITY-005'} ObservabilityErrorCode
 */

export class ObservabilityError extends Error {
  /**
   * @param {ObservabilityErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ObservabilityError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
