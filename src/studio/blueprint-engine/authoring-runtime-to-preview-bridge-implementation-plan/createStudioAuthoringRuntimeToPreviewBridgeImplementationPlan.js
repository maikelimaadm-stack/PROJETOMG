import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  BRIDGE_IMPLEMENTATION_PLAN_NAME, BRIDGE_IMPLEMENTATION_PLAN_VERSION, BRIDGE_IMPLEMENTATION_PLAN_MODE,
  BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES, BRIDGE_CONTRACT_VERSION, AUTHORING_RUNTIME_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION, REQUIRED_FUTURE_CHECKPOINT, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';
import { createBridgeImplementationPlanSession } from './createBridgeImplementationPlanSession.js';
import { createBridgeImplementationPhases } from './createBridgeImplementationPhases.js';
import { createSourceValidationPlan } from './createSourceValidationPlan.js';
import { createDraftIdentityEnforcementPlan } from './createDraftIdentityEnforcementPlan.js';
import { createSourceVersionValidationPlan } from './createSourceVersionValidationPlan.js';
import { createSourceDigestValidationPlan } from './createSourceDigestValidationPlan.js';
import { createSourceBoundaryValidationPlan } from './createSourceBoundaryValidationPlan.js';
import { createFieldMappingExecutionPlan } from './createFieldMappingExecutionPlan.js';
import { createTargetDescriptorConstructionPlan } from './createTargetDescriptorConstructionPlan.js';
import { createTargetVersionValidationPlan } from './createTargetVersionValidationPlan.js';
import { createCanonicalizationValidationPlan } from './createCanonicalizationValidationPlan.js';
import { createExtensibilityEnforcementPlan } from './createExtensibilityEnforcementPlan.js';
import { createBridgeValidationPipelinePlan } from './createBridgeValidationPipelinePlan.js';
import { createReplayIdempotencyPlan } from './createReplayIdempotencyPlan.js';
import { createBridgeResourceLimitsPlan } from './createBridgeResourceLimitsPlan.js';
import { createFailureContainmentPlan } from './createFailureContainmentPlan.js';
import { createBridgeSsotProtectionPlan } from './createBridgeSsotProtectionPlan.js';
import { createBridgeCertificationBoundaryPlan } from './createBridgeCertificationBoundaryPlan.js';
import { createBridgePermissionTenancyBoundaryPlan } from './createBridgePermissionTenancyBoundaryPlan.js';
import { createBridgeSecuritySafetyPlan } from './createBridgeSecuritySafetyPlan.js';
import { createBridgePrototypeRelinkAssertionPlan } from './createBridgePrototypeRelinkAssertionPlan.js';
import { createBridgeTestHarnessPlan } from './createBridgeTestHarnessPlan.js';
import { createBridgeManualEnablementGatePlan } from './createBridgeManualEnablementGatePlan.js';
import { createBridgeRolloutRollbackPlan } from './createBridgeRolloutRollbackPlan.js';
import { createBridgeObservabilityDiagnosticsPlan } from './createBridgeObservabilityDiagnosticsPlan.js';
import { createBridgeGovernanceRegistryPlan } from './createBridgeGovernanceRegistryPlan.js';
import { createBridgeImplementationReadinessDecision } from './createBridgeImplementationReadinessDecision.js';
import { createBridgeImplementationPlanManifest } from './createBridgeImplementationPlanManifest.js';
import { verifyBridgeImplementationPlan } from './verifyBridgeImplementationPlan.js';
import { checkBridgeImplementationPlanCompatibility } from './checkBridgeImplementationPlanCompatibility.js';
import { createBridgeImplementationPlanDiagnostics } from './createBridgeImplementationPlanDiagnostics.js';
import { createBridgeImplementationPlanFallback } from './createBridgeImplementationPlanFallback.js';

/**
 * Composes the STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE IMPLEMENTATION PLAN from an Authoring Runtime-to-
 * Preview Bridge Contract. Pure, deterministic, HEADLESS, CONTRACT-ONLY, METADATA-ONLY and PLAN-ONLY.
 * Given the same bridge contract it always returns the same object graph and digest.
 *
 * It plans a FUTURE headless bridge as pure metadata. It IMPLEMENTS NOTHING: no bridge, adapter, source
 * validator, target payload builder or preview mount; every phase is `planned`, none `implemented`. It
 * creates NO UI, editor, React component, App/router/menu/sidebar wiring; never persists, writes the
 * filesystem, touches backend/Prisma/migration/network/production/staging, reads/writes real data,
 * generates/registers a module, certifies/self-certifies/overwrites the certified SSOT, and NEVER relinks
 * the old Studio prototype. On an invalid/missing/fallback bridge contract it returns a safe fallback and
 * never throws. It authorizes NO bridge implementation slice.
 *
 * @param {Object} [options] @param {Object} [options.bridgeContract] @returns {Object}
 */
export function createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridgeContract = isGenericModelPlainObject(o.bridgeContract) ? o.bridgeContract : null;

  if (!bridgeContract
    || bridgeContract.kind !== 'studio-authoring-runtime-to-preview-bridge-contract'
    || bridgeContract.fallback === true) {
    return createBridgeImplementationPlanFallback({
      reason: bridgeContract ? 'invalid_or_fallback_bridge_contract' : 'invalid_or_missing_bridge_contract',
    });
  }

  const session = createBridgeImplementationPlanSession({ bridgeContract });
  const phases = createBridgeImplementationPhases();
  const sourceValidationPlan = createSourceValidationPlan();
  const draftIdentityEnforcementPlan = createDraftIdentityEnforcementPlan();
  const sourceVersionValidationPlan = createSourceVersionValidationPlan();
  const sourceDigestValidationPlan = createSourceDigestValidationPlan();
  const sourceBoundaryValidationPlan = createSourceBoundaryValidationPlan();
  const fieldMappingExecutionPlan = createFieldMappingExecutionPlan();
  const targetDescriptorConstructionPlan = createTargetDescriptorConstructionPlan();
  const targetVersionValidationPlan = createTargetVersionValidationPlan();
  const canonicalizationValidationPlan = createCanonicalizationValidationPlan();
  const extensibilityEnforcementPlan = createExtensibilityEnforcementPlan();
  const validationPipelinePlan = createBridgeValidationPipelinePlan();
  const replayIdempotencyPlan = createReplayIdempotencyPlan();
  const resourceLimitsPlan = createBridgeResourceLimitsPlan();
  const failureContainmentPlan = createFailureContainmentPlan();
  const ssotProtectionPlan = createBridgeSsotProtectionPlan();
  const certificationBoundaryPlan = createBridgeCertificationBoundaryPlan();
  const permissionTenancyBoundaryPlan = createBridgePermissionTenancyBoundaryPlan();
  const securitySafetyPlan = createBridgeSecuritySafetyPlan();
  const prototypeRelinkAssertionPlan = createBridgePrototypeRelinkAssertionPlan();
  const testHarnessPlan = createBridgeTestHarnessPlan();
  const manualGate = createBridgeManualEnablementGatePlan();
  const rolloutRollbackPlan = createBridgeRolloutRollbackPlan();
  const observabilityDiagnosticsPlan = createBridgeObservabilityDiagnosticsPlan();
  const governanceRegistryPlan = createBridgeGovernanceRegistryPlan();

  const compatibility = checkBridgeImplementationPlanCompatibility({ bridgeContract });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (phases.anyImplemented === true) blockers.push('bridge_plan_phase_implemented_unsafe');
  if (phases.allPlanned !== true) blockers.push('bridge_plan_phase_not_all_planned');
  if (sourceValidationPlan.sourceValidationImplemented === true) blockers.push('bridge_plan_source_validation_unsafe');
  if (draftIdentityEnforcementPlan.singleDraftFallbackAllowed === true) blockers.push('bridge_plan_single_draft_fallback_unsafe');
  if (draftIdentityEnforcementPlan.explicitDraftIdRequired !== true) blockers.push('bridge_plan_draft_identity_non_strict_unsafe');
  if (fieldMappingExecutionPlan.anyUnknownTransform === true) blockers.push('bridge_plan_mapping_unknown_transform_unsafe');
  if (fieldMappingExecutionPlan.anyLossyCritical === true) blockers.push('bridge_plan_mapping_lossy_critical_unsafe');
  if (fieldMappingExecutionPlan.everyCriticalMapped !== true) blockers.push('bridge_plan_mapping_missing_critical_unsafe');
  if (fieldMappingExecutionPlan.anyInventedSourceField === true || fieldMappingExecutionPlan.everyMappingSourceExistsInRealHandoff !== true) blockers.push('bridge_plan_mapping_invented_source_field_unsafe');
  if (fieldMappingExecutionPlan.anyLegacyAliasSourceField === true) blockers.push('bridge_plan_mapping_legacy_alias_unsafe');
  if (sourceValidationPlan.upstreamVersionsSourceFieldAllowed === true) blockers.push('bridge_plan_source_upstreamVersions_field_unsafe');
  if (sourceValidationPlan.genericDigestSourceFieldAllowed === true) blockers.push('bridge_plan_source_generic_digest_field_unsafe');
  if (sourceDigestValidationPlan.sourceDigestField !== 'handoffDigest') blockers.push('bridge_plan_digest_wrong_source_field_unsafe');
  if (sourceDigestValidationPlan.digestValidationMode !== 'recompute_and_compare') blockers.push('bridge_plan_digest_wrong_validation_mode_unsafe');
  if (sourceVersionValidationPlan.aggregatedUpstreamVersionsFieldRequired === true) blockers.push('bridge_plan_version_upstreamVersions_required_unsafe');
  if (sourceVersionValidationPlan.unknownVersionFailsClosed !== true) blockers.push('bridge_plan_version_permissive_unsafe');
  if (resourceLimitsPlan.limitMismatchIsNotSilent !== true) blockers.push('bridge_plan_limit_mismatch_silent_unsafe');
  if (sourceDigestValidationPlan.cryptographicIntegrityProvided === true) blockers.push('bridge_plan_digest_cryptographic_unsafe');
  if (resourceLimitsPlan.unknownResourceDimensionRejected !== true) blockers.push('bridge_plan_unknown_resource_dimension_unsafe');
  if (ssotProtectionPlan.certifiedBlueprintRemainsSsot !== true) blockers.push('bridge_plan_ssot_not_preserved');
  if (ssotProtectionPlan.draftIsCanonical === true) blockers.push('bridge_plan_ssot_inversion_unsafe');
  if (permissionTenancyBoundaryPlan.permissionModelIntegrated === true) blockers.push('bridge_plan_permission_integrated_unsafe');
  if (securitySafetyPlan.anyForbiddenSideEffect === true) blockers.push('bridge_plan_safety_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('bridge_plan_manual_gate_missing');
  if (manualGate.authorizesBridgeImplementation === true) blockers.push('bridge_plan_manual_gate_authorizes_real');

  const readiness = createBridgeImplementationReadinessDecision({ blockers, warnings });

  const parts = {
    session, phases, sourceValidationPlan, draftIdentityEnforcementPlan, sourceVersionValidationPlan,
    sourceDigestValidationPlan, sourceBoundaryValidationPlan, fieldMappingExecutionPlan,
    targetDescriptorConstructionPlan, targetVersionValidationPlan, canonicalizationValidationPlan,
    extensibilityEnforcementPlan, validationPipelinePlan, replayIdempotencyPlan, resourceLimitsPlan,
    failureContainmentPlan, ssotProtectionPlan, certificationBoundaryPlan, permissionTenancyBoundaryPlan,
    securitySafetyPlan, prototypeRelinkAssertionPlan, testHarnessPlan, manualGate, rolloutRollbackPlan,
    observabilityDiagnosticsPlan, governanceRegistryPlan, readiness,
  };
  const manifest = createBridgeImplementationPlanManifest({ parts });

  const ready = blockers.length === 0;
  const core = {
    kind: 'studio-authoring-runtime-to-preview-bridge-implementation-plan',
    bridgeImplementationPlanName: BRIDGE_IMPLEMENTATION_PLAN_NAME,
    bridgeImplementationPlanVersion: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
    bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
    authoringRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    previewSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    mode: BRIDGE_IMPLEMENTATION_PLAN_MODE,
    fallback: false,
    metadataOnly: true,
    session,
    phases,
    sourceValidationPlan,
    draftIdentityEnforcementPlan,
    sourceVersionValidationPlan,
    sourceDigestValidationPlan,
    sourceBoundaryValidationPlan,
    fieldMappingExecutionPlan,
    targetDescriptorConstructionPlan,
    targetVersionValidationPlan,
    canonicalizationValidationPlan,
    extensibilityEnforcementPlan,
    validationPipelinePlan,
    replayIdempotencyPlan,
    resourceLimitsPlan,
    failureContainmentPlan,
    ssotProtectionPlan,
    certificationBoundaryPlan,
    permissionTenancyBoundaryPlan,
    securitySafetyPlan,
    prototypeRelinkAssertionPlan,
    testHarnessPlan,
    manualGate,
    rolloutRollbackPlan,
    observabilityDiagnosticsPlan,
    governanceRegistryPlan,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForBridgeImplementationPlan: ready,
    readyForBridgeImplementationEnterpriseRevalidation: ready,
    readyForBridgeImplementationSlice: false,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES },
  };

  const plan = safeCloneGenericModel({ ...core, overallDigest: bridgePlanDigest(core) });
  const verification = verifyBridgeImplementationPlan({ plan });
  const diagnostics = createBridgeImplementationPlanDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...plan,
    verification,
    diagnostics,
    bridgeImplementationPlanDigest: bridgePlanDigest({ overallDigest: plan.overallDigest, verification, diagnostics }),
  });
}

export default createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan;
