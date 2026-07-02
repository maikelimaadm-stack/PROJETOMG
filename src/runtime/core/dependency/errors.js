/** @typedef {'MAK-L3-DEP-001'|'MAK-L3-DEP-002'|'MAK-L3-DEP-003'} DependencyErrorCode */

export class DependencyError extends Error {
  /**
   * @param {DependencyErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'DependencyError';
    this.code = code;
  }
}
