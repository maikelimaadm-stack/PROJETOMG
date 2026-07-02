/** @typedef {'MAK-L3-LOADER-001'|'MAK-L3-LOADER-002'|'MAK-L3-LOADER-003'|'MAK-L3-LOADER-004'} LoaderErrorCode */

export class LoaderError extends Error {
  /**
   * @param {LoaderErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'LoaderError';
    this.code = code;
  }
}
