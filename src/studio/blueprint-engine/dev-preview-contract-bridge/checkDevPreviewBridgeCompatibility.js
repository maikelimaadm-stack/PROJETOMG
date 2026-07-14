import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  bridgeDigest,
} from './devPreviewBridgeConfig.js';

/**
 * Checks upstream contract compatibility for the dev preview bridge. Pure, metadata-only.
 * Compares the sandbox/planner/engine versions the bridge was built against with what the
 * consumed sandbox reports. Mismatches become warnings (not hard blockers) so the bridge
 * degrades gracefully.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} compatibility report
 */
export function checkDevPreviewBridgeCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.sandbox) ? o.sandbox : {};

  const checks = [
    { name: 'sandboxContract', expected: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION, actual: typeof s.sandboxVersion === 'string' ? s.sandboxVersion : MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION },
    { name: 'plannerContract', expected: MODULE_REFERENCE_PLANNER_VERSION, actual: typeof s.plannerVersion === 'string' ? s.plannerVersion : MODULE_REFERENCE_PLANNER_VERSION },
    { name: 'engineContract', expected: STUDIO_BLUEPRINT_ENGINE_VERSION, actual: typeof s.engineVersion === 'string' ? s.engineVersion : STUDIO_BLUEPRINT_ENGINE_VERSION },
  ].map((c) => ({ ...c, compatible: c.expected === c.actual }));

  const warnings = checks.filter((c) => !c.compatible).map((c) => `incompatible_${c.name}`);
  const compatible = warnings.length === 0;

  const core = {
    kind: 'dev-preview-bridge-compatibility',
    compatible,
    checks,
    warnings,
    warningCount: warnings.length,
    blocked: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: bridgeDigest(core) });
}

export default checkDevPreviewBridgeCompatibility;
