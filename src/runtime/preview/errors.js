/**
 * @typedef {'MAK-L3-PREVIEW-001'|'MAK-L3-PREVIEW-002'} ControlledPreviewErrorCode
 */

/**
 * Structural/configuration failures of the Controlled Preview itself
 * (invalid option, invalid input shape, prototype-pollution attempt) are
 * thrown as this typed error. Failures of the underlying table/form
 * projection are never thrown — they are captured and returned in the
 * preview report so a projection failure can never reach the Empresas UI.
 */
export class ControlledPreviewError extends Error {
  /**
   * @param {ControlledPreviewErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ControlledPreviewError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
