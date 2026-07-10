/**
 * @typedef {'MAK-L3-EMP-READ-SLOT-001'|'MAK-L3-EMP-READ-SLOT-002'|'MAK-L3-EMP-READ-SLOT-003'|'MAK-L3-EMP-READ-SLOT-004'|'MAK-L3-EMP-READ-SLOT-005'} EmpresasReadSlotErrorCode
 */

/**
 * Codes:
 * - 001 flag disabled
 * - 002 production blocked (fail-closed)
 * - 003 invalid options
 * - 004 invalid model/payload/props
 * - 005 prototype pollution blocked
 */

/**
 * Structural/configuration failures of the Empresas runtime bridge read slot
 * candidate are represented by this typed error. The candidate is pure and
 * passive: it describes a future read-only slot and validates a read-only
 * payload WITHOUT mounting anything, without writing, and without touching the
 * real runtime bridge, real data, or the backend.
 */
export class EmpresasReadSlotError extends Error {
  /**
   * @param {EmpresasReadSlotErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasReadSlotError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
