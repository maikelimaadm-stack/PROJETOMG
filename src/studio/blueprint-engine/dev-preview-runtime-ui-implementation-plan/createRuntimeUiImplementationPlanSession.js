import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  uiPlanDigest,
} from './runtimeUiImplementationPlanConfig.js';

/**
 * Builds the deterministic PLAN session from a runtime UI contract. Pure — no storage, no fetch,
 * no persistence, no external side-effects. Same input -> same session + digest.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @returns {Object}
 */
export function createRuntimeUiImplementationPlanSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'runtime-ui-implementation-plan-session',
    sessionId: `${moduleId}#dev-preview-runtime-ui-implementation-plan`,
    runtimeUiImplementationPlanVersion: RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
    sourceRuntimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
    sourceIsolatedRuntime: ISOLATED_RUNTIME_VERSION,
    sourceVirtualPreviewFrameContract: RUNTIME_UI_CONTRACT_VERSION,
    sourceImplementationPlan: IMPLEMENTATION_PLAN_VERSION,
    sourceRuntimeShellContract: RUNTIME_SHELL_CONTRACT_VERSION,
    sourceVisualContract: VISUAL_CONTRACT_VERSION,
    mode: RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
    createdFrom: 'studio-dev-preview-runtime-ui-contract',
    seed: `runtime-ui-implementation-plan:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: uiPlanDigest(core) });
}

export default createRuntimeUiImplementationPlanSession;
