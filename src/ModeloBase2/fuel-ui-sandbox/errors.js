/**
 * @typedef {'MAK-MB2-FUEL-UI-001'|'MAK-MB2-FUEL-UI-002'|'MAK-MB2-FUEL-UI-003'|'MAK-MB2-FUEL-UI-004'|'MAK-MB2-FUEL-UI-005'} ModeloBase2FuelUiSandboxErrorCode
 */

/**
 * Codes for the ModeloBase2 FUEL BETA UI SANDBOX:
 * - 001 invalid options/shape
 * - 002 headless candidate/session unavailable
 * - 003 unknown/blocked sandbox action (fail-closed)
 * - 004 invalid view model
 * - 005 snapshot/restore failure
 *
 * The fuel UI sandbox is a DEV-ONLY, ISOLATED beta surface over the fuel headless
 * candidate. It is NEVER mounted in the app, registers NO route/menu, and never
 * touches src/modules, backend/Prisma/fetch/runtimeBridge or real persistence.
 * React is confined to the sandbox components. Reversible by non-consumption.
 */

/** Typed error for the ModeloBase2 fuel UI sandbox. */
export class ModeloBase2FuelUiSandboxError extends Error {
  /**
   * @param {ModeloBase2FuelUiSandboxErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase2FuelUiSandboxError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {ModeloBase2FuelUiSandboxErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function fuelUiSandboxError(code, message, meta) {
  return new ModeloBase2FuelUiSandboxError(code, message, meta);
}

export default ModeloBase2FuelUiSandboxError;
