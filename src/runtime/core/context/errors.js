/** @typedef {'MAK-L2-CONTEXT-001' | 'MAK-L2-CONTEXT-002'} ContextErrorCode */

export class ContextError extends Error {
  /**
   * @param {ContextErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'ContextError';
    this.code = code;
  }
}
