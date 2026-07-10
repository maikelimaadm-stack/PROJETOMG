/**
 * @typedef {'MAK-MB1-BUH-001'|'MAK-MB1-BUH-002'|'MAK-MB1-BUH-003'|'MAK-MB1-BUH-004'|'MAK-MB1-BUH-005'} ModeloBase1BetaUiHardeningErrorCode
 */

/**
 * Codes for the ModeloBase1 Beta UI Hardening layer:
 * - 001 invalid options/state shape
 * - 002 prototype pollution blocked
 * - 003 unsafe content (function/handler/React element) in a read state
 * - 004 unmasked sensitive value in a read state
 * - 005 forbidden reference (backend/fetch/Prisma/storage) in a read state
 *
 * This layer is PASSIVE and READ-ONLY: it inspects an already-applied runtime
 * read state and produces a checklist + diagnostics. It never writes, never
 * calls the backend/Prisma/fetch, never touches real data or storage.
 */

/** Typed error for the ModeloBase1 beta UI hardening layer. */
export class ModeloBase1BetaUiHardeningError extends Error {
  /**
   * @param {ModeloBase1BetaUiHardeningErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase1BetaUiHardeningError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/** @param {ModeloBase1BetaUiHardeningErrorCode} code @param {string} message */
export function hardeningError(code, message) {
  return new ModeloBase1BetaUiHardeningError(code, message);
}

export default ModeloBase1BetaUiHardeningError;
