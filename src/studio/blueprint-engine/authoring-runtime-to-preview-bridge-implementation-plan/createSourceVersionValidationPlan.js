import {
  AUTHORING_RUNTIME_VERSION, SOURCE_HANDOFF_KIND, BRIDGE_CONTRACT_VERSION, BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * SOURCE VERSION VALIDATION PLAN — plans exact source runtime version validation. Unknown fails closed;
 * downgrade forbidden; upgrade not assumed compatible; bidirectional check required. The planned matrix
 * pins source runtime, source handoff, bridge contract, bridge plan, target sandbox and blueprint contract.
 * Metadata only. @returns {Object}
 */
export function createSourceVersionValidationPlan() {
  const core = {
    kind: 'bridge-source-version-validation-plan',
    sourceVersionValidationPlanned: true,
    sourceVersionValidationImplemented: false,
    exactSourceRuntimeVersionRequired: true,
    unknownVersionFailsClosed: true,
    versionDowngradeAllowed: false,
    versionUpgradeAssumedCompatible: false,
    bidirectionalCompatibilityCheckRequired: true,
    matrix: {
      sourceRuntime: AUTHORING_RUNTIME_VERSION,
      sourceHandoff: SOURCE_HANDOFF_KIND,
      bridgeContract: BRIDGE_CONTRACT_VERSION,
      bridgePlan: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
      targetSandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
    },
  };
  return safeCloneGenericModel({ ...core, sourceVersionValidationPlanDigest: bridgePlanDigest(core) });
}

export default createSourceVersionValidationPlan;
