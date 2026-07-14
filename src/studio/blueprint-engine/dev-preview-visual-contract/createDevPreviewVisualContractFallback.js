import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  VISUAL_CONTRACT_NAME,
  VISUAL_CONTRACT_VERSION,
  VISUAL_CONTRACT_MODE,
  VISUAL_CONTRACT_HEADLESS_CAPABILITIES,
  visualDigest,
} from './devPreviewVisualContractConfig.js';

/**
 * Builds a deterministic, safe FALLBACK visual contract used when the input bridge is
 * invalid/absent. Pure, metadata-only. It is fully headless: empty contracts, blocked
 * readiness, all side-effect capabilities false. Guarantees the composer never throws.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object} fallback visual contract
 */
export function createDevPreviewVisualContractFallback(options = {}) {
  const reason = options && typeof options.reason === 'string' ? options.reason : 'invalid_or_missing_bridge';

  const core = {
    kind: 'studio-dev-preview-visual-contract',
    visualContractName: VISUAL_CONTRACT_NAME,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    mode: VISUAL_CONTRACT_MODE,
    moduleId: 'plannedModule',
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForDevPreviewVisualContract: false,
    readyForDevPreviewVisualRuntime: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['dev_preview_visual_contract_fallback_invalid_bridge'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...VISUAL_CONTRACT_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, visualContractDigest: visualDigest(core) });
}

export default createDevPreviewVisualContractFallback;
