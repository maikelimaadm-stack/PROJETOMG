/** @typedef {'MAK-L3-LOCATOR-001'|'MAK-L3-LOCATOR-002'|'MAK-L3-LOCATOR-003'} ServiceLocatorErrorCode */

export class ServiceLocatorError extends Error {
  /**
   * @param {ServiceLocatorErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ServiceLocatorError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
