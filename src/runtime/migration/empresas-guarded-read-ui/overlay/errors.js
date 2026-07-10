/**
 * @typedef {'MAK-L3-EMP-OVERLAY-001'|'MAK-L3-EMP-OVERLAY-002'|'MAK-L3-EMP-OVERLAY-003'|'MAK-L3-EMP-OVERLAY-004'|'MAK-L3-EMP-OVERLAY-005'} EmpresasGuardedReadUiOverlayErrorCode
 */

/**
 * Codes:
 * - 001 flag disabled
 * - 002 production blocked (fail-closed)
 * - 003 invalid options
 * - 004 invalid model/props
 * - 005 prototype pollution blocked
 */

/**
 * Structural/configuration failures of the Empresas guarded read UI overlay are
 * represented by this typed error. The overlay is a dev-only, read-only preview
 * surface: it never writes, never touches real data or the backend — this error
 * class is how an invalid option or a pollution attempt is surfaced.
 */
export class EmpresasGuardedReadUiOverlayError extends Error {
  /**
   * @param {EmpresasGuardedReadUiOverlayErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasGuardedReadUiOverlayError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
