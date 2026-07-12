/**
 * @typedef {'MAK-EMP-CERT-001'|'MAK-EMP-CERT-002'|'MAK-EMP-CERT-003'|'MAK-EMP-CERT-004'|'MAK-EMP-CERT-005'} EmpresasCertificationErrorCode
 */

/**
 * Codes for the Empresas LOCAL READ CONTRACT CERTIFICATION layer:
 * - 001 invalid options/shape
 * - 002 unknown/invalid contract version
 * - 003 digest mismatch / certification invalidated
 * - 004 breaking compatibility change
 * - 005 production/mutation/backend/prisma/fetch exposure detected
 *
 * This layer LOCAL, READ-ONLY and SYNTHETIC. It never touches a real backend/
 * Prisma/fetch/Railway/production/staging, never mutates, never uses real data,
 * and is never auto-consumed by the app. Reversible by non-consumption.
 */

/** Typed error for the Empresas local read contract certification layer. */
export class EmpresasCertificationError extends Error {
  /**
   * @param {EmpresasCertificationErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasCertificationError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {EmpresasCertificationErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function empresasCertificationError(code, message, meta) {
  return new EmpresasCertificationError(code, message, meta);
}

export default EmpresasCertificationError;
