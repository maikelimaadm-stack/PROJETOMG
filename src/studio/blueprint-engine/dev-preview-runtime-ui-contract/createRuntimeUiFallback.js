import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_CONTRACT_NAME,
  RUNTIME_UI_CONTRACT_VERSION,
  RUNTIME_UI_CONTRACT_MODE,
  RUNTIME_UI_CONTRACT_CAPABILITIES,
  uiContractDigest,
} from './runtimeUiContractConfig.js';

/**
 * Builds a deterministic, safe FALLBACK runtime UI contract used when the input isolated runtime
 * is invalid/absent. Pure — fully headless: blocked readiness, all forbidden capabilities false.
 * Guarantees the composer never throws.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object} fallback runtime UI contract
 */
export function createRuntimeUiFallback(options = {}) {
  const reason = options && typeof options.reason === 'string' ? options.reason : 'invalid_or_missing_isolated_runtime';

  const core = {
    kind: 'studio-dev-preview-runtime-ui-contract',
    runtimeUiContractName: RUNTIME_UI_CONTRACT_NAME,
    runtimeUiContractVersion: RUNTIME_UI_CONTRACT_VERSION,
    mode: RUNTIME_UI_CONTRACT_MODE,
    moduleId: 'plannedModule',
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForRuntimeUiContract: false,
    readyForRuntimeUiImplementation: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['runtime_ui_contract_fallback_invalid_isolated_runtime'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...RUNTIME_UI_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, runtimeUiContractDigest: uiContractDigest(core) });
}

export default createRuntimeUiFallback;
