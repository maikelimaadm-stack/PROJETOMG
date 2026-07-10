/**
 * @typedef {'MAK-L3-EMP-BRIDGE-DRY-001'|'MAK-L3-EMP-BRIDGE-DRY-002'|'MAK-L3-EMP-BRIDGE-DRY-003'|'MAK-L3-EMP-BRIDGE-DRY-004'|'MAK-L3-EMP-BRIDGE-DRY-005'} EmpresasBridgeDryRunErrorCode
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
 * Structural/configuration failures of the Empresas read UI runtime bridge dry
 * run are represented by this typed error. The dry run is pure and passive: it
 * simulates a future read-only bridge WITHOUT mounting anything, without writing,
 * and without touching the real runtime bridge, real data, or the backend.
 */
export class EmpresasBridgeDryRunError extends Error {
  /**
   * @param {EmpresasBridgeDryRunErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasBridgeDryRunError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
