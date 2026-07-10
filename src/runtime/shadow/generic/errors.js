/**
 * @typedef {'MAK-L3-GENERIC-SHADOW-001'|'MAK-L3-GENERIC-SHADOW-002'} GenericModuleShadowErrorCode
 */

/**
 * Structural/configuration failures of the generic module shadow layer
 * (invalid descriptor, invalid option, prototype-pollution attempt) are
 * thrown as this typed error. Failures of the underlying RuntimeShadowMode
 * pass are never thrown — they are captured and returned in the report so a
 * shadow failure can never reach a real screen.
 */
export class GenericModuleShadowError extends Error {
  /**
   * @param {GenericModuleShadowErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'GenericModuleShadowError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
