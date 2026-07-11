/**
 * @typedef {'MAK-MB1-GKC-001'|'MAK-MB1-GKC-002'|'MAK-MB1-GKC-003'|'MAK-MB1-GKC-004'} ModeloBase1GenericKernelConsumptionErrorCode
 */

/**
 * Codes for the EMPRESAS/CADCPS GENERIC KERNEL CONSUMPTION layer:
 * - 001 invalid options/shape
 * - 002 read state missing/invalid for consumption
 * - 003 adapter mapping failed (read→generic or generic→read)
 * - 004 generic validation rejected the read model
 *
 * This layer routes the applied ModeloBase1 read state through the pure
 * generic-model kernel behind a flag, WITHOUT replacing the current ModeloBase1
 * flow. Every failure is recoverable: it falls back to the current ModeloBase1
 * flow. It never writes to a backend/Prisma, never calls fetch, never touches
 * the runtime bridge, never persists for real. Reversible.
 */

/** Typed error for the ModeloBase1 generic kernel consumption layer. */
export class ModeloBase1GenericKernelConsumptionError extends Error {
  /**
   * @param {ModeloBase1GenericKernelConsumptionErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase1GenericKernelConsumptionError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {ModeloBase1GenericKernelConsumptionErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function consumptionError(code, message, meta) {
  return new ModeloBase1GenericKernelConsumptionError(code, message, meta);
}

export default ModeloBase1GenericKernelConsumptionError;
