import {
  BRIDGE_CONTRACT_NAME, BRIDGE_CONTRACT_VERSION, BRIDGE_CONTRACT_MODE, BRIDGE_CONTRACT_CAPABILITIES,
  AUTHORING_RUNTIME_VERSION, AUTHORING_IMPLEMENTATION_PLAN_VERSION, AUTHORING_FOUNDATION_CONTRACT_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION, SOURCE_HANDOFF_KIND,
  REQUIRED_FUTURE_CHECKPOINT, bridgeDigest,
} from './bridgeContractConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createBridgeContractSession } from './createBridgeContractSession.js';
import { createSourceHandoffContract } from './createSourceHandoffContract.js';
import { createTargetPreviewSandboxContract } from './createTargetPreviewSandboxContract.js';
import { createBridgeFieldMappingContract } from './createBridgeFieldMappingContract.js';
import { createBridgeVersionCompatibilityContract } from './createBridgeVersionCompatibilityContract.js';
import { createBridgeDigestSemanticsContract } from './createBridgeDigestSemanticsContract.js';
import { createBridgeCanonicalizationContract } from './createBridgeCanonicalizationContract.js';
import { createBridgeValidationPipelineContract } from './createBridgeValidationPipelineContract.js';
import { createBridgeExtensibilityPolicyContract } from './createBridgeExtensibilityPolicyContract.js';
import { createBridgeReplayIdempotencyContract } from './createBridgeReplayIdempotencyContract.js';
import { createBridgeSsotBoundaryContract } from './createBridgeSsotBoundaryContract.js';
import { createBridgeCertificationBoundaryContract } from './createBridgeCertificationBoundaryContract.js';
import { createBridgePermissionTenancyBoundaryContract } from './createBridgePermissionTenancyBoundaryContract.js';
import { createBridgeSecuritySafetyContract } from './createBridgeSecuritySafetyContract.js';
import { createBridgePrototypeRelinkProhibitionContract } from './createBridgePrototypeRelinkProhibitionContract.js';
import { createBridgeUpstreamHardeningNotes } from './createBridgeUpstreamHardeningNotes.js';
import { createBridgeManualEnablementGateContract } from './createBridgeManualEnablementGateContract.js';
import { checkBridgeCompatibility } from './checkBridgeCompatibility.js';
import { createBridgeReadinessDecision } from './createBridgeReadinessDecision.js';
import { createBridgeManifest } from './createBridgeManifest.js';
import { verifyBridgeContract } from './verifyBridgeContract.js';
import { createBridgeDiagnostics } from './createBridgeDiagnostics.js';
import { createBridgeFallback } from './createBridgeFallback.js';

/**
 * Composes the STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE CONTRACT from an Authoring Runtime
 * `synthetic_preview_candidate` handoff. Pure, deterministic, HEADLESS, CONTRACT-ONLY, METADATA-ONLY,
 * SYNTHETIC-ONLY, FAIL-CLOSED and READ-ONLY over its upstreams. Given the same source handoff it always
 * returns the same object graph and digest.
 *
 * It defines the contract between the Authoring Runtime's synthetic preview handoff and the Module
 * Preview Sandbox contract. It IMPLEMENTS NO bridge, NO adapter, NO source validation runtime, NO target
 * payload, NO preview mount. It creates NO UI, editor, React component, App/router/menu/sidebar wiring;
 * never persists, writes the filesystem, touches backend/Prisma/migration/network/production/staging,
 * reads/writes real data, generates/registers a module, certifies/self-certifies/overwrites the
 * certified SSOT, and NEVER relinks the old Studio prototype. On an invalid/missing/fallback/non-
 * synthetic source handoff it returns a safe fallback and never throws.
 *
 * @param {Object} [options] @param {Object} [options.sourceHandoff] @returns {Object}
 */
