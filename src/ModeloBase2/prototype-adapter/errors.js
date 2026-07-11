/**
 * @typedef {'MAK-MB2-P-001'|'MAK-MB2-P-002'|'MAK-MB2-P-003'|'MAK-MB2-P-004'|'MAK-MB2-P-005'|'MAK-MB2-P-006'} ModeloBase2PrototypeErrorCode
 */

/**
 * Codes for the ModeloBase2 OPERATIONAL PROTOTYPE (headless):
 * - 001 invalid options/shape
 * - 002 invalid operational read model
 * - 003 invalid operational draft
 * - 004 invalid event/payload (unsafe or forbidden target)
 * - 005 invalid/unknown operational mutation (fail-closed)
 * - 006 snapshot failure
 *
 * ModeloBase2 is a PROTOTYPE/HEADLESS second model family (operational/append/
 * event) built on the pure generic-model kernel. It never writes to a backend/
 * Prisma, never calls fetch, never touches the runtime bridge, never persists for
 * real, never renders a real screen. Reversible by non-consumption.
 */

/** Typed error for the ModeloBase2 operational prototype. */
export class ModeloBase2PrototypeError extends Error {
  /**
   * @param {ModeloBase2PrototypeErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase2PrototypeError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {ModeloBase2PrototypeErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function modeloBase2Error(code, message, meta) {
  return new ModeloBase2PrototypeError(code, message, meta);
}

export default ModeloBase2PrototypeError;
