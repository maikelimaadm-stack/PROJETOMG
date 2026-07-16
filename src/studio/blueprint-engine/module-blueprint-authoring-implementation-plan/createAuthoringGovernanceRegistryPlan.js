import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Governance registry PLAN — plans the specific (non-wildcard) registry entries a future runtime slice
 * would add. This slice does not weaken the governance guard nor add a broad wildcard. Metadata only.
 * @returns {Object}
 */
export function createAuthoringGovernanceRegistryPlan() {
  const core = {
    kind: 'authoring-governance-registry-plan',
    governanceRegistryPlanned: true,
    registryTouched: false,
    guardTouched: false,
    broadWildcardAllowed: false,
    specificPathsOnly: true,
    plannedFutureRegistryPaths: [
      'src/studio/blueprint-engine/module-blueprint-authoring-runtime/',
      'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js',
      'scripts/gates/g423-studio-module-blueprint-authoring-runtime.mjs',
      'docs/evidence/post-foundation-c-studio-module-blueprint-authoring-runtime/',
    ],
  };
  return safeCloneGenericModel({ ...core, governanceRegistryPlanDigest: authoringPlanDigest(core) });
}

export default createAuthoringGovernanceRegistryPlan;
