/**
 * STUDIO DEV PREVIEW APP INTEGRATION CONTRACT — public surface.
 *
 * Headless, contract-only, metadata-only. Exposes ONLY `.js` metadata contracts. No `.jsx`/`.tsx`/
 * `.css`. Consumes the Dev Preview Route/Menu runtime; integrates nothing; touches no App.
 */

export {
  APP_INTEGRATION_CONTRACT_NAME,
  APP_INTEGRATION_CONTRACT_SEMVER,
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_CONTRACT_MODE,
  APP_INTEGRATION_CONTRACT_ENVIRONMENT,
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
  BLOCKED_INTEGRATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  APP_INTEGRATION_CONTRACT_READINESS_STATES,
  APP_INTEGRATION_CONTRACT_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_ATTACHMENT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_COMPATIBILITY_CHECK_FLAG,
  appIntegrationDigest,
  isProductionEnv,
  isStudioDevPreviewAppIntegrationContractEnabled,
  isStudioDevPreviewAppIntegrationAttachmentEnabled,
  isStudioDevPreviewAppIntegrationVerifyEnabled,
  isStudioDevPreviewAppIntegrationCompatibilityCheckEnabled,
} from './appIntegrationContractConfig.js';

export {
  APP_INTEGRATION_CONTRACT_ERROR_CODES,
  AppIntegrationContractError,
  createAppIntegrationContractError,
  appIntegrationContractError,
} from './errors.js';

export { createAppIntegrationContractSession } from './createAppIntegrationContractSession.js';
export { createAppAttachmentPointContract } from './createAppAttachmentPointContract.js';
export { createDevOnlyFeatureFlagContract } from './createDevOnlyFeatureFlagContract.js';
export { createProductIsolationContract } from './createProductIsolationContract.js';
export { createAppBootstrapBoundaryContract } from './createAppBootstrapBoundaryContract.js';
export { createRouterAttachmentContract } from './createRouterAttachmentContract.js';
export { createRouteExposureContract } from './createRouteExposureContract.js';
export { createMenuExposureContract } from './createMenuExposureContract.js';
export { createRuntimeUiMountAdapterContract } from './createRuntimeUiMountAdapterContract.js';
export { createDependencyInjectionBoundaryContract } from './createDependencyInjectionBoundaryContract.js';
export { createLifecycleCleanupContract } from './createLifecycleCleanupContract.js';
export { createFailureContainmentContract } from './createFailureContainmentContract.js';
export { createOwnershipRollbackContract } from './createOwnershipRollbackContract.js';
export { createProductionStagingDenialContract } from './createProductionStagingDenialContract.js';
export { createPrototypeRelinkProhibitionContract } from './createPrototypeRelinkProhibitionContract.js';
export { createAppIntegrationManualEnablementGateContract } from './createAppIntegrationManualEnablementGateContract.js';
export { createAppIntegrationSafetyContract } from './createAppIntegrationSafetyContract.js';
export { createAppIntegrationReadinessDecision } from './createAppIntegrationReadinessDecision.js';
export { createAppIntegrationManifest } from './createAppIntegrationManifest.js';
export { verifyAppIntegrationContract } from './verifyAppIntegrationContract.js';
export { checkAppIntegrationCompatibility } from './checkAppIntegrationCompatibility.js';
export { createAppIntegrationDiagnostics } from './createAppIntegrationDiagnostics.js';
export { createAppIntegrationFallback } from './createAppIntegrationFallback.js';
export { createStudioDevPreviewAppIntegrationContract } from './createStudioDevPreviewAppIntegrationContract.js';

export { default } from './createStudioDevPreviewAppIntegrationContract.js';
