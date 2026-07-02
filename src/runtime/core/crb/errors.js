/** @typedef {'MAK-L3-RUNTIME-002'|'MAK-L3-RUNTIME-003'|'MAK-L3-RUNTIME-004'|'MAK-L3-CRB-001'} CrbErrorCode */

export class CrbError extends Error {
  /**
   * @param {CrbErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'CrbError';
    this.code = code;
  }
}
