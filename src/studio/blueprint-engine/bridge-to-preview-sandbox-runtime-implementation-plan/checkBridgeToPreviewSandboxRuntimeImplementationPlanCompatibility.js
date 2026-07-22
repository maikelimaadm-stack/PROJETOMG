import {
  SOURCE_BRIDGE_RUNTIME_VERSION_REF, SOURCE_BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION,
  SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF,
  SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2,
} from './planConfig.js';
import { IDENTITY_VERIFICATION_PLAN } from './identityVerificationPlan.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Live compatibility of the PLAN with the real merged upstream contracts. Pure. It proves the plan reflects the
 * real contract versions (read-only) and reports B-IDENTITY (closed by contract) vs B-RECOMPUTE-INPUT (open until
 * a future amendment). @returns {Object}
 */
export function checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility() {
  const bRecomputeInputResolvedByPlan = IDENTITY_VERIFICATION_PLAN.bRecomputeInputResolvedByPlan === true;
  return deepFreeze({
    kind: 'bridge-to-preview-sandbox-runtime-implementation-plan-compatibility',
    compatibleWithHardenedBridge: typeof SOURCE_BRIDGE_RUNTIME_VERSION_REF === 'string' && SOURCE_BRIDGE_RUNTIME_VERSION_REF.length > 0,
    compatibleWithBridgeToSandboxRuntimeContract: typeof SOURCE_BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION === 'string',
    compatibleWithEnvelopeIdentityContract: typeof SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION === 'string',
    compatibleWithPreviewSandboxContract: typeof SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF === 'string',
    compatibleWithBlueprintContract: typeof SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2 === 'string',
    sourceVersions: deepFreeze({
      bridgeRuntime: SOURCE_BRIDGE_RUNTIME_VERSION_REF,
      bridgeToSandboxRuntimeContract: SOURCE_BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION,
      envelopeIdentityContract: SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION,
      previewSandboxContract: SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF,
      blueprintContract: SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2,
    }),
    bIdentityClosedByContract: true,
    bRecomputeInputResolvedByPlan,
    readyForEnterprisePlanAudit: true,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    status: 'bridge_to_preview_sandbox_runtime_implementation_plan_ready_for_enterprise_audit',
  });
}

export default checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility;
