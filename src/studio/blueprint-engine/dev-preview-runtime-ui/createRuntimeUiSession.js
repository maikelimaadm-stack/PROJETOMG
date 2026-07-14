import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_VERSION,
  RUNTIME_UI_MODE,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  runtimeUiDigest,
} from './runtimeUiConfig.js';

/**
 * Builds the deterministic dev-only runtime UI session from a runtime UI contract. Pure — no
 * storage, no fetch, no persistence, no external side-effects. Same input -> same session.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @returns {Object}
 */
export function createRuntimeUiSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'runtime-ui-session',
    sessionId: `${moduleId}#dev-preview-runtime-ui`,
    runtimeUiVersion: RUNTIME_UI_VERSION,
    sourceRuntimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
    sourceIsolatedRuntime: ISOLATED_RUNTIME_VERSION,
    sourceImplementationPlan: IMPLEMENTATION_PLAN_VERSION,
    sourceRuntimeShellContract: RUNTIME_SHELL_CONTRACT_VERSION,
    sourceVisualContract: VISUAL_CONTRACT_VERSION,
    mode: RUNTIME_UI_MODE,
    createdFrom: 'studio-dev-preview-runtime-ui-contract',
    devOnly: true,
    isolated: true,
    syntheticDataOnly: true,
    virtualFrameDriven: true,
    seed: `runtime-ui:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiSession;
