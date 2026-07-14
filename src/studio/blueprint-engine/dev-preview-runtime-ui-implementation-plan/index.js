/**
 * STUDIO DEV PREVIEW RUNTIME UI IMPLEMENTATION PLAN — public surface (headless / plan-only).
 *
 * Despite the name, this subtree IMPLEMENTS NO UI. It consumes a Dev Preview Runtime UI Contract
 * and produces the deterministic PLAN for a future UI runtime implementation — implementation
 * phases, UI runtime boundary plan, dev-only execution policy, virtual-frame-to-UI pipeline plan,
 * renderer / component / interaction / state / theme / accessibility adapter plans, blocked-action
 * enforcement plan, test harness plan, manual enablement gate plan, rollout/rollback plan and
 * observability/diagnostics plan. It is pure metadata: it renders NO UI, creates NO React
 * component / `.jsx` / `.tsx` / `.css` / DOM / runtime CSS, wires NO route / placement, generates
 * NO module, implements NO UI runtime, and never touches backend / Prisma / migration / network /
 * production / staging, never mutates, never persists, never reads/writes real data, never
 * rewrites Empresas. Nothing here is auto-consumed by the app; it is reversible by
 * non-consumption. It authorizes NO UI runtime implementation and NO route/placement integration.
 */

export {
  RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
  RUNTIME_UI_IMPLEMENTATION_PLAN_SEMVER,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
  RUNTIME_UI_IMPLEMENTATION_PLAN_ENVIRONMENT,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PHASE_IDS,
  VIRTUAL_FRAME_TO_UI_PIPELINE_STEPS,
  BLOCKED_ACTION_KINDS,
  RUNTIME_UI_IMPLEMENTATION_PLAN_READINESS_STATES,
  REQUIRED_FUTURE_CHECKPOINT,
  RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  uiPlanDigest,
  isStudioDevPreviewRuntimeUiImplementationPlanEnabled,
  isStudioDevPreviewRuntimeUiImplementationPhasesEnabled,
  isStudioDevPreviewRuntimeUiImplementationVerifyEnabled,
  isStudioDevPreviewRuntimeUiImplementationCompatibilityCheckEnabled,
} from './runtimeUiImplementationPlanConfig.js';

export {
  RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES,
  RuntimeUiImplementationPlanError,
  createRuntimeUiImplementationPlanError,
  runtimeUiImplementationPlanError,
} from './errors.js';

export { createRuntimeUiImplementationPlanSession } from './createRuntimeUiImplementationPlanSession.js';
export { createRuntimeUiImplementationPhases } from './createRuntimeUiImplementationPhases.js';
export { createRuntimeUiBoundaryPlan } from './createRuntimeUiBoundaryPlan.js';
export { createRuntimeUiDevOnlyExecutionPolicy } from './createRuntimeUiDevOnlyExecutionPolicy.js';
export { createVirtualFrameToUiPipelinePlan } from './createVirtualFrameToUiPipelinePlan.js';
export { createRuntimeUiRendererAdapterPlan } from './createRuntimeUiRendererAdapterPlan.js';
export { createRuntimeUiComponentAdapterPlan } from './createRuntimeUiComponentAdapterPlan.js';
export { createRuntimeUiInteractionAdapterPlan } from './createRuntimeUiInteractionAdapterPlan.js';
export { createRuntimeUiStateAdapterPlan } from './createRuntimeUiStateAdapterPlan.js';
export { createRuntimeUiThemeAdapterPlan } from './createRuntimeUiThemeAdapterPlan.js';
export { createRuntimeUiAccessibilityAdapterPlan } from './createRuntimeUiAccessibilityAdapterPlan.js';
export { createRuntimeUiBlockedActionEnforcementPlan } from './createRuntimeUiBlockedActionEnforcementPlan.js';
export { createRuntimeUiTestHarnessPlan } from './createRuntimeUiTestHarnessPlan.js';
export { createRuntimeUiManualEnablementGatePlan } from './createRuntimeUiManualEnablementGatePlan.js';
export { createRuntimeUiRolloutRollbackPlan } from './createRuntimeUiRolloutRollbackPlan.js';
export { createRuntimeUiObservabilityDiagnosticsPlan } from './createRuntimeUiObservabilityDiagnosticsPlan.js';
export { createRuntimeUiSafetyPlan } from './createRuntimeUiSafetyPlan.js';
export { createRuntimeUiImplementationReadinessDecision } from './createRuntimeUiImplementationReadinessDecision.js';
export { createRuntimeUiImplementationPlanManifest } from './createRuntimeUiImplementationPlanManifest.js';
export { verifyRuntimeUiImplementationPlan } from './verifyRuntimeUiImplementationPlan.js';
export { checkRuntimeUiImplementationPlanCompatibility } from './checkRuntimeUiImplementationPlanCompatibility.js';
export { createRuntimeUiImplementationPlanDiagnostics } from './createRuntimeUiImplementationPlanDiagnostics.js';
export { createRuntimeUiImplementationPlanFallback } from './createRuntimeUiImplementationPlanFallback.js';
export { createStudioDevPreviewRuntimeUiImplementationPlan } from './createStudioDevPreviewRuntimeUiImplementationPlan.js';

export { default } from './createStudioDevPreviewRuntimeUiImplementationPlan.js';
