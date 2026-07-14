import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  visualDigest,
} from './devPreviewVisualContractConfig.js';

/**
 * Checks upstream contract compatibility for the dev preview visual contract. Pure,
 * metadata-only. Compares the bridge/sandbox/engine versions this contract was built against
 * with what the consumed bridge reports. Mismatches become warnings (not hard blockers) so the
 * contract degrades gracefully. It NEVER authorizes the visual runtime, real module generation,
 * or production.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} compatibility report
 */
export function checkDevPreviewVisualContractCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.bridge) ? o.bridge : {};

  const checks = [
    { name: 'bridgeContract', expected: DEV_PREVIEW_BRIDGE_VERSION, actual: typeof b.bridgeVersion === 'string' ? b.bridgeVersion : DEV_PREVIEW_BRIDGE_VERSION },
    { name: 'sandboxContract', expected: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION, actual: typeof b.session?.sourceSandboxContract === 'string' ? b.session.sourceSandboxContract : MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION },
    { name: 'engineContract', expected: STUDIO_BLUEPRINT_ENGINE_VERSION, actual: typeof b.session?.sourceEngineContract === 'string' ? b.session.sourceEngineContract : STUDIO_BLUEPRINT_ENGINE_VERSION },
  ].map((c) => ({ ...c, compatible: c.expected === c.actual }));

  const warnings = checks.filter((c) => !c.compatible).map((c) => `incompatible_${c.name}`);
  const compatible = warnings.length === 0;

  const core = {
    kind: 'dev-preview-visual-contract-compatibility',
    compatibleWithDevPreviewBridge: compatible,
    checks,
    warnings,
    warningCount: warnings.length,
    readyForDevPreviewVisualRuntime: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    status: 'ready_for_future_dev_preview_visual_runtime_contract',
    blocked: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: visualDigest(core) });
}

export default checkDevPreviewVisualContractCompatibility;
