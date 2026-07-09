/** @typedef {'MAK-L3-VALIDATION-001'|'MAK-L3-VALIDATION-002'|'MAK-L3-VALIDATION-003'|'MAK-L3-VALIDATION-004'} ValidationErrorCode */

export class ValidationError extends Error {
  /**
   * @param {ValidationErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
