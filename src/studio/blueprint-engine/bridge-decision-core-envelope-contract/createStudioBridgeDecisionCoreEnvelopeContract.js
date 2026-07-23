import {
  CORE_ENVELOPE_CONTRACT_NAME, CORE_ENVELOPE_CONTRACT_VERSION, CORE_ENVELOPE_CONTRACT_MODE, CORE_ENVELOPE_CAPABILITIES,
  CORE_ENVELOPE_DECISION_STATUSES, SOURCE_CHECKPOINT, SOURCE_DECISION, SELECTED_ARCHITECTURE, SOURCE_RECOMMENDATION,
  CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
} from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { REAL_PREIMAGE_CONTRACT } from './realPreimageContract.js';
import { BRIDGE_DECISION_CORE_CONTRACT } from './bridgeDecisionCoreContract.js';
import { CORE_ENVELOPE_V2_CONTRACT } from './coreEnvelopeV2Contract.js';
import { DIGEST_SEMANTICS_CONTRACT } from './digestSemanticsContract.js';
import { SAME_DECISION_ATOMICITY_CONTRACT } from './sameDecisionAtomicityContract.js';
import { V1_V2_COMPATIBILITY_CONTRACT } from './v1V2CompatibilityContract.js';
import { VERSION_CONTRACT } from './versionContract.js';
import { READ_ONLY_CONTRACT } from './readOnlyContract.js';
import { VALIDATION_PIPELINE_CONTRACT } from './validationPipelineContract.js';
import { ISSUE_MODEL_CONTRACT } from './issueModelContract.js';
import { FAILURE_CONTAINMENT_CONTRACT } from './failureContainmentContract.js';
import { RESOURCE_LIMIT_CONTRACT } from './resourceLimitContract.js';
import { EXTENSIBILITY_CONTRACT } from './extensibilityContract.js';
import { REPLAY_CONTRACT } from './replayContract.js';
import { SSOT_BOUNDARY_CONTRACT } from './ssotBoundaryContract.js';
import { PERMISSION_TENANCY_BOUNDARY_CONTRACT } from './permissionTenancyBoundaryContract.js';
import { SECURITY_CONTRACT } from './securityContract.js';
import { PROTOTYPE_PROHIBITION_CONTRACT } from './prototypeProhibitionContract.js';
import { BLOCKER_CLOSURE_CONTRACT } from './blockerClosureContract.js';
import { MANUAL_CHECKPOINT_CONTRACT } from './manualCheckpointContract.js';
import { createCoreEnvelopeReadinessDecision } from './readinessContract.js';
import { createCoreEnvelopeManifest } from './manifestContract.js';
import { checkBridgeDecisionCoreEnvelopeContractCompatibility } from './checkBridgeDecisionCoreEnvelopeContractCompatibility.js';
import { verifyBridgeDecisionCoreEnvelopeContract } from './verifyBridgeDecisionCoreEnvelopeContract.js';
import { createCoreEnvelopeDiagnostics } from './diagnosticsContract.js';

/**
 * Composes the STUDIO BRIDGE DECISION CORE ENVELOPE CONTRACT (v2). Definition only — no envelope built, no
 * decision consumed, no identity verified at runtime, no digest recomputed, nothing mounted or exposed.
 * Deterministic, immutable (deep-frozen), fail-closed, side-effect-free. Closes B-RECOMPUTE-INPUT at contract
 * level (core == real preimage; the live digest-recompute equivalence is proven by the test + gate), while
 * keeping v1 intact and runtime blocked pending Implementation Plan alignment. @param {Object} [options] @returns {Object}
 */
export function createStudioBridgeDecisionCoreEnvelopeContract(options = {}) {
  const parts = {
    config: { name: CORE_ENVELOPE_CONTRACT_NAME, version: CORE_ENVELOPE_CONTRACT_VERSION, mode: CORE_ENVELOPE_CONTRACT_MODE },
    realPreimage: REAL_PREIMAGE_CONTRACT,
    bridgeDecisionCore: BRIDGE_DECISION_CORE_CONTRACT,
    coreEnvelope: CORE_ENVELOPE_V2_CONTRACT,
    digestSemantics: DIGEST_SEMANTICS_CONTRACT,
    sameDecisionAtomicity: SAME_DECISION_ATOMICITY_CONTRACT,
    v1V2Compatibility: V1_V2_COMPATIBILITY_CONTRACT,
    versionContract: VERSION_CONTRACT,
    readOnly: READ_ONLY_CONTRACT,
    validationPipeline: VALIDATION_PIPELINE_CONTRACT,
    issueModel: ISSUE_MODEL_CONTRACT,
    failureContainment: FAILURE_CONTAINMENT_CONTRACT,
    resourceLimits: RESOURCE_LIMIT_CONTRACT,
    extensibility: EXTENSIBILITY_CONTRACT,
    replayContract: REPLAY_CONTRACT,
    ssotBoundary: SSOT_BOUNDARY_CONTRACT,
    permissionTenancyBoundary: PERMISSION_TENANCY_BOUNDARY_CONTRACT,
    securityContract: SECURITY_CONTRACT,
    prototypeProhibition: PROTOTYPE_PROHIBITION_CONTRACT,
    blockerClosure: BLOCKER_CLOSURE_CONTRACT,
    manualCheckpoint: MANUAL_CHECKPOINT_CONTRACT,
  };

  const bIdentityClosedByContract = true;
  const bRecomputeInputClosedByContract = BLOCKER_CLOSURE_CONTRACT.bRecomputeInputClosedByContract === true;
  const readinessDecision = createCoreEnvelopeReadinessDecision({
    blockers: [], contractFullyDefined: true, bIdentityClosedByContract, bRecomputeInputClosedByContract,
  });
  const manifest = createCoreEnvelopeManifest({ parts });
  const compatibility = checkBridgeDecisionCoreEnvelopeContractCompatibility();

  const base = {
    kind: 'studio-bridge-decision-core-envelope-contract',
    contractName: CORE_ENVELOPE_CONTRACT_NAME,
    contractVersion: CORE_ENVELOPE_CONTRACT_VERSION,
    mode: CORE_ENVELOPE_CONTRACT_MODE,
    fallback: false,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceCheckpointDecision: SOURCE_DECISION,
    selectedArchitecture: SELECTED_ARCHITECTURE,
    sourceRecommendation: SOURCE_RECOMMENDATION,
    currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    ...parts,
    coreEnvelopeDecisionStatuses: [...CORE_ENVELOPE_DECISION_STATUSES],
    capabilities: { ...CORE_ENVELOPE_CAPABILITIES },
    compatibility,
    readinessDecision,
    readiness: readinessDecision.readiness,
    manifest,
    contractDefined: true,
    bIdentityClosedByContract,
    bRecomputeInputClosedByContract,
    implementationPlanAlignmentRequired: true,
    readyForEnterpriseContractAudit: true,
    readyForImplementationPlanAlignment: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    metadataOnly: true,
  };

  const verification = verifyBridgeDecisionCoreEnvelopeContract({ contract: base });
  const diagnostics = createCoreEnvelopeDiagnostics({ verification });

  return Object.freeze(deepFreeze({ ...base, verification, diagnostics }));
}

export default createStudioBridgeDecisionCoreEnvelopeContract;
