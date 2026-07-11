/**
 * @typedef {'MAK-MB2-FUEL-DPR-001'|'MAK-MB2-FUEL-DPR-002'|'MAK-MB2-FUEL-DPR-003'|'MAK-MB2-FUEL-DPR-004'} ModeloBase2FuelDevPreviewErrorCode
 */

/**
 * Codes for the ModeloBase2 FUEL DEV PREVIEW ROUTE:
 * - 001 invalid options/shape
 * - 002 access denied / route disabled
 * - 003 preview state failure
 * - 004 fixtures failure
 *
 * The dev preview route is a DEV-ONLY, guarded surface over the fuel UI sandbox.
 * It never appears in the menu, never touches src/modules, backend/Prisma/fetch/
 * runtimeBridge or real persistence. Reversible by non-consumption.
 */

/** Typed error for the ModeloBase2 fuel dev preview route. */
export class ModeloBase2FuelDevPreviewError extends Error {
  /**
   * @param {ModeloBase2FuelDevPreviewErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase2FuelDevPreviewError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {ModeloBase2FuelDevPreviewErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function fuelDevPreviewError(code, message, meta) {
  return new ModeloBase2FuelDevPreviewError(code, message, meta);
}

export default ModeloBase2FuelDevPreviewError;
