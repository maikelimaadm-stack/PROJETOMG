/**
 * @typedef {'MAK-MB1-LW-001'|'MAK-MB1-LW-002'|'MAK-MB1-LW-003'|'MAK-MB1-LW-004'|'MAK-MB1-LW-005'|'MAK-MB1-LW-006'|'MAK-MB1-LW-007'|'MAK-MB1-LW-008'} ModeloBase1LocalWriteErrorCode
 */

/**
 * Codes for the ModeloBase1 Controlled Local Write PLAN (in-memory, no backend):
 * - 001 invalid options/state shape
 * - 002 prototype pollution blocked
 * - 003 unsafe content (function/handler/React element) in payload
 * - 004 unknown/blocked operation (fail-closed)
 * - 005 unmasked sensitive value in payload
 * - 006 forbidden target (backend/Prisma/fetch/storage/runtimeBridge) in payload
 * - 007 flag disabled — local write plan not enabled
 * - 008 mutation target not found (e.g. updateRow/deleteRow on a missing id)
 *
 * This layer is LOCAL-ONLY and PLAN-ONLY: it plans/simulates create/update/
 * delete/save/submit against a SAFE COPY of the runtime read model, in memory.
 * It NEVER writes to a backend/Prisma, never calls fetch, never persists to
 * storage, never touches the runtime bridge, never mutates the original read
 * model. Reversible by flag.
 */

/** Typed error for the ModeloBase1 controlled local write plan. */
export class ModeloBase1LocalWriteError extends Error {
  /**
   * @param {ModeloBase1LocalWriteErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase1LocalWriteError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/** @param {ModeloBase1LocalWriteErrorCode} code @param {string} message */
export function localWriteError(code, message) {
  return new ModeloBase1LocalWriteError(code, message);
}

export default ModeloBase1LocalWriteError;
