/**
 * @typedef {'MAK-MB2-FUEL-MSR-001'|'MAK-MB2-FUEL-MSR-002'|'MAK-MB2-FUEL-MSR-003'|'MAK-MB2-FUEL-MSR-004'|'MAK-MB2-FUEL-MSR-005'|'MAK-MB2-FUEL-MSR-006'} ModeloBase2FuelModuleShellErrorCode
 */

/**
 * Codes for the ModeloBase2 FUEL MODULE SHELL READINESS layer:
 * - 001 invalid options/shape
 * - 002 invalid module contract
 * - 003 invalid metadata
 * - 004 invalid route/menu/permission plan
 * - 005 invalid persistence boundary
 * - 006 invalid ui composition
 *
 * This layer PREPARES a future real fuel module — it NEVER registers a real
 * module/route/menu, NEVER touches src/modules/pages, App.jsx, the menu,
 * backend/Prisma/fetch/runtimeBridge or real persistence. Reversible by
 * non-consumption.
 */

/** Typed error for the ModeloBase2 fuel module shell readiness layer. */
export class ModeloBase2FuelModuleShellError extends Error {
  /**
   * @param {ModeloBase2FuelModuleShellErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase2FuelModuleShellError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {ModeloBase2FuelModuleShellErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function fuelModuleShellError(code, message, meta) {
  return new ModeloBase2FuelModuleShellError(code, message, meta);
}

export default ModeloBase2FuelModuleShellError;
