/** @typedef {'MAK-L3-FORMULA-001'|'MAK-L3-FORMULA-002'|'MAK-L3-FORMULA-003'|'MAK-L3-FORMULA-004'|'MAK-L3-FORMULA-005'} FormulaErrorCode */

export class FormulaError extends Error {
  /**
   * @param {FormulaErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'FormulaError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
