/**
 * @typedef {'MAK-EMP-HARD-001'|'MAK-EMP-HARD-002'|'MAK-EMP-HARD-003'|'MAK-EMP-HARD-004'|'MAK-EMP-HARD-005'} EmpresasReadHardeningErrorCode
 */

/**
 * Codes for the Empresas LOCAL READ PARITY HARDENING layer:
 * - 001 invalid options/shape
 * - 002 invalid dataset profile
 * - 003 parity/digest mismatch
 * - 004 tenant leakage / permission bypass detected
 * - 005 mutation/production/backend/prisma/fetch exposure detected
 *
 * This layer LOCAL, READ-ONLY and SYNTHETIC. It never touches a real backend/
 * Prisma/fetch/Railway/production, never mutates, never uses real data. Reversible
 * by non-consumption.
 */

/** Typed error for the Empresas read parity hardening layer. */
export class EmpresasReadHardeningError extends Error {
  /**
   * @param {EmpresasReadHardeningErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasReadHardeningError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {EmpresasReadHardeningErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function empresasReadHardeningError(code, message, meta) {
  return new EmpresasReadHardeningError(code, message, meta);
}

export default EmpresasReadHardeningError;