export function createStudioAuthoringRuntimeToPreviewBridgeContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const sourceHandoff = isGenericModelPlainObject(o.sourceHandoff) ? o.sourceHandoff : null;

  if (!isValidSourceHandoff(sourceHandoff)) {
    return createBridgeFallback({
      reason: sourceHandoff ? 'invalid_or_non_synthetic_source_handoff' : 'invalid_or_missing_source_handoff',
    });
  }

  const session = createBridgeContractSession({ sourceHandoff });
  const sourceHandoffContract = createSourceHandoffContract();
  const targetPreviewSandbox = createTargetPreviewSandboxContract();
  const fieldMapping = createBridgeFieldMappingContract();
  const versionCompatibility = createBridgeVersionCompatibilityContract();
  const digestSemantics = createBridgeDigestSemanticsContract();
  const canonicalization = createBridgeCanonicalizationContract();
  const validationPipeline = createBridgeValidationPipelineContract();
  const extensibility = createBridgeExtensibilityPolicyContract();
  const replayIdempotency = createBridgeReplayIdempotencyContract();
  const ssotBoundary = createBridgeSsotBoundaryContract();
  const certificationBoundary = createBridgeCertificationBoundaryContract();
  const permissionTenancy = createBridgePermissionTenancyBoundaryContract();
  const securitySafety = createBridgeSecuritySafetyContract();
  const prototypeRelinkProhibition = createBridgePrototypeRelinkProhibitionContract();
  const upstreamHardeningNotes = createBridgeUpstreamHardeningNotes();
  const manualGate = createBridgeManualEnablementGateContract();
  const compatibility = checkBridgeCompatibility({ sourceHandoff });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (sourceHandoffContract.strictDraftIdentityRequired !== true) blockers.push('bridge_source_non_strict_draft_identity');
  if (sourceHandoffContract.singleDraftFallbackAllowed === true) blockers.push('bridge_source_single_draft_fallback');
  if (fieldMapping.anyUnknownTransform === true) blockers.push('bridge_mapping_unknown_transform');
  if (fieldMapping.anyCriticalDefault === true) blockers.push('bridge_mapping_critical_default');
  if (fieldMapping.anyLossyCritical === true) blockers.push('bridge_mapping_lossy_critical');
  if (fieldMapping.everyCriticalMapped !== true) blockers.push('bridge_mapping_missing_critical');
  if (versionCompatibility.unknownVersionFailsClosed !== true) blockers.push('bridge_version_unknown_not_fail_closed');
  if (validationPipeline.failClosed !== true) blockers.push('bridge_validation_not_fail_closed');
  if (ssotBoundary.certifiedBlueprintRemainsSsot !== true) blockers.push('bridge_ssot_not_preserved');
  if (ssotBoundary.draftIsCanonical === true || ssotBoundary.candidateIsCanonical === true) blockers.push('bridge_ssot_inversion');
  if (certificationBoundary.certificationPerformed === true) blockers.push('bridge_certification_performed');
  if (permissionTenancy.permissionModelIntegrated === true) blockers.push('bridge_permission_integrated');
  if (securitySafety.anyRealAllowed === true) blockers.push('bridge_security_real_allowed');
  if (manualGate.manualGateRequired !== true) blockers.push('bridge_manual_gate_missing');
  if (manualGate.authorizesBridgeImplementation === true) blockers.push('bridge_manual_gate_authorizes_real');

  const readiness = createBridgeReadinessDecision({ blockers, warnings });
  const parts = {
    session, sourceHandoff: sourceHandoffContract, targetPreviewSandbox, fieldMapping, versionCompatibility,
    digestSemantics, canonicalization, validationPipeline, extensibility, replayIdempotency, ssotBoundary,
    certificationBoundary, permissionTenancy, securitySafety, prototypeRelinkProhibition,
    upstreamHardeningNotes, manualGate, readiness,
  };
  const manifest = createBridgeManifest({ parts });

  const ready = blockers.length === 0;
  const core = {
    kind: 'studio-authoring-runtime-to-preview-bridge-contract',
    bridgeContractName: BRIDGE_CONTRACT_NAME,
    bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
    authoringRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    authoringImplementationPlanVersion: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
    authoringFoundationContractVersion: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    previewSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    sourceHandoffKind: SOURCE_HANDOFF_KIND,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    mode: BRIDGE_CONTRACT_MODE,
    fallback: false,
    metadataOnly: true,
    session,
    sourceHandoff: sourceHandoffContract,
    targetPreviewSandbox,
    fieldMapping,
    versionCompatibility,
    digestSemantics,
    canonicalization,
    validationPipeline,
    extensibility,
    replayIdempotency,
    ssotBoundary,
    certificationBoundary,
    permissionTenancy,
    securitySafety,
    prototypeRelinkProhibition,
    upstreamHardeningNotes,
    manualGate,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForBridgeContract: ready,
    readyForBridgeImplementationPlan: ready,
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
    capabilities: { ...BRIDGE_CONTRACT_CAPABILITIES },
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: bridgeDigest(core) });
  const verification = verifyBridgeContract({ contract });
  const diagnostics = createBridgeDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    bridgeContractDigest: bridgeDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

/** @param {unknown} handoff @returns {boolean} */
function isValidSourceHandoff(handoff) {
  if (!isGenericModelPlainObject(handoff)) return false;
  if (handoff.fallback === true) return false;
  if (handoff.handoffKind !== SOURCE_HANDOFF_KIND) return false;
  if (handoff.synthetic !== true) return false;
  if (handoff.validated !== true) return false;
  if (handoff.ok !== true) return false;
  if (typeof handoff.draftId !== 'string' || handoff.draftId.length === 0) return false;
  return true;
}

export default createStudioAuthoringRuntimeToPreviewBridgeContract;
