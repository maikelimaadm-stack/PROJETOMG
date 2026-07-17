import {
  AUTHORING_RUNTIME_NAME, AUTHORING_RUNTIME_VERSION, AUTHORING_RUNTIME_MODE, AUTHORING_RUNTIME_CAPABILITIES,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION, AUTHORING_FOUNDATION_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION, MODULE_REFERENCE_PLANNER_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION,
  SOURCE_CHECKPOINT, CHECKPOINT_DECISION,
} from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createAuthoringResourceLimits } from './createAuthoringResourceLimits.js';
import { createAuthoringRuntimeSession } from './createAuthoringRuntimeSession.js';
import { createLifecycleExecutor } from './createLifecycleExecutor.js';
import { createOperationExecutor } from './createOperationExecutor.js';
import { createRevisionEngine } from './createRevisionEngine.js';
import { createValidationPipeline } from './createValidationPipeline.js';
import { createInvariantEnforcer } from './createInvariantEnforcer.js';
import { createSyntheticPreviewHandoff } from './createSyntheticPreviewHandoff.js';
import { createCertificationCandidatePreparation } from './createCertificationCandidatePreparation.js';
import { discardAuthoringDraft } from './discardAuthoringDraft.js';
import { createAuthoringRuntimeSsotBoundary } from './createAuthoringRuntimeSsotBoundary.js';
import { createAuthoringRuntimePermissionTenancyBoundary } from './createAuthoringRuntimePermissionTenancyBoundary.js';
import { createAuthoringRuntimeSafety } from './createAuthoringRuntimeSafety.js';
import { createAuthoringRuntimeReadinessDecision } from './createAuthoringRuntimeReadinessDecision.js';
import { createAuthoringRuntimeManifest } from './createAuthoringRuntimeManifest.js';
import { verifyAuthoringRuntime } from './verifyAuthoringRuntime.js';
import { checkAuthoringRuntimeCompatibility } from './checkAuthoringRuntimeCompatibility.js';
import { createAuthoringRuntimeDiagnostics } from './createAuthoringRuntimeDiagnostics.js';
import { createAuthoringRuntimeFallback } from './createAuthoringRuntimeFallback.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/** The manual enablement gate (pure data). */
function createManualGate() {
  return {
    kind: 'authoring-runtime-manual-enablement-gate',
    manualGateRequired: true,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    checkpointDecision: CHECKPOINT_DECISION,
    currentSliceAuthorization: 'headless_authoring_runtime_only',
    authorizesAuthoringRuntime: true,
    authorizesAuthoringUi: false,
    authorizesEditor: false,
    authorizesPersistence: false,
    authorizesFilesystemWrites: false,
    authorizesModuleGeneration: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesProductExposure: false,
    authorizesProduction: false,
    authorizesRealData: false,
  };
}

/**
 * Composes the STUDIO MODULE BLUEPRINT AUTHORING RUNTIME metadata contract from a Studio Module
 * Blueprint Authoring Implementation Plan. Pure, deterministic, HEADLESS, SYNTHETIC-ONLY, IN-MEMORY,
 * EPHEMERAL, IMMUTABLE and FAIL-CLOSED. Given the same plan it always returns the same object graph and
 * digest.
 *
 * The RUNTIME is implemented (drafts/lifecycle/operations/revisions/validation/invariants/handoffs run
 * purely in memory on synthetic data via the exported executor functions). It creates NO UI, editor,
 * persistence, filesystem write, module, App/router/menu wiring; never touches backend/Prisma/network/
 * production/staging, never mutates real data, never rewrites Empresas, never certifies/self-certifies/
 * overwrites the certified SSOT, and NEVER relinks the old Studio prototype. On an invalid/missing/
 * fallback plan it returns a safe fallback and never throws.
 *
 * @param {Object} [options] @param {Object} [options.authoringImplementationPlan]
 * @returns {Object} the authoring runtime metadata contract
 */
