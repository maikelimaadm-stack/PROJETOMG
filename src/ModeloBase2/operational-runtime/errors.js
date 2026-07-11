/**
 * @typedef {'MAK-MB2-OR-001'|'MAK-MB2-OR-002'|'MAK-MB2-OR-003'|'MAK-MB2-OR-004'|'MAK-MB2-OR-005'|'MAK-MB2-OR-006'|'MAK-MB2-OR-007'} ModeloBase2OperationalRuntimeErrorCode
 */

/**
 * Codes for the ModeloBase2 OPERATIONAL RUNTIME FOUNDATION (headless):
 * - 001 invalid options/shape
 * - 002 runtime/session not initialized or disabled
 * - 003 unknown/blocked command (fail-closed)
 * - 004 invalid command payload (unsafe or forbidden target)
 * - 005 invalid state transition
 * - 006 event log failure
 * - 007 snapshot/restore failure
 *
 * The operational runtime evolves the ModeloBase2 prototype into a reusable
 * HEADLESS operational foundation (session + state machine + command + event log +
 * derived read state + snapshot bridge). It never renders, never touches a
 * backend/Prisma/fetch/runtimeBridge, never persists for real, never sends.
 * Reversible by non-consumption.
 */

/** Typed error for the ModeloBase2 operational runtime foundation. */
export class ModeloBase2OperationalRuntimeError extends Error {
  /**
   * @param {ModeloBase2OperationalRuntimeErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase2OperationalRuntimeError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/**
 * @param {ModeloBase2OperationalRuntimeErrorCode} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function operationalRuntimeError(code, message, meta) {
  return new ModeloBase2OperationalRuntimeError(code, message, meta);
}

export default ModeloBase2OperationalRuntimeError;
