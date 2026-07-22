import {
  ENVELOPE_CONTRACT_NAME, ENVELOPE_CONTRACT_VERSION, ENVELOPE_CONTRACT_MODE, ENVELOPE_CAPABILITIES,
  ENVELOPE_DECISION_STATUSES, SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION,
  CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
} from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { SOURCE_DECISION_CONTRACT } from './sourceDecisionContract.js';
import { ENVELOPE_SHAPE_CONTRACT } from './envelopeShapeContract.js';
import { IDENTITY_BINDING_CONTRACT } from './identityBindingContract.js';
import { DIGEST_COVERAGE_CONTRACT } from './digestCoverageContract.js';
import { PROVENANCE_CONTRACT } from './provenanceContract.js';
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
import { MANUAL_CHECKPOINT_CONTRACT } from './manualCheckpointContract.js';
import { createEnvelopeReadinessDecision } from './readinessContract.js';
import { createEnvelopeManifest } from './manifestContract.js';
import { verifyBridgeDecisionEnvelopeIdentityContract } from './verifyBridgeDecisionEnvelopeIdentityContract.js';
import { checkBridgeDecisionEnvelopeIdentityContractCompatibility } from './checkBridgeDecisionEnvelopeIdentityContractCompatibility.js';
import { createEnvelopeDiagnostics } from './diagnosticsContract.js';

/**
 * Composes the STUDIO BRIDGE DECISION ENVELOPE IDENTITY CONTRACT. Definition only — no envelope is built, no
 * decision is consumed, no identity is verified at runtime, nothing is mounted or exposed. Deterministic,
 * immutable (deep-frozen), fail-closed, side-effect-free. Closes B-IDENTITY at contract level: the real
 * bridgeDecisionDigest provably covers the target descriptor, so the {digest, descriptor} envelope binds
 * provenance via recompute-and-compare. @param {Object} [options] @returns {Object}
 */
export function createStudioBridgeDecisionEnvelopeIdentityContract(options = {}) {
  const parts = {
    config: { name: ENVELOPE_CONTRACT_NAME, version: ENVELOPE_CONTRACT_VERSION, mode: ENVELOPE_CONTRACT_MODE },
    sourceDecision: SOURCE_DECISION_CONTRACT,
    envelopeShape: ENVELOPE_SHAPE_CONTRACT,
    identityBinding: IDENTITY_BINDING_CONTRACT,
    digestCoverage: DIGEST_COVERAGE_CONTRACT,
    provenance: PROVENANCE_CONTRACT,
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
    manualCheckpoint: MANUAL_CHECKPOINT_CONTRACT,
  };

  const bIdentityClosedByContract = DIGEST_COVERAGE_CONTRACT.targetDescriptorCoveredByDigest === true
    && DIGEST_COVERAGE_CONTRACT.bIdentityRemainsOpen === false;
  const readinessDecision = createEnvelopeReadinessDecision({ blockers: [], bIdentityClosedByContract });
  const manifest = createEnvelopeManifest({ parts });
  const compatibility = checkBridgeDecisionEnvelopeIdentityContractCompatibility();

  const base = {
    kind: 'studio-bridge-decision-envelope-identity-contract',
    contractName: ENVELOPE_CONTRACT_NAME,
    contractVersion: ENVELOPE_CONTRACT_VERSION,
    mode: ENVELOPE_CONTRACT_MODE,
    fallback: false,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceCheckpointDecision: SOURCE_DECISION,
    sourceRecommendation: SOURCE_RECOMMENDATION,
    currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    ...parts,
    envelopeDecisionStatuses: [...ENVELOPE_DECISION_STATUSES],
    // Future envelope-identity decision shape (declared, NOT produced here).
    futureEnvelopeDecisionShape: deepFreeze({
      fields: ['ok', 'status', 'identityVerified', 'envelopeCreated', 'envelope', 'issues', 'sourceMutated',
        'sideEffects', 'rollbackByNonConsumption', 'envelopeDecisionDigest'],
      statuses: [...ENVELOPE_DECISION_STATUSES],
      identityVerificationImplemented: false, envelopeBuilderImplemented: false, envelopeCreated: false,
    }),
    capabilities: { ...ENVELOPE_CAPABILITIES },
    compatibility,
    readinessDecision,
    readiness: readinessDecision.readiness,
    manifest,
    contractDefined: true,
    bIdentityClosedByContract,
    readyForEnterpriseContractAudit: true,
    readyForImplementationPlan: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    metadataOnly: true,
  };

  const verification = verifyBridgeDecisionEnvelopeIdentityContract({ contract: base });
  const diagnostics = createEnvelopeDiagnostics({ verification });

  return Object.freeze(deepFreeze({ ...base, verification, diagnostics }));
}

export default createStudioBridgeDecisionEnvelopeIdentityContract;
