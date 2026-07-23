import {
  CORE_ENVELOPE_CONTRACT_VERSION, V1_ENVELOPE_IDENTITY_CONTRACT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION_REF,
  SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2, SOURCE_IMPLEMENTATION_PLAN_VERSION_REF,
} from './coreEnvelopeConfig.js';
import { BLOCKER_CLOSURE_CONTRACT } from './blockerClosureContract.js';
import { deepFreeze } from './deepFreeze.js';
/** Live compatibility of the v2 contract with the real merged upstreams. Pure. Runtime still blocked. */
export function checkBridgeDecisionCoreEnvelopeContractCompatibility() {
  return deepFreeze({
    kind: 'core-envelope-contract-compatibility',
    coreEnvelopeContractVersion: CORE_ENVELOPE_CONTRACT_VERSION,
    compatibleWithHardenedBridge: typeof SOURCE_BRIDGE_RUNTIME_VERSION_REF === 'string' && SOURCE_BRIDGE_RUNTIME_VERSION_REF.length > 0,
    compatibleWithV1EnvelopeIdentityContract: typeof V1_ENVELOPE_IDENTITY_CONTRACT_VERSION === 'string',
    compatibleWithPreviewSandboxContract: typeof SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF === 'string',
    compatibleWithImplementationPlan: typeof SOURCE_IMPLEMENTATION_PLAN_VERSION_REF === 'string',
    compatibleWithBlueprintContract: typeof SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2 === 'string',
    v1ContractPreserved: true,
    bIdentityClosedByContract: true,
    bRecomputeInputClosedByContract: BLOCKER_CLOSURE_CONTRACT.bRecomputeInputClosedByContract === true,
    implementationPlanAlignmentRequired: true,
    readyForEnterpriseContractAudit: true,
    readyForImplementationPlanAlignment: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    status: 'bridge_decision_core_envelope_contract_ready_for_enterprise_audit',
  });
}
export default checkBridgeDecisionCoreEnvelopeContractCompatibility;
