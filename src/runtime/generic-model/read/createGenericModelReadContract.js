import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { GENERIC_MODEL_TYPES, GENERIC_MODEL_SAFE_SOURCES } from '../contracts/genericModelContractConstants.js';

/**
 * Builds the Generic Model READ CONTRACT. Declarative, pure, passive. Describes
 * the read-only surface a model exposes and the sources considered safe/local.
 * Returns a safe copy.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {string} [options.modelType]
 * @param {boolean} [options.enabled]
 * @returns {Object}
 */
export function createGenericModelReadContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const modelType = GENERIC_MODEL_TYPES.includes(o.modelType) ? o.modelType : 'custom';

  return safeCloneGenericModel({
    kind: 'generic-model-read-contract',
    contractId: `gm-read-${typeof o.modelId === 'string' ? o.modelId : 'generic'}-${typeof o.moduleId === 'string' ? o.moduleId : 'unknown'}`,
    modelId: typeof o.modelId === 'string' ? o.modelId : null,
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    modelType,
    enabled: Boolean(o.enabled),
    readOnly: true,
    requiredFields: ['modelId', 'moduleId', 'modelType', 'source'],
    optionalFields: ['table', 'form', 'actions', 'permissions', 'validations', 'diagnostics'],
    safeSources: [...GENERIC_MODEL_SAFE_SOURCES],
    safety: { usesRealData: false, noSideEffects: true },
    fallbackAvailable: true,
    diagnostics: { backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false },
  });
}

export default createGenericModelReadContract;
