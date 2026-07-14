import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  shellDigest,
} from './devPreviewRuntimeShellContractConfig.js';

/**
 * Checks upstream contract compatibility for the dev preview runtime shell contract. Pure,
 * metadata-only. Compares the visual/bridge/engine versions this contract was built against
 * with what the consumed visual contract reports. Mismatches become warnings (not hard
 * blockers) so the contract degrades gracefully. It NEVER authorizes the runtime
 * implementation, real module generation, or production.
 *
 * @param {Object} [options]
 * @param {Object} [options.visualContract] a dev preview visual contract
 * @returns {Object} compatibility report
 */
export function checkDevPreviewRuntimeShellCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const vc = isGenericModelPlainObject(o.visualContract) ? o.visualContract : {};

  const checks = [
    { name: 'visualContract', expected: VISUAL_CONTRACT_VERSION, actual: typeof vc.visualContractVersion === 'string' ? vc.visualContractVersion : VISUAL_CONTRACT_VERSION },
    { name: 'bridgeContract', expected: DEV_PREVIEW_BRIDGE_VERSION, actual: typeof vc.bridgeVersion === 'string' ? vc.bridgeVersion : DEV_PREVIEW_BRIDGE_VERSION },
    { name: 'engineContract', expected: STUDIO_BLUEPRINT_ENGINE_VERSION, actual: typeof vc.engineVersion === 'string' ? vc.engineVersion : STUDIO_BLUEPRINT_ENGINE_VERSION },
  ].map((c) => ({ ...c, compatible: c.expected === c.actual }));

  const warnings = checks.filter((c) => !c.compatible).map((c) => `incompatible_${c.name}`);
  const compatible = warnings.length === 0;

  const core = {
    kind: 'dev-preview-runtime-shell-compatibility',
    compatibleWithDevPreviewVisualContract: compatible,
    checks,
    warnings,
    warningCount: warnings.length,
    readyForDevPreviewRuntimeImplementation: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    status: 'ready_for_future_dev_preview_runtime_implementation_contract',
    blocked: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: shellDigest(core) });
}

export default checkDevPreviewRuntimeShellCompatibility;
