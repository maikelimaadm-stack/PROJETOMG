/**
 * @typedef {'MAK-L3-MB1-BETA-001'|'MAK-L3-MB1-BETA-002'|'MAK-L3-MB1-BETA-003'|'MAK-L3-MB1-BETA-004'|'MAK-L3-MB1-BETA-005'|'MAK-L3-MB1-BETA-006'|'MAK-L3-MB1-BETA-007'} ModeloBase1DirectBetaErrorCode
 */

/**
 * Codes for the ModeloBase1 direct beta activation (Empresas + Campos):
 * - 001 flag disabled (no read model injected — fallback to legacy config)
 * - 002 production blocked (fail-closed, no explicit `*_ALLOW_PROD` override)
 * - 003 write operation blocked (read-only beta; no write path exists yet)
 * - 004 invalid option / unknown module / invalid shape
 * - 005 unsafe payload (depth/size)
 * - 006 data source not allowed (real data / backend / Prisma)
 * - 007 prototype pollution blocked
 */

/**
 * Typed error for the ModeloBase1 direct beta activation. This layer is a
 * READ-ONLY beta: it injects a runtime v2 read model into the ModeloBase1 config
 * behind a feature flag, with total fallback when the flag is off. It never
 * writes, never calls the backend/Prisma, never touches real data — this error
 * class is how a blocked write or an invalid option is surfaced.
 */
export class ModeloBase1DirectBetaError extends Error {
  /**
   * @param {ModeloBase1DirectBetaErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase1DirectBetaError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/** @param {ModeloBase1DirectBetaErrorCode} code @param {string} message */
export function directBetaError(code, message) {
  return new ModeloBase1DirectBetaError(code, message);
}

export default ModeloBase1DirectBetaError;
