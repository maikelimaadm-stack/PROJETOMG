import {
  isGenericModelPlainObject,
  sanitizeGenericModelPayload,
  detectGenericModelUnsafeMarkers,
} from '../../runtime/generic-model/index.js';

/**
 * A thin SAFETY BRIDGE that lets ModeloBase1 use the generic kernel's safety for
 * a payload (sanitize + unsafe-marker detection + sensitive masking). Pure. It
 * blocks functions/handlers/React elements/prototype pollution and forbidden
 * backend/Prisma/runtimeBridge/fetch/storage targets. It does not replace the
 * existing ModeloBase1 validators — it proves safe integration.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} safety bridge
 */
export function createModeloBase1GenericSafetyBridge(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';

  return {
    kind: 'modelobase1-generic-safety-bridge',
    moduleId,
    /**
     * Sanitizes a payload via the generic kernel. Returns { safe, sanitized,
     * blockers, maskedKeys, ... }.
     * @param {unknown} payload
     */
    sanitize(payload) {
      return sanitizeGenericModelPayload({ payload, label: `${moduleId} payload` });
    },
    /**
     * Detects unsafe markers (function/handler/React/pollution/refs). Returns
     * { safe, unsafeMarkers, sensitiveKeys, forbiddenTargets }.
     * @param {unknown} payload
     */
    detect(payload) {
      return detectGenericModelUnsafeMarkers(payload);
    },
    /**
     * True when the payload is safe to use (no unsafe markers, no unmasked
     * sensitive, no forbidden target).
     * @param {unknown} payload
     * @returns {boolean}
     */
    isSafe(payload) {
      return sanitizeGenericModelPayload({ payload }).safe;
    },
  };
}

export default createModeloBase1GenericSafetyBridge;
