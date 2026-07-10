/**
 * @typedef {'MAK-L3-EMP-READONLY-001'|'MAK-L3-EMP-READONLY-002'|'MAK-L3-EMP-READONLY-003'|'MAK-L3-EMP-READONLY-004'|'MAK-L3-EMP-READONLY-005'|'MAK-L3-EMP-READONLY-006'|'MAK-L3-EMP-READONLY-007'} EmpresasReadOnlyErrorCode
 */

/**
 * Codes:
 * - 001 flag disabled
 * - 002 production blocked (fail-closed, no explicit override)
 * - 003 write operation blocked (create/update/delete/save/action/workflow/connector)
 * - 004 invalid operation
 * - 005 unsafe payload (depth/size)
 * - 006 data source not allowed (real data / backend)
 * - 007 prototype pollution blocked
 */

/**
 * Structural/configuration/guard failures of the Empresas read-only runtime v2
 * candidate are represented by this typed error. The candidate is read-only and
 * passive: it never writes, never touches real data or the backend — this error
 * class is how a blocked write or an invalid option is surfaced.
 */
export class EmpresasReadOnlyError extends Error {
  /**
   * @param {EmpresasReadOnlyErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasReadOnlyError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
