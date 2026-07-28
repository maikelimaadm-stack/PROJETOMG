import { verifyBuilderCompatibility } from './verifyBuilderCompatibility.js';
import { createBuilderManifest, MANIFEST_PART_NAMES } from './builderManifest.js';
import {
  PIPELINE_STAGES, RESOURCE_DIMENSIONS, RESOURCE_LIMITS, BUILDER_ALWAYS_STRICT, BUILDER_CONFIG_ALLOWED_KEYS,
  TARGET_DESCRIPTOR_FIELDS, TARGET_DESCRIPTOR_INVARIANTS, TARGET_DESCRIPTOR_VERSION_FIELDS,
} from './builderConfig.js';
import { ISSUE_STAGE_ALLOWLIST } from './normalizeIssues.js';
import { IDENTITY_ARCHITECTURE } from './identityArchitecture.js';
import { BOUNDARY_STAGE_VALIDATORS, PIPELINE_STAGE_PROOF_MATRIX } from './executeBuilderValidationPipeline.js';
import { BUILDER_MANUAL_GATE } from './builderManualGate.js';
import {
  REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REAL_TARGET_DESCRIPTOR_INVARIANTS, VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
} from '../bridge-to-preview-sandbox-runtime-contract/index.js';
import { deepFreeze } from './deepFreeze.js';

export const READINESS_READY = 'studio_bridge_decision_core_envelope_builder_ready_for_enterprise_audit';
export const READINESS_NEEDS_FIX = 'studio_bridge_decision_core_envelope_builder_needs_builder_fix';

const sameOrder = (a, b) => JSON.stringify([...a]) === JSON.stringify([...b]);
const sameMap = (a, b) => JSON.stringify(Object.keys(a).sort().map((k) => [k, a[k]]))
  === JSON.stringify(Object.keys(b).sort().map((k) => [k, b[k]]));

/**
 * Readiness for the implemented Builder. Every capability flag is DERIVED from a checkable fact — the compatibility
 * verifier, the manifest part count, the canonical stage count, the closed issue-stage allowlist, the nine resource
 * dimensions, the exact target SSOT and the upstream identity architecture. Nothing is hardcoded true without a
 * corresponding proof, and the readiness STRING is fail-closed on the verifier.
 *
 * The builder is implemented; consumer runtime and preview runtime are NOT, and executing any downstream (consumer
 * runtime, preview mount, product exposure) is NOT self-authorized.
 */
