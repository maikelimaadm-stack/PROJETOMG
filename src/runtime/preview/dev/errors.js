/**
 * @typedef {'MAK-L3-DEV-PREVIEW-001'|'MAK-L3-DEV-PREVIEW-002'} EmpresasDevPreviewErrorCode
 */

/**
 * Structural/configuration failures of the dev-only visual preview (invalid
 * option, prototype-pollution attempt) are thrown as this typed error. An
 * invalid/unshaped preview model is NOT thrown — it degrades to a safe
 * fallback view model so the dev harness can never crash the app.
 */
export class EmpresasDevPreviewError extends Error {
  /**
   * @param {EmpresasDevPreviewErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasDevPreviewError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
