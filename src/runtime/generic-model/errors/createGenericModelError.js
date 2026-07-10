import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { detectGenericModelUnsafeMarkers, GENERIC_MODEL_SENSITIVE_KEY_PATTERN, GENERIC_MODEL_SENSITIVE_MASK } from '../safety/detectGenericModelUnsafeMarkers.js';
import { GENERIC_MODEL_ERROR_CODES } from './genericModelErrorCodes.js';

const DEFAULT_TIMESTAMP = '1970-01-01T00:00:00.000Z';

/**
 * Masks sensitive keys and strips prototype-pollution keys in a details object.
 * Operates on a JSON-cloned copy (functions/React already dropped), so it only
 * needs to handle plain data.
 */
function maskDetails(value) {
  if (Array.isArray(value)) return value.map(maskDetails);
  if (isGenericModelPlainObject(value)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      out[k] = GENERIC_MODEL_SENSITIVE_KEY_PATTERN.test(k) && typeof v !== 'object' ? GENERIC_MODEL_SENSITIVE_MASK : maskDetails(v);
    }
    return out;
  }
  return value;
}

/**
 * Builds a structured, PLAIN generic model error object (does NOT throw by
 * default). Sensitive details are masked; functions/React elements are dropped.
 * Deterministic when `clock` is injected (defaults to a fixed timestamp).
 *
 * @param {Object} [options]
 * @param {string} [options.code] One of GM-RUNTIME-0xx.
 * @param {string} [options.message]
 * @param {string} [options.moduleId]
 * @param {string} [options.modelId]
 * @param {string} [options.operation]
 * @param {unknown} [options.details] Arbitrary details — masked/sanitized.
 * @param {string} [options.remediation]
 * @param {() => string} [options.clock]
 * @returns {Object}
 */
export function createGenericModelError(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const code = typeof o.code === 'string' && GENERIC_MODEL_ERROR_CODES[o.code] ? o.code : 'GM-RUNTIME-002';
  const meta = GENERIC_MODEL_ERROR_CODES[code];
  const timestamp = typeof o.clock === 'function' ? String(o.clock()) : DEFAULT_TIMESTAMP;

  // Sanitize details: drop functions/React (via clone), mask sensitive keys.
  const cloned = o.details === undefined ? null : safeCloneGenericModel(o.details);
  const safeDetails = cloned === null ? null : maskDetails(cloned);
  const detailReport = detectGenericModelUnsafeMarkers(o.details);

  return {
    kind: 'generic-model-error',
    code,
    message: typeof o.message === 'string' ? o.message : meta.label,
    severity: meta.severity,
    category: meta.category,
    blocking: meta.blocking,
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    modelId: typeof o.modelId === 'string' ? o.modelId : null,
    operation: typeof o.operation === 'string' ? o.operation : null,
    safeDetails,
    remediation: typeof o.remediation === 'string' ? o.remediation : null,
    timestamp,
    diagnostics: {
      maskedSensitive: detailReport.sensitiveKeys.length > 0,
      droppedUnsafe: detailReport.unsafeMarkers.length > 0,
      noSideEffects: true,
    },
  };
}

export default createGenericModelError;
