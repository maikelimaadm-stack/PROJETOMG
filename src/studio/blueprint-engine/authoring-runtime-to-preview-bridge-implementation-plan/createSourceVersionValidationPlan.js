import {
  AUTHORING_RUNTIME_VERSION, SOURCE_HANDOFF_KIND, BRIDGE_CONTRACT_VERSION, BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION, SOURCE_HANDOFF_VERSION_FIELDS, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** The real handoff version field for the authoring-preview-handoff itself. */
const HANDOFF_VERSION = 'authoring-preview-handoff@1.0.0';

/**
 * SOURCE VERSION VALIDATION PLAN — plans exact source version validation over an EXPLICIT version tuple
 * aligned to the real handoff (`handoffVersion`/`runtimeVersion`/`targetSandboxVersion`) plus bridge/plan/
 * blueprint versions. NO aggregated `upstreamVersions` field. Unknown fails closed; downgrade forbidden;
 * upgrade not assumed; bidirectional. Metadata only. @returns {Object}
 */
export function createSourceVersionValidationPlan() {
  const core = {
    kind: 'bridge-source-version-validation-plan',
    sourceVersionValidationPlanned: true,
    sourceVersionValidationImplemented: false,
    explicitVersionTupleRequired: true,
    aggregatedUpstreamVersionsFieldRequired: false,
    exactVersionMatchRequired: true,
    exactSourceRuntimeVersionRequired: true,
    unknownVersionFailsClosed: true,
    versionDowngradeAllowed: false,
    versionUpgradeAssumedCompatible: false,
    bidirectionalCompatibilityCheckRequired: true,
    versionTupleFields: [...SOURCE_HANDOFF_VERSION_FIELDS, 'bridgeContractVersion', 'bridgeImplementationPlanVersion', 'blueprintContractVersion'],
    tuple: {
      handoffVersion: HANDOFF_VERSION,
      runtimeVersion: AUTHORING_RUNTIME_VERSION,
      targetSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
      bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
      bridgeImplementationPlanVersion: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
      blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    },
    matrix: {
      sourceRuntime: AUTHORING_RUNTIME_VERSION,
      sourceHandoff: SOURCE_HANDOFF_KIND,
      handoffVersion: HANDOFF_VERSION,
      bridgeContract: BRIDGE_CONTRACT_VERSION,
      bridgePlan: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
      targetSandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
    },
  };
  return safeCloneGenericModel({ ...core, sourceVersionValidationPlanDigest: bridgePlanDigest(core) });
}

export default createSourceVersionValidationPlan;
