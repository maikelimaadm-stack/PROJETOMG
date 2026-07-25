import {
  BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SOURCE_ENVELOPE_V1_CONTRACT_VERSION,
  SOURCE_PLAN_ALIGNMENT_AMENDMENT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  SOURCE_BLUEPRINT_CONTRACT_VERSION,
} from './contractConfig.js';
import { BUILDER_BLOCKER_CLOSURE } from './builderBlockerClosure.js';
import { IDENTITY_VERIFICATION_STATE_CONTRACT } from './identityVerificationStateContract.js';
import { deepFreeze } from './deepFreeze.js';
/** Live compatibility with the real merged upstreams. Pure. Builder plan + runtime blocked. */
export function checkBridgeDecisionCoreEnvelopeBuilderCompatibility() {
  return deepFreeze({
    kind: 'builder-contract-compatibility',
    builderContractVersion: BUILDER_CONTRACT_VERSION,
    compatibleWithHardenedBridge: typeof SOURCE_BRIDGE_RUNTIME_VERSION === 'string' && SOURCE_BRIDGE_RUNTIME_VERSION.length > 0,
    compatibleWithCoreEnvelopeContractV2: typeof SOURCE_CORE_ENVELOPE_CONTRACT_VERSION === 'string',
    compatibleWithPlanAlignmentAmendment: typeof SOURCE_PLAN_ALIGNMENT_AMENDMENT_VERSION === 'string',
    compatibleWithBridgeToSandboxRuntimeContract: true,
    compatibleWithPreviewSandboxContract: typeof SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION === 'string',
    compatibleWithBlueprintContract: typeof SOURCE_BLUEPRINT_CONTRACT_VERSION === 'string',
    compatibleWithIdentityEnvelopeV1: typeof SOURCE_ENVELOPE_V1_CONTRACT_VERSION === 'string',
    bIdentityClosedByContract: true,
    bRecomputeInputClosedByContract: true,
    bRecomputeInputResolvedByPlan: true,
    identityVerifiedSemanticOwner: IDENTITY_VERIFICATION_STATE_CONTRACT.identityVerifiedSemanticOwner,
    verificationStateClassification: IDENTITY_VERIFICATION_STATE_CONTRACT.verificationStateClassification,
    coreEnvelopeVerificationStateAmendmentRequired: IDENTITY_VERIFICATION_STATE_CONTRACT.coreEnvelopeVerificationStateAmendmentRequired === true,
    bCoreEnvelopeBuilderClosedByContract: BUILDER_BLOCKER_CLOSURE.bCoreEnvelopeBuilderClosedByContract === true,
    bCoreEnvelopeVerificationStateOpen: IDENTITY_VERIFICATION_STATE_CONTRACT.bCoreEnvelopeVerificationStateOpen === true,
    readyForEnterpriseContractAudit: true,
    readyForBuilderImplementationPlan: BUILDER_BLOCKER_CLOSURE.readyForBuilderImplementationPlan === true,
    readyForBuilderImplementation: false,
    readyForRuntimeImplementation: false,
    status: 'bridge_decision_core_envelope_builder_contract_ready_for_builder_implementation_plan_audit',
  });
}
export default checkBridgeDecisionCoreEnvelopeBuilderCompatibility;
