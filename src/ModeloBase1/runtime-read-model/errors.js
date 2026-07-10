/**
 * @typedef {'MAK-MB1-RW-001'|'MAK-MB1-RW-002'|'MAK-MB1-RW-003'|'MAK-MB1-RW-004'|'MAK-MB1-RW-005'|'MAK-MB1-RW-006'|'MAK-MB1-RW-007'|'MAK-MB1-RW-008'} ModeloBase1RuntimeReadErrorCode
 */

/**
 * Codes for the ModeloBase1 Runtime Wiring (consuming `config.runtimeReadModel`):
 * - 001 invalid config/options shape
 * - 002 runtime read model absent (fallback to legacy)
 * - 003 runtime read model present but disabled/skipped (fallback)
 * - 004 runtime read model invalid (contract validation failed → fallback)
 * - 005 unsafe resolved payload (function/handler/React element/pollution/unmasked sensitive)
 * - 006 write guard missing or write not blocked (read-only invariant broken → fallback)
 * - 007 internal error while resolving/applying (fallback)
 * - 008 forbidden reference (backend/fetch/Prisma/storage) in the model
 *
 * This wiring is READ-ONLY and additive: it never writes, never calls the
 * backend/Prisma, never touches real data. When anything is off/invalid/unsafe
 * it FALLS BACK to the legacy ModeloBase1 behavior — the screen never breaks.
 */

/**
 * Typed error for the ModeloBase1 runtime read-model wiring.
 */
export class ModeloBase1RuntimeReadError extends Error {
  /**
   * @param {ModeloBase1RuntimeReadErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModeloBase1RuntimeReadError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}

/** @param {ModeloBase1RuntimeReadErrorCode} code @param {string} message */
export function runtimeReadError(code, message) {
  return new ModeloBase1RuntimeReadError(code, message);
}

export default ModeloBase1RuntimeReadError;
