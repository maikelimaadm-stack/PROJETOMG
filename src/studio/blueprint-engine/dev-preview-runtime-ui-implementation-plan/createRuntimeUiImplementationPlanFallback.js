import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
  RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES,
  uiPlanDigest,
} from './runtimeUiImplementationPlanConfig.js';

/**
 * Builds a safe, fail-closed fallback plan for an invalid/missing/fallback runtime UI contract.
 * Never throws; authorizes nothing. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createRuntimeUiImplementationPlanFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_runtime_ui_contract';

  const core = {
    kind: 'studio-dev-preview-runtime-ui-implementation-plan',
    runtimeUiImplementationPlanName: RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
    runtimeUiImplementationPlanVersion: RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
    mode: RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForRuntimeUiImplementationPlan: false,
    readyForRuntimeUiImplementationSlice: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['invalid_or_missing_runtime_ui_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: uiPlanDigest(core) });
}

export default createRuntimeUiImplementationPlanFallback;
