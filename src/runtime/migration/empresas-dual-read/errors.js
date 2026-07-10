/**
 * @typedef {'MAK-L3-EMP-DUALREAD-001'|'MAK-L3-EMP-DUALREAD-002'|'MAK-L3-EMP-DUALREAD-003'|'MAK-L3-EMP-DUALREAD-004'|'MAK-L3-EMP-DUALREAD-005'|'MAK-L3-EMP-DUALREAD-006'|'MAK-L3-EMP-DUALREAD-007'} EmpresasDualReadErrorCode
 */

/**
 * Codes:
 * - 001 flag disabled
 * - 002 production blocked (fail-closed)
 * - 003 invalid options
 * - 004 invalid snapshot
 * - 005 unsafe payload (depth/size)
 * - 006 data source not allowed (real data / backend)
 * - 007 prototype pollution blocked
 */

/**
 * Structural/configuration/comparison failures of the Empresas dual-read shadow
 * compare are represented by this typed error. The layer is read-only and
 * passive: it never writes, never touches real data or the backend — this error
 * class is how an invalid option/snapshot or a pollution attempt is surfaced.
 */
export class EmpresasDualReadError extends Error {
  /**
   * @param {EmpresasDualReadErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasDualReadError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