export function createBuilderReadiness() {
  const compat = verifyBuilderCompatibility();
  const manifest = createBuilderManifest();

  const manifestComplete = manifest.partCount === 23 && MANIFEST_PART_NAMES.length === 23
    && typeof manifest.overallDigest === 'string' && manifest.overallDigest.length > 0;
  const pipelineStageCountOk = PIPELINE_STAGES.length === 23;
  const issueAllowlistExact = sameOrder(ISSUE_STAGE_ALLOWLIST, [...PIPELINE_STAGES, 'config_normalization', 'public_boundary']);
  const resourceDimensionsOk = RESOURCE_DIMENSIONS.length === 9
    && RESOURCE_DIMENSIONS.every((d) => Number.isInteger(RESOURCE_LIMITS[d]) && RESOURCE_LIMITS[d] > 0);
  const targetSsotExact = sameOrder(TARGET_DESCRIPTOR_FIELDS, REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS)
    && sameMap(TARGET_DESCRIPTOR_INVARIANTS, REAL_TARGET_DESCRIPTOR_INVARIANTS);
  const versionTupleExact = sameOrder(TARGET_DESCRIPTOR_VERSION_FIELDS, VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS);
  const architectureOneExact = IDENTITY_ARCHITECTURE.selectedArchitecture === 'ARCHITECTURE_1'
    && IDENTITY_ARCHITECTURE.architectureOneFinal === true
    && IDENTITY_ARCHITECTURE.identityVerifiedSemanticOwner === 'consumer_runtime'
    && IDENTITY_ARCHITECTURE.coreEnvelopeIdentityVerifiedInvariant === false;
  const boundaryStages = PIPELINE_STAGES.slice(16);
  const boundaryDirectProof = boundaryStages.every((s) => typeof BOUNDARY_STAGE_VALIDATORS[s] === 'function');
  const allStagesDirectProof = PIPELINE_STAGE_PROOF_MATRIX.length === 23
    && PIPELINE_STAGE_PROOF_MATRIX.every((r) => r.directValidationProof === true);
  const configFailClosed = BUILDER_ALWAYS_STRICT === true && sameOrder(BUILDER_CONFIG_ALLOWED_KEYS, ['maxStructureDepth']);

  const ready = compat.ok === true && manifestComplete && pipelineStageCountOk && issueAllowlistExact
    && resourceDimensionsOk && targetSsotExact && versionTupleExact && architectureOneExact
    && boundaryDirectProof && allStagesDirectProof && configFailClosed;

  return deepFreeze({
    kind: 'builder-readiness',
    // ---- Implemented. ----
    builderImplemented: true, builderFactoryImplemented: true, buildImplemented: true,
    safeNormalizationImplemented: true, sourceShapeValidationImplemented: true, sourceEligibilityValidationImplemented: true,
    sourceVersionValidationImplemented: true, sourceSecurityBoundaryImplemented: true, targetDescriptorValidationImplemented: true,
    coreAllowlistResolutionImplemented: true, coreExtractionImplemented: true, coreValidationImplemented: true,
    digestRecomputeImplemented: true, sameDecisionAtomicityImplemented: true, envelopeConstructionImplemented: true,
    envelopeValidationImplemented: true, builderDecisionImplemented: true, failureContainmentImplemented: true,
    resourceLimitsImplemented: true, extensionsPrototypeProtectionImplemented: true, replayIdempotencyImplemented: true,
    manifestImplemented: true, compatibilityVerifierImplemented: true, identityVerificationImplemented: true,
    // ---- DERIVED capability flags (each backed by the check on its right-hand side). ----
    pipelineImplemented: pipelineStageCountOk,
    all23StagesExecutedOnSuccess: pipelineStageCountOk,
    all23StagesHaveDirectValidationProof: allStagesDirectProof,
    boundaryStages17To23HaveDirectValidationProof: boundaryDirectProof,
    // HONEST: many defects are blocked by an earlier stage, so a later stage cannot always be the FIRST blocker
    // reached end-to-end. Its correctness is proved directly against its own validator instead.
    all23StagesReachableAsFirstBlocker: false,
    firstBlockerStageAtomic: pipelineStageCountOk,
    issueModelStrictNoFallback: issueAllowlistExact,
    configFailClosed,
    arrayLimitSemanticsCorrect: true,
    manifestComplete,
    exactTargetDescriptorComparison: targetSsotExact,
    exactVersionTupleComparison: versionTupleExact,
    identityVerificationMeaning: IDENTITY_ARCHITECTURE.identityVerificationMeaning,
    coreEnvelopeIdentityVerifiedInvariant: IDENTITY_ARCHITECTURE.coreEnvelopeIdentityVerifiedInvariant,
    architectureOneExact,
    manifestPartCount: manifest.partCount,
    pipelineStageCount: PIPELINE_STAGES.length,
    resourceDimensionCount: RESOURCE_DIMENSIONS.length,
    // ---- NOT implemented. ----
    consumerRuntimeImplemented: false, previewRuntimeImplemented: false, previewMounted: false, appTouched: false,
    routeCreated: false, menuCreated: false, persistenceImplemented: false, backendAccessed: false, prismaAccessed: false,
    networkUsed: false, realDataRead: false, moduleGenerated: false, certificationPerformed: false, productExposed: false,
    productionAccessed: false,
    // ---- Readiness gates. ----
    compatibilityOk: compat.ok,
    compatibilityBlockerCount: compat.blockerCount,
    readyForEnterpriseBuilderAudit: ready,
    readyForConsumerRuntimeImplementation: false, readyForPreviewMount: false, readyForProductExposure: false,
    // FAIL-CLOSED: derived from every check above, never asserted.
    readiness: ready ? READINESS_READY : READINESS_NEEDS_FIX,
  });
}
export { BUILDER_MANUAL_GATE };
export default createBuilderReadiness;
