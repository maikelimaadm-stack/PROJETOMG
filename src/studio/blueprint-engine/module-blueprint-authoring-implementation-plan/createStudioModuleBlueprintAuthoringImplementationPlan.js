import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_IMPLEMENTATION_PLAN_NAME,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_MODE,
  AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  authoringPlanDigest,
} from './authoringImplementationPlanConfig.js';
import { createAuthoringImplementationPlanSession } from './createAuthoringImplementationPlanSession.js';
import { createAuthoringImplementationPhases } from './createAuthoringImplementationPhases.js';
import { createDraftRuntimePlan } from './createDraftRuntimePlan.js';
import { createLifecycleRuntimePlan } from './createLifecycleRuntimePlan.js';
import { createOperationExecutorPlan } from './createOperationExecutorPlan.js';
import { createRevisionEnginePlan } from './createRevisionEnginePlan.js';
import { createValidationPipelinePlan } from './createValidationPipelinePlan.js';
import { createInvariantEnforcementPlan } from './createInvariantEnforcementPlan.js';
import { createSyntheticPreviewHandoffPlan } from './createSyntheticPreviewHandoffPlan.js';
import { createCertificationCandidatePreparationPlan } from './createCertificationCandidatePreparationPlan.js';
import { createSsotProtectionPlan } from './createSsotProtectionPlan.js';
import { createPermissionTenancyBoundaryPlan } from './createPermissionTenancyBoundaryPlan.js';
import { createPersistenceProhibitionPlan } from './createPersistenceProhibitionPlan.js';
import { createModuleGenerationProhibitionPlan } from './createModuleGenerationProhibitionPlan.js';
import { createPrototypeRelinkStaticAssertionPlan } from './createPrototypeRelinkStaticAssertionPlan.js';
import { createAuthoringTestHarnessPlan } from './createAuthoringTestHarnessPlan.js';
import { createAuthoringManualEnablementGatePlan } from './createAuthoringManualEnablementGatePlan.js';
import { createAuthoringRolloutRollbackPlan } from './createAuthoringRolloutRollbackPlan.js';
import { createAuthoringObservabilityDiagnosticsPlan } from './createAuthoringObservabilityDiagnosticsPlan.js';
import { createAuthoringGovernanceRegistryPlan } from './createAuthoringGovernanceRegistryPlan.js';
import { createAuthoringImplementationSafetyPlan } from './createAuthoringImplementationSafetyPlan.js';
import { createAuthoringImplementationReadinessDecision } from './createAuthoringImplementationReadinessDecision.js';
import { createAuthoringImplementationPlanManifest } from './createAuthoringImplementationPlanManifest.js';
import { verifyAuthoringImplementationPlan } from './verifyAuthoringImplementationPlan.js';
import { checkAuthoringImplementationPlanCompatibility } from './checkAuthoringImplementationPlanCompatibility.js';
import { createAuthoringImplementationPlanDiagnostics } from './createAuthoringImplementationPlanDiagnostics.js';
import { createAuthoringImplementationPlanFallback } from './createAuthoringImplementationPlanFallback.js';

/**
 * Composes the STUDIO MODULE BLUEPRINT AUTHORING IMPLEMENTATION PLAN from a Studio Module Blueprint
 * Authoring Foundation Contract. Pure, deterministic, HEADLESS, CONTRACT-ONLY, METADATA-ONLY and
 * PLAN-ONLY. Given the same foundation contract it always returns the same object graph and digest.
 *
 * It plans a FUTURE headless authoring runtime as pure metadata. It IMPLEMENTS NOTHING. It creates NO
 * authoring runtime, NO UI, NO editor, NO persistence, NO module, NO App/router/menu/sidebar wiring,
 * NO `.jsx`/`.tsx`/`.css`, NO React component; it never touches backend/Prisma/migration/network/
 * production/staging, never mutates, never persists, never reads/writes real data, never rewrites
 * Empresas, and NEVER relinks the old Studio prototype. A draft can NEVER self-certify or overwrite the
 * certified contract. On an invalid/missing/fallback foundation contract it returns a safe fallback and
 * never throws. It authorizes NO authoring runtime implementation slice.
 *
 * @param {Object} [options]
 * @param {Object} [options.authoringFoundationContract] a studio module blueprint authoring foundation contract
 * @returns {Object} the authoring implementation plan
 */
export function createStudioModuleBlueprintAuthoringImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const authoringFoundationContract = isGenericModelPlainObject(o.authoringFoundationContract) ? o.authoringFoundationContract : null;

  if (!authoringFoundationContract
    || authoringFoundationContract.kind !== 'studio-module-blueprint-authoring-foundation-contract'
    || authoringFoundationContract.fallback === true) {
    return createAuthoringImplementationPlanFallback({
      reason: authoringFoundationContract ? 'invalid_or_fallback_authoring_foundation_contract' : 'invalid_or_missing_authoring_foundation_contract',
    });
  }

  const session = createAuthoringImplementationPlanSession({ authoringFoundationContract });
  const phases = createAuthoringImplementationPhases();
  const draftRuntimePlan = createDraftRuntimePlan();
  const lifecycleRuntimePlan = createLifecycleRuntimePlan();
  const operationExecutorPlan = createOperationExecutorPlan();
  const revisionEnginePlan = createRevisionEnginePlan();
  const validationPipelinePlan = createValidationPipelinePlan();
  const invariantEnforcementPlan = createInvariantEnforcementPlan();
  const syntheticPreviewHandoffPlan = createSyntheticPreviewHandoffPlan();
  const certificationCandidatePreparationPlan = createCertificationCandidatePreparationPlan();
  const ssotProtectionPlan = createSsotProtectionPlan();
  const permissionTenancyBoundaryPlan = createPermissionTenancyBoundaryPlan();
  const persistenceProhibitionPlan = createPersistenceProhibitionPlan();
  const moduleGenerationProhibitionPlan = createModuleGenerationProhibitionPlan();
  const prototypeRelinkStaticAssertion = createPrototypeRelinkStaticAssertionPlan();
  const testHarness = createAuthoringTestHarnessPlan();
  const manualGate = createAuthoringManualEnablementGatePlan();
  const rolloutRollback = createAuthoringRolloutRollbackPlan();
  const observability = createAuthoringObservabilityDiagnosticsPlan();
  const governanceRegistry = createAuthoringGovernanceRegistryPlan();
  const safety = createAuthoringImplementationSafetyPlan();

  const compatibility = checkAuthoringImplementationPlanCompatibility({ authoringFoundationContract });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (phases.anyImplemented === true) blockers.push('authoring_plan_phase_implemented_unsafe');
  if (draftRuntimePlan.draftRuntimeImplemented === true) blockers.push('authoring_plan_draft_runtime_unsafe');
  if (lifecycleRuntimePlan.lifecycleRuntimeImplemented === true) blockers.push('authoring_plan_lifecycle_runtime_unsafe');
  if (operationExecutorPlan.operationExecutorImplemented === true) blockers.push('authoring_plan_operation_executor_unsafe');
  if (validationPipelinePlan.validationPipelineImplemented === true) blockers.push('authoring_plan_validation_pipeline_unsafe');
  if (ssotProtectionPlan.certifiedBlueprintRemainsSsot !== true) blockers.push('authoring_plan_ssot_not_preserved');
  if (ssotProtectionPlan.draftIsCanonical === true) blockers.push('authoring_plan_draft_canonical_unsafe');
  if (permissionTenancyBoundaryPlan.permissionModelIntegrated === true) blockers.push('authoring_plan_permission_integrated_unsafe');
  if (persistenceProhibitionPlan.persistenceImplemented === true) blockers.push('authoring_plan_persistence_unsafe');
  if (moduleGenerationProhibitionPlan.moduleGenerated === true) blockers.push('authoring_plan_module_generation_unsafe');
  if (prototypeRelinkStaticAssertion.prototypeRelinkAllowed === true) blockers.push('authoring_plan_prototype_relink_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('authoring_plan_manual_gate_missing');
  if (safety.anyForbiddenSideEffect === true) blockers.push('authoring_plan_safety_unsafe');

  const readiness = createAuthoringImplementationReadinessDecision({ blockers, warnings });

  const parts = {
    session, phases, draftRuntimePlan, lifecycleRuntimePlan, operationExecutorPlan, revisionEnginePlan,
    validationPipelinePlan, invariantEnforcementPlan, syntheticPreviewHandoffPlan,
    certificationCandidatePreparationPlan, ssotProtectionPlan, permissionTenancyBoundaryPlan,
    persistenceProhibitionPlan, moduleGenerationProhibitionPlan, prototypeRelinkStaticAssertion,
    testHarness, manualGate, rolloutRollback, observability, governanceRegistry, safety, readiness,
  };
  const manifest = createAuthoringImplementationPlanManifest({ authoringFoundationContract, parts });

  const core = {
    kind: 'studio-module-blueprint-authoring-implementation-plan',
    authoringImplementationPlanName: AUTHORING_IMPLEMENTATION_PLAN_NAME,
    authoringImplementationPlanVersion: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
    authoringFoundationContractVersion: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    blueprintEngineVersion: BLUEPRINT_ENGINE_VERSION,
    moduleReferencePlannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    previewSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    mode: AUTHORING_IMPLEMENTATION_PLAN_MODE,
    moduleId: String(authoringFoundationContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    phases,
    draftRuntimePlan,
    lifecycleRuntimePlan,
    operationExecutorPlan,
    revisionEnginePlan,
    validationPipelinePlan,
    invariantEnforcementPlan,
    syntheticPreviewHandoffPlan,
    certificationCandidatePreparationPlan,
    ssotProtectionPlan,
    permissionTenancyBoundaryPlan,
    persistenceProhibitionPlan,
    moduleGenerationProhibitionPlan,
    prototypeRelinkStaticAssertion,
    testHarness,
    manualGate,
    rolloutRollback,
    observability,
    governanceRegistry,
    safety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForAuthoringImplementationPlan: readiness.readyForAuthoringImplementationPlan === true,
    readyForAuthoringRuntimeImplementationSlice: false,
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
    capabilities: { ...AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };

  const plan = safeCloneGenericModel({ ...core, overallDigest: authoringPlanDigest(core) });

  const verification = verifyAuthoringImplementationPlan({ plan });
  const diagnostics = createAuthoringImplementationPlanDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...plan,
    verification,
    diagnostics,
    authoringImplementationPlanDigest: authoringPlanDigest({ overallDigest: plan.overallDigest, verification, diagnostics }),
  });
}

export default createStudioModuleBlueprintAuthoringImplementationPlan;
