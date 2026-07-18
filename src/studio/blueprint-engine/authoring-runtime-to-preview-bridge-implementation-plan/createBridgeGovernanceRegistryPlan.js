import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * GOVERNANCE REGISTRY PLAN — plans the exact, anchored scope-governance entries a future bridge
 * implementation slice would register (subtree/test/gate/docs), with no broad wildcard and no forbidden
 * path. Metadata only. @returns {Object}
 */
export function createBridgeGovernanceRegistryPlan() {
  const plannedPaths = [
    'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation/',
    'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-implementation.test.js',
    'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-implementation.mjs',
    'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation/',
  ];
  const core = {
    kind: 'bridge-governance-registry-plan',
    governanceRegistryPlanOnly: true,
    plannedAnchoredPaths: plannedPaths,
    plannedPathCount: plannedPaths.length,
    anchoredRegexesOnly: true,
    broadWildcardAllowed: false,
    forbiddenPathsRegistered: false,
    guardsAltered: false,
  };
  return safeCloneGenericModel({ ...core, governanceRegistryPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeGovernanceRegistryPlan;
