import {
  CONTRACT_NAME, CONTRACT_VERSION, CONTRACT_MODE, CONTRACT_CAPABILITIES, CONSUMER_DECISION_STATUSES,
  SOURCE_CHECKPOINT, SOURCE_DECISION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
} from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { SOURCE_DESCRIPTOR_CONTRACT } from './sourceDescriptorContract.js';
import { SANDBOX_DESCRIPTOR_CONTRACT } from './sandboxDescriptorContract.js';
import { IDENTITY_CONTRACT } from './identityContract.js';
import { VERSION_CONTRACT } from './versionContract.js';
import { DIGEST_CONTRACT } from './digestContract.js';
import { READ_ONLY_POLICY_CONTRACT } from './readOnlyPolicyContract.js';
import { FIELD_MAPPING_CONTRACT } from './fieldMappingContract.js';
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
import { createContractReadinessDecision } from './readinessContract.js';
import { createContractManifest } from './manifestContract.js';
import { verifyBridgeToPreviewSandboxRuntimeContract } from './verifyBridgeToPreviewSandboxRuntimeContract.js';
import { checkBridgeToPreviewSandboxRuntimeContractCompatibility } from './checkBridgeToPreviewSandboxRuntimeContractCompatibility.js';
import { createContractDiagnostics } from './diagnosticsContract.js';

/**
 * Composes the STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME CONTRACT. Definition only — no consumer runtime is
 * built, nothing is consumed, no sandbox descriptor is created, nothing is mounted or exposed. Deterministic,
 * immutable (deep-frozen), fail-closed, side-effect-free. @param {Object} [options] @returns {Object}
 */
export function createStudioBridgeToPreviewSandboxRuntimeContract(options = {}) {
  const parts = {
    config: { name: CONTRACT_NAME, version: CONTRACT_VERSION, mode: CONTRACT_MODE },
    sourceDescriptor: SOURCE_DESCRIPTOR_CONTRACT,
    sandboxDescriptor: SANDBOX_DESCRIPTOR_CONTRACT,
    identityContract: IDENTITY_CONTRACT,
    versionContract: VERSION_CONTRACT,
    digestContract: DIGEST_CONTRACT,
    readOnlyPolicy: READ_ONLY_POLICY_CONTRACT,
    fieldMappings: FIELD_MAPPING_CONTRACT,
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

  const readinessDecision = createContractReadinessDecision({ blockers: [] });
  const manifest = createContractManifest({ parts });
  const compatibility = checkBridgeToPreviewSandboxRuntimeContractCompatibility();

  const base = {
    kind: 'studio-bridge-to-preview-sandbox-runtime-contract',
    contractName: CONTRACT_NAME,
    contractVersion: CONTRACT_VERSION,
    mode: CONTRACT_MODE,
    fallback: false,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceDecision: SOURCE_DECISION,
    currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    ...parts,
    consumerDecisionStatuses: [...CONSUMER_DECISION_STATUSES],
    // Future consumer decision shape (declared, NOT produced here).
    futureConsumerDecisionShape: deepFreeze({
      fields: ['ok', 'status', 'candidateAccepted', 'sandboxDescriptorCreated', 'sandboxDescriptor', 'issues',
        'sourceMutated', 'sideEffects', 'rollbackByNonConsumption', 'consumerDecisionDigest'],
      statuses: [...CONSUMER_DECISION_STATUSES],
      consumerImplemented: false, candidateConsumed: false, sandboxDescriptorCreated: false,
      previewPayloadCreated: false, previewMounted: false,
    }),
    capabilities: { ...CONTRACT_CAPABILITIES },
    compatibility,
    readinessDecision,
    readiness: readinessDecision.readiness,
    manifest,
    contractDefined: true,
    readyForEnterpriseContractAudit: true,
    readyForImplementationPlan: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    metadataOnly: true,
  };

  const verification = verifyBridgeToPreviewSandboxRuntimeContract({ contract: base });
  const diagnostics = createContractDiagnostics({ verification });

  return Object.freeze(deepFreeze({ ...base, verification, diagnostics }));
}

export default createStudioBridgeToPreviewSandboxRuntimeContract;
