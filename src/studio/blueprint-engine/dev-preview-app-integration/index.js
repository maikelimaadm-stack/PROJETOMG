/**
 * STUDIO DEV PREVIEW APP INTEGRATION — public surface (`.js` only; node --test safe).
 *
 * The `.js` graph never statically imports the sibling `.jsx` (those are the real React route
 * element + boundaries, referenced by name from `src/App.jsx` via a build-time-DEV-guarded lazy
 * import). Dev-only, default-off, fail-closed, synthetic-data-only. No `.tsx`, no `.css`.
 */

export {
  APP_INTEGRATION_NAME,
  APP_INTEGRATION_SEMVER,
  APP_INTEGRATION_VERSION,
  APP_INTEGRATION_MODE,
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  STUDIO_DEV_PREVIEW_ROUTE_PATH,
  STUDIO_DEV_PREVIEW_ROUTE_FLAG,
  STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG,
  REQUIRED_CHECKPOINT_RECEIPT,
  ISOLATED_HOST_SUBTREE,
  FORBIDDEN_PROTOTYPE_PATHS,
  APP_INTEGRATION_READINESS_STATES,
  APP_INTEGRATION_CAPABILITIES,
  appIntegrationDigest,
  resolveEnvironmentLabel,
  isDevelopmentEnvironment,
  isProductionOrStaging,
  shouldMountStudioDevPreviewRoute,
  isStudioDevPreviewRouteFlagEnabled,
  isStudioDevPreviewCheckpointApproved,
} from './appIntegrationConfig.js';

export {
  APP_INTEGRATION_ERROR_CODES,
  AppIntegrationError,
  createAppIntegrationError,
  appIntegrationError,
} from './errors.js';

export { createAppIntegrationSession } from './createAppIntegrationSession.js';
export { createStudioDevPreviewFeatureGate } from './createStudioDevPreviewFeatureGate.js';
export { createStudioDevPreviewCheckpointReceipt } from './createStudioDevPreviewCheckpointReceipt.js';
export { createAppIntegrationPreflight } from './createAppIntegrationPreflight.js';
export { createAppAttachmentDescriptor } from './createAppAttachmentDescriptor.js';
export { createLazyPreviewLoader } from './createLazyPreviewLoader.js';
export { createRuntimeUiMountRequest } from './createRuntimeUiMountRequest.js';
export { createFailureContainment } from './createFailureContainment.js';
export { createAppIntegrationRollback } from './createAppIntegrationRollback.js';
export { createAppIntegrationDiagnostics } from './createAppIntegrationDiagnostics.js';
export { createAppIntegrationManifest } from './createAppIntegrationManifest.js';
export { verifyAppIntegration } from './verifyAppIntegration.js';
export { checkAppIntegrationCompatibility } from './checkAppIntegrationCompatibility.js';
export { createAppIntegrationFallback } from './createAppIntegrationFallback.js';
export { createStudioDevPreviewAppIntegration } from './createStudioDevPreviewAppIntegration.js';

export { default } from './createStudioDevPreviewAppIntegration.js';
