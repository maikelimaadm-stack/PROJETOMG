/**
 * Error catalog + safe error descriptor for the bridge. Descriptors are pure data: sanitized,
 * side-effect-free, and never carry secrets or authorize anything real.
 */

export const BRIDGE_ERROR_CODES = Object.freeze([
  'BRIDGE_INVALID_OPTIONS',
  'BRIDGE_INVALID_CONFIG',
  'BRIDGE_INVALID_EXECUTE_INPUT',
  'BRIDGE_EXECUTION_FAILED',
]);

const CODE_SET = new Set(BRIDGE_ERROR_CODES);

/** @param {string} code @returns {boolean} */
export function isBridgeErrorCode(code) {
  return CODE_SET.has(code);
}

export class BridgeError extends Error {
  /** @param {string} code @param {string} [message] @param {Record<string, unknown>} [meta] */
  constructor(code, message, meta) {
    super(message || code);
    this.name = 'BridgeError';
    this.code = isBridgeErrorCode(code) ? code : 'BRIDGE_INVALID_OPTIONS';
    this.meta = meta && typeof meta === 'object' ? { ...meta } : {};
  }
}

/** Builds a SANITIZED, side-effect-free error descriptor. @param {string} code @param {Object} [options] */
export function createBridgeError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const safeCode = isBridgeErrorCode(code) ? code : 'BRIDGE_INVALID_OPTIONS';
  return Object.freeze({
    kind: 'bridge-error',
    code: safeCode,
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : safeCode,
    safe: true,
    sideEffects: false,
    certificationPerformed: false,
    realDataRead: false,
    persisted: false,
  });
}

/** @param {string} code @param {string} [message] @param {Record<string, unknown>} [meta] */
export function bridgeError(code, message, meta) {
  return new BridgeError(code, message, meta);
}

export default BridgeError;
