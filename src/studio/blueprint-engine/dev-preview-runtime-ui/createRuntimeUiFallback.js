import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_NAME,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_MODE,
  RUNTIME_UI_CAPABILITIES,
  runtimeUiDigest,
} from './runtimeUiConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback runtime UI contract or a
 * failed preflight. Never throws; renders nothing real; authorizes nothing. Pure and
 * deterministic. (The renderable React fallback lives in `RuntimeUiFallback.jsx`; this returns
 * the metadata fallback.)
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createRuntimeUiFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_runtime_ui_contract';

  const core = {
    kind: 'studio-dev-preview-runtime-ui',
    runtimeUiName: RUNTIME_UI_NAME,
    runtimeUiVersion: RUNTIME_UI_VERSION,
    mode: RUNTIME_UI_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForRuntimeUi: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['invalid_or_missing_runtime_ui_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...RUNTIME_UI_CAPABILITIES, uiCreated: false, runtimeUiImplemented: false, visualRuntimeImplemented: false, reactComponentCreated: false, jsxCreated: false, reactRuntimeCreated: false },
    blockedActionsOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiFallback;
