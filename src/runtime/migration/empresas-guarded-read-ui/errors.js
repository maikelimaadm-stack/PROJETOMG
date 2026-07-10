/**
 * @typedef {'MAK-L3-EMP-GUARDED-UI-001'|'MAK-L3-EMP-GUARDED-UI-002'|'MAK-L3-EMP-GUARDED-UI-003'|'MAK-L3-EMP-GUARDED-UI-004'|'MAK-L3-EMP-GUARDED-UI-005'} EmpresasGuardedReadUiErrorCode
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
 * Structural/configuration failures of the Empresas guarded read UI slice are
 * represented by this typed error. The slice is read-only and passive: it never
 * writes, never touches real data or the backend — this error class is how an
 * invalid option or a pollution attempt is surfaced.
 */
export class EmpresasGuardedReadUiError extends Error {
  /**
   * @param {EmpresasGuardedReadUiErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasGuardedReadUiError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
