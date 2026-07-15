import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Governance registry PLAN — metadata describing how a future slice would register only its own
 * specific paths as known-later in the central scope governance registry, never a broad wildcard.
 * It registers NOTHING and touches the guard NOT AT ALL. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationGovernanceRegistryPlan() {
  const plannedKnownLaterPaths = [
    'src/studio/blueprint-engine/dev-preview-app-integration-implementation-slice/',
    'src/runtime/__tests__/studio-dev-preview-app-integration-implementation-slice.test.js',
    'scripts/gates/g423-studio-dev-preview-app-integration-implementation-slice.mjs',
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration-implementation-slice/',
  ];
  const core = {
    kind: 'app-integration-governance-registry-plan',
    registryTouched: false,
    guardTouched: false,
    broadWildcardAllowed: false,
    specificPathsOnly: true,
    plannedKnownLaterPaths,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, governanceRegistryPlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationGovernanceRegistryPlan;
