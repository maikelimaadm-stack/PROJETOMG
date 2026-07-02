/** @typedef {'MAK-L3-RUNTIME-001' | 'MAK-L3-RUNTIME-002' | 'MAK-L3-RUNTIME-003'} RuntimeErrorCode */

export class RuntimeBootstrapError extends Error {
  /**
   * @param {RuntimeErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'RuntimeBootstrapError';
    this.code = code;
  }
}
