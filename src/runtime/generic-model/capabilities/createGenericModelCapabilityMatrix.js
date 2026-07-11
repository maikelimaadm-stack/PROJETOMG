import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import {
  GENERIC_MODEL_CAPABILITY_KEYS,
  GENERIC_MODEL_DANGEROUS_CAPABILITY_KEYS,
  GENERIC_MODEL_CAPABILITY_DEFAULTS,
} from './genericModelCapabilityDefaults.js';

/**
 * Builds the CAPABILITY MATRIX consolidating capabilities per model type. Pure.
 * Every dangerous capability is false. No adapter/UI/backend import.
 *
 * @param {Object} [options]
 * @param {string[]} [options.modelTypes] Restrict to these types (defaults to all).
 * @returns {Object} capability matrix
 */
export function createGenericModelCapabilityMatrix(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const types = Array.isArray(o.modelTypes) && o.modelTypes.length > 0
    ? o.modelTypes.filter((t) => Object.prototype.hasOwnProperty.call(GENERIC_MODEL_CAPABILITY_DEFAULTS, t))
    : Object.keys(GENERIC_MODEL_CAPABILITY_DEFAULTS);

  /** @type {Record<string, Record<string, boolean>>} */
  const matrix = {};
  for (const t of types) matrix[t] = { ...GENERIC_MODEL_CAPABILITY_DEFAULTS[t] };

  return safeCloneGenericModel({
    kind: 'generic-model-capability-matrix',
    keys: [...GENERIC_MODEL_CAPABILITY_KEYS],
    dangerousCapabilities: [...GENERIC_MODEL_DANGEROUS_CAPABILITY_KEYS],
    matrix,
    // Assertion: no dangerous capability is enabled anywhere in this slice.
    dangerousAllFalse: Object.values(matrix).every((caps) => GENERIC_MODEL_DANGEROUS_CAPABILITY_KEYS.every((k) => caps[k] === false)),
    localOnly: true,
    persistenceReal: false,
  });
}

/**
 * Reads the capabilities for a single model type (safe copy) or null.
 * @param {Object} matrix A matrix produced by createGenericModelCapabilityMatrix.
 * @param {string} modelType
 * @returns {Record<string, boolean>|null}
 */
export function getGenericModelCapabilities(matrix, modelType) {
  if (!isGenericModelPlainObject(matrix) || !isGenericModelPlainObject(matrix.matrix)) return null;
  const caps = matrix.matrix[modelType];
  return isGenericModelPlainObject(caps) ? { ...caps } : null;
}

export default createGenericModelCapabilityMatrix;
