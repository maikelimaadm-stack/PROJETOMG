import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';

/**
 * Builds a Generic Model FALLBACK state — a neutral, safe state that preserves
 * legacy/previous behavior when the generic path is off, invalid, or errors.
 * Pure, passive; never executes anything. Returns a safe copy.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {string} [options.operation]
 * @param {string} [options.reason]
 * @param {string} [options.source] Where the fallback falls back TO.
 * @param {Object} [options.safeState] Optional safe state snapshot to carry.
 * @returns {Object}
 */
export function createGenericModelFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  return safeCloneGenericModel({
    kind: 'generic-model-fallback',
    fallbackApplied: true,
    fallbackReason: typeof o.reason === 'string' ? o.reason : 'generic-model-disabled',
    fallbackSource: 'generic-model',
    targetSource: typeof o.source === 'string' ? o.source : 'legacy',
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    modelId: typeof o.modelId === 'string' ? o.modelId : null,
    operation: typeof o.operation === 'string' ? o.operation : null,
    safeState: isGenericModelPlainObject(o.safeState) ? o.safeState : null,
    diagnostics: {
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      persistenceReal: false,
    },
    reversible: true,
    noSideEffects: true,
  });
}

export default createGenericModelFallback;
