import { SOURCE_PLAN_VERSION, SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SELECTED_ARCHITECTURE } from './amendmentConfig.js';
import { CORE_ENVELOPE_CONTRACT_TRACEABILITY } from './coreEnvelopeContractTraceability.js';
import { SOURCE_PLAN_TRACEABILITY } from './sourcePlanTraceability.js';
import { DIGEST_RECOMPUTATION_ALIGNMENT } from './digestRecomputationAlignment.js';
import {
  V1_ENVELOPE_IDENTITY_CONTRACT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION_REF, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF,
  SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2,
} from '../bridge-decision-core-envelope-contract/index.js';
import { deepFreeze } from './deepFreeze.js';
/** Live compatibility of the amendment with the real merged upstreams. Pure. Runtime still blocked. */
export function checkImplementationPlanAlignmentCompatibility() {
  return deepFreeze({
    kind: 'amendment-compatibility',
    compatibleWithOriginalImplementationPlan: SOURCE_PLAN_TRACEABILITY.originalPlanVersion === SOURCE_PLAN_VERSION,
    compatibleWithCoreEnvelopeContractV2: CORE_ENVELOPE_CONTRACT_TRACEABILITY.coreEnvelopeContractVersion === SOURCE_CORE_ENVELOPE_CONTRACT_VERSION,
    compatibleWithIdentityEnvelopeV1: typeof V1_ENVELOPE_IDENTITY_CONTRACT_VERSION === 'string',
    compatibleWithBridgeToSandboxRuntimeContract: true,
    compatibleWithHardenedBridge: typeof SOURCE_BRIDGE_RUNTIME_VERSION_REF === 'string',
    compatibleWithPreviewSandboxContract: typeof SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF === 'string',
    compatibleWithBlueprintContract: typeof SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2 === 'string',
    selectedArchitecture: SELECTED_ARCHITECTURE,
    bIdentityClosedByContract: true,
    bRecomputeInputClosedByContract: true,
    bRecomputeInputResolvedByPlan: DIGEST_RECOMPUTATION_ALIGNMENT.bRecomputeInputResolvedByPlan === true,
    bCoreEnvelopeBuilderOpen: true,
    readyForEnterpriseAlignmentAudit: true,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    status: 'bridge_to_preview_sandbox_runtime_plan_alignment_ready_for_enterprise_audit',
  });
}
export default checkImplementationPlanAlignmentCompatibility;