export function createStudioModuleBlueprintAuthoringRuntime(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const plan = isPlainObject(o.authoringImplementationPlan) ? o.authoringImplementationPlan : null;

  if (!plan || plan.kind !== 'studio-module-blueprint-authoring-implementation-plan' || plan.fallback === true) {
    return createAuthoringRuntimeFallback({
      reason: plan ? 'invalid_or_fallback_authoring_implementation_plan' : 'invalid_or_missing_authoring_implementation_plan',
    });
  }

  const limits = createAuthoringResourceLimits();
  const session = createAuthoringRuntimeSession({ seed: 'reference' });
  const lifecycle = createLifecycleExecutor();
  const operations = createOperationExecutor();
  const revisions = createRevisionEngine();
  const validation = createValidationPipeline();
  const invariants = createInvariantEnforcer();
  const previewHandoff = createSyntheticPreviewHandoff();
  const candidatePreparation = createCertificationCandidatePreparation();
  const discard = discardAuthoringDraft();
  const ssotBoundary = createAuthoringRuntimeSsotBoundary();
  const permissionTenancy = createAuthoringRuntimePermissionTenancyBoundary();
  const safety = createAuthoringRuntimeSafety();
  const manualGate = createManualGate();

  const compatibility = checkAuthoringRuntimeCompatibility({ authoringImplementationPlan: plan });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (ssotBoundary.certifiedBlueprintRemainsSsot !== true) blockers.push('authoring_runtime_ssot_not_preserved');
  if (ssotBoundary.draftIsCanonical === true) blockers.push('authoring_runtime_draft_canonical_unsafe');
  if (operations.allowlistOnly !== true) blockers.push('authoring_runtime_operations_not_allowlist_unsafe');
  if (revisions.negativeRevisionAllowed === true) blockers.push('authoring_runtime_revision_negative_unsafe');
  if (validation.failClosed !== true) blockers.push('authoring_runtime_validation_not_fail_closed_unsafe');
  if (permissionTenancy.permissionModelIntegrated === true) blockers.push('authoring_runtime_permission_integrated_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('authoring_runtime_manual_gate_missing');
  if (safety.anyForbiddenSideEffect === true) blockers.push('authoring_runtime_safety_unsafe');

  const readiness = createAuthoringRuntimeReadinessDecision({ blockers, warnings });
  const parts = {
    session, limits, lifecycle, operations, revisions, validation, invariants, previewHandoff,
    candidate: candidatePreparation, discard, ssotBoundary, permissionTenancy, safety, readiness,
  };
  const manifest = createAuthoringRuntimeManifest({ parts });

  const core = {
    kind: 'studio-module-blueprint-authoring-runtime',
    authoringRuntimeName: AUTHORING_RUNTIME_NAME,
    authoringRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    authoringImplementationPlanVersion: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
    authoringFoundationContractVersion: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    blueprintEngineVersion: BLUEPRINT_ENGINE_VERSION,
    moduleReferencePlannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    previewSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    checkpointDecision: CHECKPOINT_DECISION,
    mode: AUTHORING_RUNTIME_MODE,
    fallback: false,
    metadataOnly: true,
    session,
    limits,
    lifecycle,
    operations,
    revisions,
    validation,
    invariants,
    previewHandoff,
    candidatePreparation,
    discard,
    ssotBoundary,
    permissionTenancy,
    safety,
    manualGate,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForAuthoringRuntime: readiness.readyForAuthoringRuntime === true,
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
    capabilities: { ...AUTHORING_RUNTIME_CAPABILITIES },
  };

  const runtime = Object.freeze({ ...core, overallDigest: createDeterministicDigest(core) });
  const verification = verifyAuthoringRuntime({ runtime });
  const diagnostics = createAuthoringRuntimeDiagnostics({ session, verification });

  return Object.freeze({
    ...runtime,
    verification,
    diagnostics,
    authoringRuntimeDigest: createDeterministicDigest({ overallDigest: runtime.overallDigest, verification, diagnostics }),
  });
}

export default createStudioModuleBlueprintAuthoringRuntime;
