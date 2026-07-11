/**
 * @typedef {'MAK-MB2-FUEL-001'|'MAK-MB2-FUEL-002'|'MAK-MB2-FUEL-003'|'MAK-MB2-FUEL-004'|'MAK-MB2-FUEL-005'|'MAK-MB2-FUEL-006'} ModeloBase2FuelErrorCode
 */

/**
 * Codes for the ModeloBase2 FUEL HEADLESS CANDIDATE:
 * - 001 invalid options/shape
 * - 002 candidate/adapter not initialized or disabled
 * - 003 unknown/blocked fuel command (fail-closed)
 * - 004 invalid fuel payload (unsafe, forbidden target, or domain rule)
 * - 005 runtime/session unavailable
 * - 006 snapshot/restore failure
 *
 * The fuel headless candidate is the first REAL-domain candidate on the ModeloBase2
 * operational runtime — but stays HEADLESS: no UI/route/menu, no src/modules, no
 * backend/Prisma/fetch/runtimeBridge, no real persistence, never sends. Reversible
 * by non-consumption.
 */

/** Typed error for the ModeloBase2 fuel headless candidate. */
export class ModeloBase2FuelError extends Error {
  /**
   * @param {ModeloBase2FuelErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase2FuelError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {ModeloBase2FuelErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function fuelError(code, message, meta) {
  return new ModeloBase2FuelError(code, message, meta);
}

export default ModeloBase2FuelError;
