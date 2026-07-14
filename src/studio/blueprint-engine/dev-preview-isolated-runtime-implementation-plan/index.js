/**
 * STUDIO DEV PREVIEW ISOLATED RUNTIME IMPLEMENTATION PLAN — public surface (headless /
 * contract-only).
 *
 * Despite the word "implementation" in its name, this subtree implements NO runtime. It
 * consumes a Dev Preview Runtime Shell Contract and produces a deterministic PLAN for a future
 * isolated dev-preview runtime implementation — phases, boundaries, dev-only execution policy,
 * adapter/render/lifecycle/event/data/permission/test/rollout/observability plans. It is pure
 * metadata: it renders NO UI, creates NO React component / `.jsx` / `.tsx` / `.css` / DOM /
 * runtime CSS, wires NO route / menu, generates NO module, implements NO runtime, writes NO
 * file under `src/modules`, and never touches backend / Prisma / migration / network /
 * production / staging, never mutates, never persists, never rewrites Empresas. Nothing here is
 * auto-consumed by the app; it is reversible by non-consumption. It authorizes NO runtime
 * implementation — only a future, separately-approved slice may.
 */

export {
  IMPLEMENTATION_PLAN_NAME,
  IMPLEMENTATION_PLAN_SEMVER,
  IMPLEMENTATION_PLAN_VERSION,
  IMPLEMENTATION_PLAN_MODE,
  IMPLEMENTATION_PLAN_ENVIRONMENT,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  IMPLEMENTATION_PHASE_IDS,
  LIFECYCLE_EXECUTION_STEPS,
  EVENT_HANDLING_KINDS,
  RENDER_PIPELINE_STEPS,
  TEST_HARNESS_FIXTURE_KINDS,
  IMPLEMENTATION_PLAN_READINESS_STATES,
  IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_IRIP_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_IRIP_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_IRIP_COMPATIBILITY_CHECK_FLAG,
  planDigest,
  isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled,
  isStudioDevPreviewIripPhasesEnabled,
  isStudioDevPreviewIripVerifyEnabled,
  isStudioDevPreviewIripCompatibilityCheckEnabled,
} from './isolatedRuntimeImplementationPlanConfig.js';

export {
  IMPLEMENTATION_PLAN_ERROR_CODES,
  IsolatedRuntimeImplementationPlanError,
  createIsolatedRuntimeImplementationPlanError,
  isolatedRuntimeImplementationPlanError,
} from './errors.js';

export { createIsolatedRuntimeImplementationPlanSession } from './createIsolatedRuntimeImplementationPlanSession.js';
export { createIsolatedRuntimeImplementationPhases } from './createIsolatedRuntimeImplementationPhases.js';
export { createIsolatedRuntimeBoundaryPlan } from './createIsolatedRuntimeBoundaryPlan.js';
export { createIsolatedRuntimeDevOnlyExecutionPolicy } from './createIsolatedRuntimeDevOnlyExecutionPolicy.js';
export { createIsolatedRuntimeAdapterPlan } from './createIsolatedRuntimeAdapterPlan.js';
export { createIsolatedRuntimeRenderPipelinePlan } from './createIsolatedRuntimeRenderPipelinePlan.js';
export { createIsolatedRuntimeLifecycleExecutionPlan } from './createIsolatedRuntimeLifecycleExecutionPlan.js';
export { createIsolatedRuntimeEventHandlingPlan } from './createIsolatedRuntimeEventHandlingPlan.js';
export { createIsolatedRuntimeDataAccessBlockedPlan } from './createIsolatedRuntimeDataAccessBlockedPlan.js';
export { createIsolatedRuntimePermissionEnforcementPlan } from './createIsolatedRuntimePermissionEnforcementPlan.js';
export { createIsolatedRuntimeTestHarnessPlan } from './createIsolatedRuntimeTestHarnessPlan.js';
export { createIsolatedRuntimeRolloutRollbackPlan } from './createIsolatedRuntimeRolloutRollbackPlan.js';
export { createIsolatedRuntimeObservabilityDiagnosticsPlan } from './createIsolatedRuntimeObservabilityDiagnosticsPlan.js';
export { createIsolatedRuntimeRouteBlockedPlan } from './createIsolatedRuntimeRouteBlockedPlan.js';
export { createIsolatedRuntimePlacementBlockedPlan } from './createIsolatedRuntimePlacementBlockedPlan.js';
export { createIsolatedRuntimeSafetyPlan } from './createIsolatedRuntimeSafetyPlan.js';
export { createIsolatedRuntimeReadinessDecision } from './createIsolatedRuntimeReadinessDecision.js';
export { createIsolatedRuntimeImplementationPlanManifest } from './createIsolatedRuntimeImplementationPlanManifest.js';
export { verifyIsolatedRuntimeImplementationPlan } from './verifyIsolatedRuntimeImplementationPlan.js';
export { checkIsolatedRuntimeImplementationPlanCompatibility } from './checkIsolatedRuntimeImplementationPlanCompatibility.js';
export { createIsolatedRuntimeImplementationPlanDiagnostics } from './createIsolatedRuntimeImplementationPlanDiagnostics.js';
export { createIsolatedRuntimeImplementationPlanFallback } from './createIsolatedRuntimeImplementationPlanFallback.js';
export { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from './createStudioDevPreviewIsolatedRuntimeImplementationPlan.js';

export { default } from './createStudioDevPreviewIsolatedRuntimeImplementationPlan.js';
