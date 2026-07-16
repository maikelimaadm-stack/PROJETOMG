import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_FOUNDATION_CONTRACT_NAME,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_MODE,
  AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  authoringFoundationDigest,
} from './authoringFoundationContractConfig.js';
import { createAuthoringFoundationContractSession } from './createAuthoringFoundationContractSession.js';
import { createBlueprintDraftDescriptor } from './createBlueprintDraftDescriptor.js';
import { createAuthoringLifecycleContract } from './createAuthoringLifecycleContract.js';
import { createAuthoringOperationCatalog } from './createAuthoringOperationCatalog.js';
import { createAuthoringInvariantCatalog } from './createAuthoringInvariantCatalog.js';
import { createPreviewHandoffContract } from './createPreviewHandoffContract.js';
import { createCertificationCandidateHandoffContract } from './createCertificationCandidateHandoffContract.js';
import { createAuthoringSsotBoundaryContract } from './createAuthoringSsotBoundaryContract.js';
import { createPermissionTenancyBoundaryContract } from './createPermissionTenancyBoundaryContract.js';
import { createPrototypeRelinkProhibitionContract } from './createPrototypeRelinkProhibitionContract.js';
import { createAuthoringManualEnablementGateContract } from './createAuthoringManualEnablementGateContract.js';
import { createAuthoringSafetyContract } from './createAuthoringSafetyContract.js';
import { createAuthoringFoundationReadinessDecision } from './createAuthoringFoundationReadinessDecision.js';
import { createAuthoringFoundationManifest } from './createAuthoringFoundationManifest.js';
import { verifyAuthoringFoundationContract } from './verifyAuthoringFoundationContract.js';
import { checkAuthoringFoundationCompatibility } from './checkAuthoringFoundationCompatibility.js';
import { createAuthoringFoundationDiagnostics } from './createAuthoringFoundationDiagnostics.js';
import { createAuthoringFoundationFallback } from './createAuthoringFoundationFallback.js';

/**
 * Composes the STUDIO MODULE BLUEPRINT AUTHORING FOUNDATION CONTRACT from a CERTIFIED Blueprint
 * Contract. Pure, deterministic, HEADLESS, CONTRACT-ONLY and METADATA-ONLY. Given the same certified
 * blueprint it always returns the same object graph and digest.
 *
 * It describes — as pure metadata — the contractual foundation for FUTURE Module Blueprint authoring:
 * a non-canonical draft model, field/layout/relationship descriptors, a validation-issue shape, a
 * lifecycle, an authorable operation catalog, structural invariants, synthetic preview + human-gated
 * certification-candidate handoffs, an SSOT boundary, a permission/tenancy boundary, a prototype-relink
 * prohibition and a manual enablement gate.
 *
 * It IMPLEMENTS NOTHING. It creates NO authoring runtime, NO UI, NO editor, NO module, NO persistence;
 * NO App/router/menu/sidebar wiring; NO `.jsx`/`.tsx`/`.css`; NO React component. It never touches
 * backend/Prisma/migration/network/production/staging, never mutates, never persists, never
 * reads/writes real data, never rewrites Empresas, and NEVER relinks the old Studio prototype. A draft
 * can NEVER self-certify or overwrite the certified contract. On an invalid/missing/fallback certified
 * blueprint it returns a safe fallback and never throws. It authorizes NO authoring.
 *
 * @param {Object} [options]
 * @param {Object} [options.certifiedBlueprint] a certified blueprint contract (read-only SSOT)
 * @returns {Object} the authoring foundation contract
 */
