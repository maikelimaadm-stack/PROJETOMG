import { PREVIEW_SANDBOX_CONTRACT_VERSION, TARGET_SANDBOX_KIND, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * TARGET SANDBOX VERSION VALIDATION PLAN — plans exact target sandbox version validation. Unknown fails
 * closed; downgrade forbidden; upgrade not assumed compatible. Metadata only. @returns {Object}
 */
export function createTargetVersionValidationPlan() {
  const core = {
    kind: 'bridge-target-version-validation-plan',
    targetVersionValidationPlanned: true,
    targetVersionValidationImplemented: false,
    exactTargetSandboxVersionRequired: true,
    targetKind: TARGET_SANDBOX_KIND,
    targetContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    unknownVersionFailsClosed: true,
    versionDowngradeAllowed: false,
    versionUpgradeAssumedCompatible: false,
    bidirectionalCompatibilityCheckRequired: true,
  };
  return safeCloneGenericModel({ ...core, targetVersionValidationPlanDigest: bridgePlanDigest(core) });
}

export default createTargetVersionValidationPlan;
