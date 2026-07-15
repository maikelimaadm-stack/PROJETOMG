import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_CONTRACT_NAME,
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_CONTRACT_MODE,
  APP_INTEGRATION_CONTRACT_CAPABILITIES,
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
  appIntegrationDigest,
} from './appIntegrationContractConfig.js';
import { createAppIntegrationContractSession } from './createAppIntegrationContractSession.js';
import { createAppAttachmentPointContract } from './createAppAttachmentPointContract.js';
import { createDevOnlyFeatureFlagContract } from './createDevOnlyFeatureFlagContract.js';
import { createProductIsolationContract } from './createProductIsolationContract.js';
import { createAppBootstrapBoundaryContract } from './createAppBootstrapBoundaryContract.js';
import { createRouterAttachmentContract } from './createRouterAttachmentContract.js';
import { createRouteExposureContract } from './createRouteExposureContract.js';
import { createMenuExposureContract } from './createMenuExposureContract.js';
import { createRuntimeUiMountAdapterContract } from './createRuntimeUiMountAdapterContract.js';
import { createDependencyInjectionBoundaryContract } from './createDependencyInjectionBoundaryContract.js';
import { createLifecycleCleanupContract } from './createLifecycleCleanupContract.js';
import { createFailureContainmentContract } from './createFailureContainmentContract.js';
import { createOwnershipRollbackContract } from './createOwnershipRollbackContract.js';
import { createProductionStagingDenialContract } from './createProductionStagingDenialContract.js';
import { createPrototypeRelinkProhibitionContract } from './createPrototypeRelinkProhibitionContract.js';
import { createAppIntegrationManualEnablementGateContract } from './createAppIntegrationManualEnablementGateContract.js';
import { createAppIntegrationSafetyContract } from './createAppIntegrationSafetyContract.js';
import { createAppIntegrationReadinessDecision } from './createAppIntegrationReadinessDecision.js';
import { createAppIntegrationManifest } from './createAppIntegrationManifest.js';
import { verifyAppIntegrationContract } from './verifyAppIntegrationContract.js';
import { checkAppIntegrationCompatibility } from './checkAppIntegrationCompatibility.js';
import { createAppIntegrationDiagnostics } from './createAppIntegrationDiagnostics.js';
import { createAppIntegrationFallback } from './createAppIntegrationFallback.js';

/**
 * Composes the STUDIO DEV PREVIEW APP INTEGRATION CONTRACT from a Dev Preview Route/Menu runtime.
 * Pure, deterministic, HEADLESS, CONTRACT-ONLY and METADATA-ONLY. Given the same route/menu runtime
 * it always returns the same object graph and digest.
 *
 * It describes — as pure metadata — how a FUTURE, separately-approved slice would attach the
 * isolated dev-preview host to the real App. It INTEGRATES NOTHING. It creates NO App/router/menu/
 * sidebar wiring, NO route/menu exposure, NO Runtime UI mount in the App, NO feature flag connected
 * to the App, NO `Route`/`Routes`/`Link`/`NavLink`/`BrowserRouter`/`createBrowserRouter`/
 * `useNavigate`, NO `ReactDOM`/`createRoot`/`window`/`document`, NO public deep link, NO module, and
 * never touches backend/Prisma/migration/network/production/staging, never mutates, never persists,
 * never reads/writes real data, never rewrites Empresas, and NEVER relinks the old Studio prototype.
 * On an invalid/missing/fallback route/menu runtime it returns a safe fallback and never throws. It
 * authorizes NO App integration.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime] a dev preview route/menu runtime
 * @returns {Object} the App integration contract
 */
export function createStudioDevPreviewAppIntegrationContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const routeMenuRuntime = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : null;

  if (!routeMenuRuntime
    || routeMenuRuntime.kind !== 'studio-dev-preview-route-menu'
    || routeMenuRuntime.fallback === true) {
    return createAppIntegrationFallback({
      reason: routeMenuRuntime ? 'invalid_or_fallback_route_menu_runtime' : 'invalid_or_missing_route_menu_runtime',
    });
  }

  const session = createAppIntegrationContractSession({ routeMenuRuntime });
  const attachmentPoint = createAppAttachmentPointContract({ routeMenuRuntime });
  const featureFlag = createDevOnlyFeatureFlagContract();
  const productIsolation = createProductIsolationContract();
  const bootstrapBoundary = createAppBootstrapBoundaryContract();
  const routerAttachment = createRouterAttachmentContract();
  const routeExposure = createRouteExposureContract();
  const menuExposure = createMenuExposureContract();
  const runtimeUiMountAdapter = createRuntimeUiMountAdapterContract();
  const dependencyInjectionBoundary = createDependencyInjectionBoundaryContract();
  const lifecycleCleanup = createLifecycleCleanupContract();
  const failureContainment = createFailureContainmentContract();
  const ownershipRollback = createOwnershipRollbackContract();
  const productionStagingDenial = createProductionStagingDenialContract();
  const prototypeRelinkProhibition = createPrototypeRelinkProhibitionContract();
  const manualGate = createAppIntegrationManualEnablementGateContract();
  const safety = createAppIntegrationSafetyContract();

  const compatibility = checkAppIntegrationCompatibility({ routeMenuRuntime });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (attachmentPoint.appTouched === true) blockers.push('app_integration_app_touched_unsafe');
  if (routerAttachment.routerTouched === true) blockers.push('app_integration_router_touched_unsafe');
  if (routeExposure.routeExposedToProduct === true) blockers.push('app_integration_route_exposed_unsafe');
  if (menuExposure.menuExposedToProduct === true) blockers.push('app_integration_menu_exposed_unsafe');
  if (runtimeUiMountAdapter.runtimeUiMountedInApp === true) blockers.push('app_integration_runtime_ui_mounted_unsafe');
  if (featureFlag.connectedToApp === true) blockers.push('app_integration_feature_flag_connected_unsafe');
  if (safety.anyForbiddenSideEffect === true) blockers.push('app_integration_safety_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('app_integration_manual_gate_missing');
  if (prototypeRelinkProhibition.prototypeRelinkAllowed === true) blockers.push('app_integration_prototype_relink_unsafe');

  const readiness = createAppIntegrationReadinessDecision({ blockers, warnings });

  const parts = {
    session, attachmentPoint, featureFlag, productIsolation, bootstrapBoundary, routerAttachment,
    routeExposure, menuExposure, runtimeUiMountAdapter, dependencyInjectionBoundary, lifecycleCleanup,
    failureContainment, ownershipRollback, productionStagingDenial, prototypeRelinkProhibition,
    manualGate, safety, readiness,
  };
  const manifest = createAppIntegrationManifest({ routeMenuRuntime, parts });

  const core = {
    kind: 'studio-dev-preview-app-integration-contract',
    appIntegrationContractName: APP_INTEGRATION_CONTRACT_NAME,
    appIntegrationContractVersion: APP_INTEGRATION_CONTRACT_VERSION,
    routeMenuVersion: ROUTE_MENU_VERSION,
    routeMenuContractVersion: ROUTE_MENU_CONTRACT_VERSION,
    routeMenuImplementationPlanVersion: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    runtimeUiVersion: RUNTIME_UI_VERSION,
    runtimeUiContractVersion: RUNTIME_UI_CONTRACT_VERSION,
    isolatedRuntimeVersion: ISOLATED_RUNTIME_VERSION,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: APP_INTEGRATION_CONTRACT_MODE,
    moduleId: String(routeMenuRuntime.moduleId ?? 'plannedModule'),
    fallback: false,
    headless: true,
    contractOnly: true,
    metadataOnly: true,
    appIntegrationContractOnly: true,
    devOnly: true,
    isolated: true,
    session,
    attachmentPoint,
    featureFlag,
    productIsolation,
    bootstrapBoundary,
    routerAttachment,
    routeExposure,
    menuExposure,
    runtimeUiMountAdapter,
    dependencyInjectionBoundary,
    lifecycleCleanup,
    failureContainment,
    ownershipRollback,
    productionStagingDenial,
    prototypeRelinkProhibition,
    manualGate,
    safety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForAppIntegrationContract: readiness.readyForAppIntegrationContract === true,
    readyForAppIntegrationImplementationPlan: false,
    readyForAppIntegrationImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...APP_INTEGRATION_CONTRACT_CAPABILITIES },
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: appIntegrationDigest(core) });

  const verification = verifyAppIntegrationContract({ contract });
  const diagnostics = createAppIntegrationDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    appIntegrationContractDigest: appIntegrationDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewAppIntegrationContract;
