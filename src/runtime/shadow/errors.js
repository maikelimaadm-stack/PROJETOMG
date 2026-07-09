/**
 * @typedef {'MAK-L3-SHADOW-001'|'MAK-L3-SHADOW-002'|'MAK-L3-SHADOW-003'|'MAK-L3-SHADOW-004'} RuntimeShadowModeErrorCode
 */

/**
 * Structural/configuration failures of the Shadow Mode adapter itself
 * (invalid option, invalid input shape, prototype-pollution attempt,
 * diagnostics-buffer overflow) are thrown as this typed error. Runtime v2
 * *execution* failures during a shadow pass are never thrown — they are
 * captured and returned as data so they can never reach the production UI.
 */
export class RuntimeShadowModeError extends Error {
  /**
   * @param {RuntimeShadowModeErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RuntimeShadowModeError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
