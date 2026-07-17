import { DEFAULT_AUTHORING_RESOURCE_LIMITS } from './authoringRuntimeConfig.js';
import { safeNonNegativeInt, isPlainObject } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Builds a deterministic, frozen resource-limits policy. Defaults are conservative; overrides are
 * accepted only as non-negative integers (invalid overrides fall back to the default). Pure.
 *
 * @param {Object} [overrides]
 * @returns {Object}
 */
export function createAuthoringResourceLimits(overrides = {}) {
  const o = isPlainObject(overrides) ? overrides : {};
  /** @type {Record<string, number>} */
  const limits = {};
  for (const key of Object.keys(DEFAULT_AUTHORING_RESOURCE_LIMITS)) {
    limits[key] = safeNonNegativeInt(o[key], DEFAULT_AUTHORING_RESOURCE_LIMITS[key]);
  }
  const core = {
    kind: 'authoring-resource-limits',
    ...limits,
    failClosedOnExcess: true,
    silentTruncation: false,
  };
  return Object.freeze({ ...core, limitsDigest: createDeterministicDigest(core) });
}

export default createAuthoringResourceLimits;
