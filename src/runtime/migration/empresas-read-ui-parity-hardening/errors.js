/**
 * @typedef {'MAK-L3-EMP-PARITY-001'|'MAK-L3-EMP-PARITY-002'|'MAK-L3-EMP-PARITY-003'|'MAK-L3-EMP-PARITY-004'|'MAK-L3-EMP-PARITY-005'} EmpresasReadUiParityErrorCode
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
 * Structural/configuration failures of the Empresas read UI parity hardening are
 * represented by this typed error. The hardening layer is pure and passive: it
 * never migrates, writes, or touches real data/the backend — it only produces a
 * deterministic checklist/score/diagnostics over the existing read UI models.
 */
export class EmpresasReadUiParityError extends Error {
  /**
   * @param {EmpresasReadUiParityErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasReadUiParityError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
