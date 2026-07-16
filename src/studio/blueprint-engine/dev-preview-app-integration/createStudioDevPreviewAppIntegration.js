import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_NAME,
  APP_INTEGRATION_VERSION,
  APP_INTEGRATION_MODE,
  APP_INTEGRATION_CAPABILITIES,
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  STUDIO_DEV_PREVIEW_ROUTE_PATH,
  APP_INTEGRATION_READINESS_STATES,
  appIntegrationDigest,
} from './appIntegrationConfig.js';
import { createAppIntegrationSession } from './createAppIntegrationSession.js';
import { createStudioDevPreviewFeatureGate } from './createStudioDevPreviewFeatureGate.js';
import { createStudioDevPreviewCheckpointReceipt } from './createStudioDevPreviewCheckpointReceipt.js';
import { createAppIntegrationPreflight } from './createAppIntegrationPreflight.js';
import { createAppAttachmentDescriptor } from './createAppAttachmentDescriptor.js';
import { createLazyPreviewLoader } from './createLazyPreviewLoader.js';
import { createRuntimeUiMountRequest } from './createRuntimeUiMountRequest.js';
import { createFailureContainment } from './createFailureContainment.js';
import { createAppIntegrationRollback } from './createAppIntegrationRollback.js';
import { createAppIntegrationManifest } from './createAppIntegrationManifest.js';
import { verifyAppIntegration } from './verifyAppIntegration.js';
import { checkAppIntegrationCompatibility } from './checkAppIntegrationCompatibility.js';
import { createAppIntegrationDiagnostics } from './createAppIntegrationDiagnostics.js';
import { createAppIntegrationFallback } from './createAppIntegrationFallback.js';

/**
 * Composes the STUDIO DEV PREVIEW APP INTEGRATION from a Dev Preview Route/Menu runtime and an env
 * bag. Pure, deterministic, DEV-ONLY, DEFAULT-OFF, FAIL-CLOSED and SYNTHETIC-DATA-ONLY. It models the
 * minimal, additive integration of the isolated preview host into the main App: a single dev-only
 * route, gated behind a flag + checkpoint, lazy-loaded (stripped from the production bundle), mounting
 * ONLY the isolated host through explicit dependency injection. It exposes NO product menu/sidebar/
 * public route, creates NO new router, uses NO ReactDOM/createRoot/window/document, touches NO
 * backend/Prisma/real data, and NEVER relinks the old Studio prototype. On an invalid/missing/
 * fallback route-menu runtime it returns a safe fallback and never throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime]
 * @param {Record<string, unknown>} [options.env]
 * @param {string} [options.checkpointReceipt]
 * @returns {Object}
 */
export function createStudioDevPreviewAppIntegration(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const routeMenuRuntime = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : null;
  const env = isGenericModelPlainObject(o.env) ? o.env : {};

  if (!routeMenuRuntime
    || routeMenuRuntime.kind !== 'studio-dev-preview-route-menu'
    || routeMenuRuntime.fallback === true) {
    return createAppIntegrationFallback({
      reason: routeMenuRuntime ? 'invalid_or_fallback_route_menu_runtime' : 'invalid_or_missing_route_menu_runtime',
    });
  }

  const session = createAppIntegrationSession({ routeMenuRuntime });
  const featureGate = createStudioDevPreviewFeatureGate({ env });
  const checkpointReceipt = createStudioDevPreviewCheckpointReceipt({ checkpointReceipt: o.checkpointReceipt });
  const preflight = createAppIntegrationPreflight({ routeMenuRuntime, featureGate, checkpointReceipt });
  const appAttachment = createAppAttachmentDescriptor();
  const lazyPreviewLoader = createLazyPreviewLoader();
  const mountRequest = createRuntimeUiMountRequest({ preflight });
  const failureContainment = createFailureContainment();
  const rollback = createAppIntegrationRollback();

  const compatibility = checkAppIntegrationCompatibility({ routeMenuRuntime });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (appAttachment.routeExposedToProduct === true) blockers.push('app_integration_route_exposed_unsafe');
  if (appAttachment.menuExposedToProduct === true || appAttachment.sidebarExposedToProduct === true) blockers.push('app_integration_menu_exposed_unsafe');
  if (appAttachment.newRouterCreated === true) blockers.push('app_integration_new_router_unsafe');
  if (lazyPreviewLoader.eagerImportUsed === true) blockers.push('app_integration_eager_import_unsafe');
  if (lazyPreviewLoader.productionBundleContainsPreview === true) blockers.push('app_integration_production_bundle_unsafe');
  if (mountRequest.globalRootUsed === true) blockers.push('app_integration_global_mount_unsafe');
  if (featureGate.defaultEnabled === true) blockers.push('app_integration_feature_gate_default_on_unsafe');

  const parts = {
    session, featureGate, checkpointReceipt, appAttachment, lazyPreviewLoader, mountRequest,
    failureContainment, rollback,
  };
  const manifest = createAppIntegrationManifest({ parts });

  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_dev_preview_app_integration_ready' : 'blocked';

  const core = {
    kind: 'studio-dev-preview-app-integration',
    appIntegrationName: APP_INTEGRATION_NAME,
    appIntegrationVersion: APP_INTEGRATION_VERSION,
    appIntegrationContractVersion: APP_INTEGRATION_CONTRACT_VERSION,
    appIntegrationImplementationPlanVersion: APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
    routeMenuVersion: ROUTE_MENU_VERSION,
    runtimeUiVersion: RUNTIME_UI_VERSION,
    mode: APP_INTEGRATION_MODE,
    routePath: STUDIO_DEV_PREVIEW_ROUTE_PATH,
    moduleId: String(routeMenuRuntime.moduleId ?? 'plannedModule'),
    fallback: false,
    devOnly: true,
    defaultOff: true,
    isolated: true,
    failClosed: true,
    syntheticDataOnly: true,
    session,
    featureGate,
    checkpointReceipt,
    preflight,
    appAttachment,
    lazyPreviewLoader,
    mountRequest,
    failureContainment,
    rollback,
    compatibility,
    manifest,
    readiness: APP_INTEGRATION_READINESS_STATES.includes(readiness) ? readiness : 'blocked',
    readyForAppIntegration: ready,
    readyForProductExposure: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...APP_INTEGRATION_CAPABILITIES },
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: appIntegrationDigest(core) });

  const verification = verifyAppIntegration({ contract });
  const diagnostics = createAppIntegrationDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    appIntegrationDigest: appIntegrationDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewAppIntegration;
