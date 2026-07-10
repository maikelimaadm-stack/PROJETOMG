/**
 * @typedef {'MAK-MB1-LP-001'|'MAK-MB1-LP-002'|'MAK-MB1-LP-003'|'MAK-MB1-LP-004'|'MAK-MB1-LP-005'|'MAK-MB1-LP-006'|'MAK-MB1-LP-007'|'MAK-MB1-LP-008'} ModeloBase1LocalPersistenceErrorCode
 */

/**
 * Codes for the ModeloBase1 LOCAL PERSISTENCE VALIDATION (in-memory, no backend):
 * - 001 invalid options/shape
 * - 002 prototype pollution blocked
 * - 003 unsafe content (function/handler/React element) in draft/snapshot
 * - 004 invalid/absent snapshot (validation failed)
 * - 005 unmasked sensitive value
 * - 006 forbidden target (backend/Prisma/fetch/storage/runtimeBridge)
 * - 007 checksum mismatch
 * - 008 moduleId mismatch
 *
 * This layer VALIDATES a local persistence foundation for ModeloBase1 beta
 * drafts. It is LOCAL-ONLY and VALIDATION-ONLY: it never writes to a backend/
 * Prisma, never calls fetch, never persists to real storage (memory/injected
 * adapter only), never touches the runtime bridge. `persistenceReal` is always
 * false. Reversible by flag.
 */

/** Typed error for the ModeloBase1 local persistence validation. */
export class ModeloBase1LocalPersistenceError extends Error {
  /**
   * @param {ModeloBase1LocalPersistenceErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase1LocalPersistenceError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/** @param {ModeloBase1LocalPersistenceErrorCode} code @param {string} message */
export function persistenceError(code, message) {
  return new ModeloBase1LocalPersistenceError(code, message);
}

export default ModeloBase1LocalPersistenceError;