export function createStudioModuleBlueprintAuthoringFoundationContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const certifiedBlueprint = isGenericModelPlainObject(o.certifiedBlueprint) ? o.certifiedBlueprint : null;

  const invalidUpstream = !certifiedBlueprint
    || certifiedBlueprint.fallback === true
    || (certifiedBlueprint.kind !== 'studio-blueprint-contract' && certifiedBlueprint.certified !== true);

  if (invalidUpstream) {
    return createAuthoringFoundationFallback({
      reason: certifiedBlueprint ? 'invalid_or_fallback_certified_blueprint' : 'invalid_or_missing_certified_blueprint',
    });
  }

  const session = createAuthoringFoundationContractSession({ certifiedBlueprint });
  const sampleDraft = createBlueprintDraftDescriptor({ moduleId: certifiedBlueprint.moduleId });
  const lifecycle = createAuthoringLifecycleContract();
  const operationCatalog = createAuthoringOperationCatalog();
  const invariantCatalog = createAuthoringInvariantCatalog();
  const previewHandoff = createPreviewHandoffContract();
  const certificationCandidate = createCertificationCandidateHandoffContract();
  const ssotBoundary = createAuthoringSsotBoundaryContract();
  const permissionTenancy = createPermissionTenancyBoundaryContract();
  const prototypeRelinkProhibition = createPrototypeRelinkProhibitionContract();
  const manualGate = createAuthoringManualEnablementGateContract();
  const safety = createAuthoringSafetyContract();

  const compatibility = checkAuthoringFoundationCompatibility({ certifiedBlueprint });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (ssotBoundary.draftIsCanonical === true) blockers.push('authoring_foundation_draft_canonical_unsafe');
  if (ssotBoundary.certifiedBlueprintRemainsSsot !== true) blockers.push('authoring_foundation_ssot_not_preserved');
  if (ssotBoundary.draftSelfCertifies === true) blockers.push('authoring_foundation_draft_self_certifies_unsafe');
  if (operationCatalog.anyImplemented === true) blockers.push('authoring_foundation_operations_implemented_unsafe');
  if (previewHandoff.handoffToProduct === true) blockers.push('authoring_foundation_preview_to_product_unsafe');
  if (certificationCandidate.candidateIsCertification === true) blockers.push('authoring_foundation_candidate_certifies_unsafe');
  if (permissionTenancy.bypassesPermission === true || permissionTenancy.bypassesTenancy === true) blockers.push('authoring_foundation_permission_tenancy_bypass_unsafe');
  if (prototypeRelinkProhibition.prototypeRelinkAllowed === true) blockers.push('authoring_foundation_prototype_relink_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('authoring_foundation_manual_gate_missing');
  if (safety.anyForbiddenSideEffect === true) blockers.push('authoring_foundation_safety_unsafe');

  const readiness = createAuthoringFoundationReadinessDecision({ blockers, warnings });

  const parts = {
    session, lifecycle, operationCatalog, invariantCatalog, previewHandoff, certificationCandidate,
    ssotBoundary, permissionTenancy, prototypeRelinkProhibition, manualGate, safety, readiness,
  };
  const manifest = createAuthoringFoundationManifest({ certifiedBlueprint, parts });

  const core = {
    kind: 'studio-module-blueprint-authoring-foundation-contract',
    authoringFoundationContractName: AUTHORING_FOUNDATION_CONTRACT_NAME,
    authoringFoundationContractVersion: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    blueprintEngineVersion: BLUEPRINT_ENGINE_VERSION,
    moduleReferencePlannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    previewSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    mode: AUTHORING_FOUNDATION_CONTRACT_MODE,
    moduleId: String(certifiedBlueprint.moduleId ?? 'plannedModule'),
    fallback: false,
    headless: true,
    contractOnly: true,
    metadataOnly: true,
    authoringFoundationContractOnly: true,
    devOnly: true,
    isolated: true,
    session,
    sampleDraft,
    lifecycle,
    operationCatalog,
    invariantCatalog,
    previewHandoff,
    certificationCandidate,
    ssotBoundary,
    permissionTenancy,
    prototypeRelinkProhibition,
    manualGate,
    safety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForAuthoringFoundationContract: readiness.readyForAuthoringFoundationContract === true,
    readyForAuthoringImplementationPlan: false,
    readyForAuthoringRuntime: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundation: true,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES },
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: authoringFoundationDigest(core) });

  const verification = verifyAuthoringFoundationContract({ contract });
  const diagnostics = createAuthoringFoundationDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    authoringFoundationContractDigest: authoringFoundationDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioModuleBlueprintAuthoringFoundationContract;
