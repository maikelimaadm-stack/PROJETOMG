import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_SHELL_CONTRACT_NAME,
  RUNTIME_SHELL_CONTRACT_VERSION,
  RUNTIME_SHELL_CONTRACT_MODE,
  RUNTIME_SHELL_HEADLESS_CAPABILITIES,
  shellDigest,
} from './devPreviewRuntimeShellContractConfig.js';

/**
 * Builds a deterministic, safe FALLBACK runtime shell contract used when the input visual
 * contract is invalid/absent. Pure, metadata-only. It is fully headless: empty contracts,
 * blocked readiness, all side-effect capabilities false. Guarantees the composer never throws.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object} fallback runtime shell contract
 */
export function createDevPreviewRuntimeShellFallback(options = {}) {
  const reason = options && typeof options.reason === 'string' ? options.reason : 'invalid_or_missing_visual_contract';

  const core = {
    kind: 'studio-dev-preview-runtime-shell-contract',
    runtimeShellContractName: RUNTIME_SHELL_CONTRACT_NAME,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    mode: RUNTIME_SHELL_CONTRACT_MODE,
    moduleId: 'plannedModule',
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForDevPreviewRuntimeShellContract: false,
    readyForDevPreviewRuntimeImplementation: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['dev_preview_runtime_shell_contract_fallback_invalid_visual_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...RUNTIME_SHELL_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, runtimeShellContractDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellFallback;
