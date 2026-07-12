/**
 * @typedef {'MAK-EMP-LOCAL-READ-001'|'MAK-EMP-LOCAL-READ-002'|'MAK-EMP-LOCAL-READ-003'|'MAK-EMP-LOCAL-READ-004'|'MAK-EMP-LOCAL-READ-005'} EmpresasLocalReadErrorCode
 */

/**
 * Codes for the Empresas LOCAL READ-ONLY CONTRACT PILOT:
 * - 001 mutation blocked (any write attempt)
 * - 002 invalid options/shape
 * - 003 invalid read query
 * - 004 invalid/denied tenant context (fail-closed)
 * - 005 parity mismatch / fallback blocked
 *
 * This pilot is LOCAL, READ-ONLY and SYNTHETIC. It never touches a real backend/
 * Prisma/fetch/Railway/production, never mutates, never uses real data. Reversible
 * by non-consumption.
 */

/** Typed error for the Empresas local read-only contract pilot. */
export class EmpresasLocalReadError extends Error {
  /**
   * @param {EmpresasLocalReadErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasLocalReadError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {EmpresasLocalReadErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function empresasLocalReadError(code, message, meta) {
  return new EmpresasLocalReadError(code, message, meta);
}

export default EmpresasLocalReadError;
