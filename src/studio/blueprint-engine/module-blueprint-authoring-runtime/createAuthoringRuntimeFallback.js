import {
  AUTHORING_RUNTIME_NAME,
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_RUNTIME_MODE,
  AUTHORING_RUNTIME_CAPABILITIES,
} from './authoringRuntimeConfig.js';
import { isPlainObject, safeString } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Safe, fail-closed fallback for an invalid/missing/fallback authoring implementation plan. Never
 * throws; authorizes nothing. Pure. @param {Object} [options] @returns {Object}
 */
export function createAuthoringRuntimeFallback(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const reason = safeString(o.reason, 'invalid_or_missing_authoring_implementation_plan', 400);
  const core = {
    kind: 'studio-module-blueprint-authoring-runtime',
    authoringRuntimeName: AUTHORING_RUNTIME_NAME,
    authoringRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    mode: AUTHORING_RUNTIME_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForAuthoringRuntime: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundation: true,
    blockers: ['invalid_or_missing_authoring_implementation_plan'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...AUTHORING_RUNTIME_CAPABILITIES },
    metadataOnly: true,
  };
  return Object.freeze({ ...core, overallDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimeFallback;
