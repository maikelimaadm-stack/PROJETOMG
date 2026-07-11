/**
 * @typedef {'MAK-MB1-GA-001'|'MAK-MB1-GA-002'|'MAK-MB1-GA-003'|'MAK-MB1-GA-004'|'MAK-MB1-GA-005'} ModeloBase1GenericAdapterErrorCode
 */

/**
 * Codes for the ModeloBase1 → Generic Model Kernel ADAPTER:
 * - 001 invalid options/shape
 * - 002 invalid ModeloBase1 read state
 * - 003 mapping failed (read model / state)
 * - 004 write bridge blocked/invalid
 * - 005 persistence bridge failure
 *
 * The adapter is a THIN, additive bridge: it lets ModeloBase1 consume the pure
 * generic-model kernel (safety/fallback/diagnostics/versioning/snapshot/write
 * validation) WITHOUT replacing the current ModeloBase1 flow. It never writes to
 * a backend/Prisma, never calls fetch, never touches the runtime bridge, never
 * persists for real. Reversible.
 */

/** Typed error for the ModeloBase1 generic-model adapter. */
export class ModeloBase1GenericAdapterError extends Error {
  /**
   * @param {ModeloBase1GenericAdapterErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase1GenericAdapterError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/** @param {ModeloBase1GenericAdapterErrorCode} code @param {string} message */
export function adapterError(code, message) {
  return new ModeloBase1GenericAdapterError(code, message);
}

export default ModeloBase1GenericAdapterError;
