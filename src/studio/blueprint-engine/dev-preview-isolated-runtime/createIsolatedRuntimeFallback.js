import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ISOLATED_RUNTIME_NAME,
  ISOLATED_RUNTIME_VERSION,
  ISOLATED_RUNTIME_MODE,
  ISOLATED_RUNTIME_CAPABILITIES,
  runtimeDigest,
} from './isolatedRuntimeConfig.js';

/**
 * Builds a deterministic, safe FALLBACK isolated runtime result used when the input
 * implementation plan is invalid/absent or preflight fails. Pure — fully headless, dev-only:
 * blocked readiness, `isolatedRuntimeImplemented: false`, all forbidden capabilities false.
 * Guarantees the composer never throws.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object} fallback isolated runtime result
 */
export function createIsolatedRuntimeFallback(options = {}) {
  const reason = options && typeof options.reason === 'string' ? options.reason : 'invalid_or_missing_implementation_plan';

  const core = {
    kind: 'studio-dev-preview-isolated-runtime',
    isolatedRuntimeName: ISOLATED_RUNTIME_NAME,
    isolatedRuntimeVersion: ISOLATED_RUNTIME_VERSION,
    mode: ISOLATED_RUNTIME_MODE,
    moduleId: 'plannedModule',
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForIsolatedRuntime: false,
    readyForDevPreviewRuntimeUI: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['isolated_runtime_fallback_invalid_implementation_plan'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...ISOLATED_RUNTIME_CAPABILITIES, isolatedRuntimeImplemented: false },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, isolatedRuntimeDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeFallback;
