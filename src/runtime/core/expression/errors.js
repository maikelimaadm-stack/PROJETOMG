/** @typedef {'MAK-L3-EXPRESSION-001'|'MAK-L3-EXPRESSION-002'|'MAK-L3-EXPRESSION-003'|'MAK-L3-EXPRESSION-004'|'MAK-L3-EXPRESSION-005'} ExpressionErrorCode */

export class ExpressionError extends Error {
  /**
   * @param {ExpressionErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ExpressionError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
