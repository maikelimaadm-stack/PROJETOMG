/**
 * STUDIO MODULE BLUEPRINT AUTHORING IMPLEMENTATION PLAN — public surface.
 *
 * Headless, contract-only, metadata-only and plan-only. Exposes ONLY `.js` metadata plans. No
 * `.jsx`/`.tsx`/`.css`. Consumes the Studio Module Blueprint Authoring Foundation Contract read-only;
 * implements nothing; exposes nothing to the product. The certified blueprint remains the canonical
 * SSOT; the authoring draft is temporary and non-canonical and can never self-certify.
 */

export {
  AUTHORING_IMPLEMENTATION_PLAN_NAME,
  AUTHORING_IMPLEMENTATION_PLAN_SEMVER,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_MODE,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  AUTHORING_IMPLEMENTATION_PHASE_IDS,
  AUTHORING_OPERATION_IDS,
  AUTHORING_LIFECYCLE_STATES,
  FORBIDDEN_LIFECYCLE_STATES,
  VALIDATION_PIPELINE_STAGES,
  AUTHORING_INVARIANT_IDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  AUTHORING_IMPLEMENTATION_PLAN_READINESS_STATES,
  AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  authoringPlanDigest,
  isProductionEnv,
  isStudioModuleBlueprintAuthoringImplementationPlanEnabled,
  isStudioModuleBlueprintAuthoringImplementationPhasesEnabled,
  isStudioModuleBlueprintAuthoringImplementationVerifyEnabled,
  isStudioModuleBlueprintAuthoringImplementationCompatibilityCheckEnabled,
} from './authoringImplementationPlanConfig.js';

export {
  AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES,
  AuthoringImplementationPlanError,
  createAuthoringImplementationPlanError,
  authoringImplementationPlanError,
} from './errors.js';

export { createAuthoringImplementationPlanSession } from './createAuthoringImplementationPlanSession.js';
export { createAuthoringImplementationPhases } from './createAuthoringImplementationPhases.js';
export { createDraftRuntimePlan } from './createDraftRuntimePlan.js';
export { createLifecycleRuntimePlan } from './createLifecycleRuntimePlan.js';
export { createOperationExecutorPlan } from './createOperationExecutorPlan.js';
export { createRevisionEnginePlan } from './createRevisionEnginePlan.js';
export { createValidationPipelinePlan } from './createValidationPipelinePlan.js';
export { createInvariantEnforcementPlan } from './createInvariantEnforcementPlan.js';
export { createSyntheticPreviewHandoffPlan } from './createSyntheticPreviewHandoffPlan.js';
export { createCertificationCandidatePreparationPlan } from './createCertificationCandidatePreparationPlan.js';
export { createSsotProtectionPlan } from './createSsotProtectionPlan.js';
export { createPermissionTenancyBoundaryPlan } from './createPermissionTenancyBoundaryPlan.js';
export { createPersistenceProhibitionPlan } from './createPersistenceProhibitionPlan.js';
export { createModuleGenerationProhibitionPlan } from './createModuleGenerationProhibitionPlan.js';
export { createPrototypeRelinkStaticAssertionPlan } from './createPrototypeRelinkStaticAssertionPlan.js';
export { createAuthoringTestHarnessPlan } from './createAuthoringTestHarnessPlan.js';
export { createAuthoringManualEnablementGatePlan } from './createAuthoringManualEnablementGatePlan.js';
export { createAuthoringRolloutRollbackPlan } from './createAuthoringRolloutRollbackPlan.js';
export { createAuthoringObservabilityDiagnosticsPlan } from './createAuthoringObservabilityDiagnosticsPlan.js';
export { createAuthoringGovernanceRegistryPlan } from './createAuthoringGovernanceRegistryPlan.js';
export { createAuthoringImplementationSafetyPlan } from './createAuthoringImplementationSafetyPlan.js';
export { createAuthoringImplementationReadinessDecision } from './createAuthoringImplementationReadinessDecision.js';
export { createAuthoringImplementationPlanManifest } from './createAuthoringImplementationPlanManifest.js';
export { verifyAuthoringImplementationPlan } from './verifyAuthoringImplementationPlan.js';
export { checkAuthoringImplementationPlanCompatibility } from './checkAuthoringImplementationPlanCompatibility.js';
export { createAuthoringImplementationPlanDiagnostics } from './createAuthoringImplementationPlanDiagnostics.js';
export { createAuthoringImplementationPlanFallback } from './createAuthoringImplementationPlanFallback.js';
export { createStudioModuleBlueprintAuthoringImplementationPlan } from './createStudioModuleBlueprintAuthoringImplementationPlan.js';

export { default } from './createStudioModuleBlueprintAuthoringImplementationPlan.js';
