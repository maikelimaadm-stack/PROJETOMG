/**
 * STUDIO DEV PREVIEW APP INTEGRATION IMPLEMENTATION PLAN — public surface.
 *
 * Headless, contract-only, metadata-only, plan-only. Exposes ONLY `.js` metadata plans. No
 * `.jsx`/`.tsx`/`.css`. Consumes the Dev Preview App Integration Contract; implements nothing;
 * touches no App.
 */

export {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_SEMVER,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_ENVIRONMENT,
  APP_INTEGRATION_CONTRACT_VERSION,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS,
  BLOCKED_INTEGRATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_READINESS_STATES,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  appIntegrationPlanDigest,
  isProductionEnv,
  isStudioDevPreviewAppIntegrationImplementationPlanEnabled,
  isStudioDevPreviewAppIntegrationImplementationPhasesEnabled,
  isStudioDevPreviewAppIntegrationImplementationVerifyEnabled,
  isStudioDevPreviewAppIntegrationImplementationCompatibilityCheckEnabled,
} from './appIntegrationImplementationPlanConfig.js';

export {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES,
  AppIntegrationImplementationPlanError,
  createAppIntegrationImplementationPlanError,
  appIntegrationImplementationPlanError,
} from './errors.js';

export { createAppIntegrationImplementationPlanSession } from './createAppIntegrationImplementationPlanSession.js';
export { createAppIntegrationImplementationPhases } from './createAppIntegrationImplementationPhases.js';
export { createAppTouchBoundaryPlan } from './createAppTouchBoundaryPlan.js';
export { createProductionUiGuardExtensionPlan } from './createProductionUiGuardExtensionPlan.js';
export { createFeatureFlagImplementationPlan } from './createFeatureFlagImplementationPlan.js';
export { createAppAttachmentImplementationPlan } from './createAppAttachmentImplementationPlan.js';
export { createRouterExposureImplementationPlan } from './createRouterExposureImplementationPlan.js';
export { createMenuSidebarExposureImplementationPlan } from './createMenuSidebarExposureImplementationPlan.js';
export { createRuntimeUiMountImplementationPlan } from './createRuntimeUiMountImplementationPlan.js';
export { createDependencyInjectionImplementationPlan } from './createDependencyInjectionImplementationPlan.js';
export { createLifecycleCleanupImplementationPlan } from './createLifecycleCleanupImplementationPlan.js';
export { createFailureContainmentImplementationPlan } from './createFailureContainmentImplementationPlan.js';
export { createProductionStagingFailClosedPlan } from './createProductionStagingFailClosedPlan.js';
export { createPrototypeRelinkStaticAssertionPlan } from './createPrototypeRelinkStaticAssertionPlan.js';
export { createAppIntegrationTestHarnessPlan } from './createAppIntegrationTestHarnessPlan.js';
export { createAppIntegrationManualEnablementGatePlan } from './createAppIntegrationManualEnablementGatePlan.js';
export { createAppIntegrationRolloutRollbackPlan } from './createAppIntegrationRolloutRollbackPlan.js';
export { createAppIntegrationObservabilityDiagnosticsPlan } from './createAppIntegrationObservabilityDiagnosticsPlan.js';
export { createAppIntegrationGovernanceRegistryPlan } from './createAppIntegrationGovernanceRegistryPlan.js';
export { createAppIntegrationSafetyPlan } from './createAppIntegrationSafetyPlan.js';
export { createAppIntegrationImplementationReadinessDecision } from './createAppIntegrationImplementationReadinessDecision.js';
export { createAppIntegrationImplementationPlanManifest } from './createAppIntegrationImplementationPlanManifest.js';
export { verifyAppIntegrationImplementationPlan } from './verifyAppIntegrationImplementationPlan.js';
export { checkAppIntegrationImplementationPlanCompatibility } from './checkAppIntegrationImplementationPlanCompatibility.js';
export { createAppIntegrationImplementationPlanDiagnostics } from './createAppIntegrationImplementationPlanDiagnostics.js';
export { createAppIntegrationImplementationPlanFallback } from './createAppIntegrationImplementationPlanFallback.js';
export { createStudioDevPreviewAppIntegrationImplementationPlan } from './createStudioDevPreviewAppIntegrationImplementationPlan.js';

export { default } from './createStudioDevPreviewAppIntegrationImplementationPlan.js';
