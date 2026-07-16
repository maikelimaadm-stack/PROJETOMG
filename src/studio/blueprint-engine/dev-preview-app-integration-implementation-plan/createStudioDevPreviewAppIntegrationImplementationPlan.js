import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES,
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
  appIntegrationPlanDigest,
} from './appIntegrationImplementationPlanConfig.js';
import { createAppIntegrationImplementationPlanSession } from './createAppIntegrationImplementationPlanSession.js';
import { createAppIntegrationImplementationPhases } from './createAppIntegrationImplementationPhases.js';
import { createAppTouchBoundaryPlan } from './createAppTouchBoundaryPlan.js';
import { createProductionUiGuardExtensionPlan } from './createProductionUiGuardExtensionPlan.js';
import { createFeatureFlagImplementationPlan } from './createFeatureFlagImplementationPlan.js';
import { createAppAttachmentImplementationPlan } from './createAppAttachmentImplementationPlan.js';
import { createRouterExposureImplementationPlan } from './createRouterExposureImplementationPlan.js';
import { createMenuSidebarExposureImplementationPlan } from './createMenuSidebarExposureImplementationPlan.js';
import { createRuntimeUiMountImplementationPlan } from './createRuntimeUiMountImplementationPlan.js';
import { createDependencyInjectionImplementationPlan } from './createDependencyInjectionImplementationPlan.js';
import { createLifecycleCleanupImplementationPlan } from './createLifecycleCleanupImplementationPlan.js';
import { createFailureContainmentImplementationPlan } from './createFailureContainmentImplementationPlan.js';
import { createProductionStagingFailClosedPlan } from './createProductionStagingFailClosedPlan.js';
import { createPrototypeRelinkStaticAssertionPlan } from './createPrototypeRelinkStaticAssertionPlan.js';
import { createAppIntegrationTestHarnessPlan } from './createAppIntegrationTestHarnessPlan.js';
import { createAppIntegrationManualEnablementGatePlan } from './createAppIntegrationManualEnablementGatePlan.js';
import { createAppIntegrationRolloutRollbackPlan } from './createAppIntegrationRolloutRollbackPlan.js';
import { createAppIntegrationObservabilityDiagnosticsPlan } from './createAppIntegrationObservabilityDiagnosticsPlan.js';
import { createAppIntegrationGovernanceRegistryPlan } from './createAppIntegrationGovernanceRegistryPlan.js';
import { createAppIntegrationSafetyPlan } from './createAppIntegrationSafetyPlan.js';
import { createAppIntegrationImplementationReadinessDecision } from './createAppIntegrationImplementationReadinessDecision.js';
import { createAppIntegrationImplementationPlanManifest } from './createAppIntegrationImplementationPlanManifest.js';
import { verifyAppIntegrationImplementationPlan } from './verifyAppIntegrationImplementationPlan.js';
import { checkAppIntegrationImplementationPlanCompatibility } from './checkAppIntegrationImplementationPlanCompatibility.js';
import { createAppIntegrationImplementationPlanDiagnostics } from './createAppIntegrationImplementationPlanDiagnostics.js';
import { createAppIntegrationImplementationPlanFallback } from './createAppIntegrationImplementationPlanFallback.js';

/**
 * Composes the STUDIO DEV PREVIEW APP INTEGRATION IMPLEMENTATION PLAN from a Dev Preview App
 * Integration Contract. Pure, deterministic, HEADLESS, CONTRACT-ONLY, METADATA-ONLY and PLAN-ONLY.
 * Given the same contract it always returns the same object graph and digest.
 *
 * It plans a FUTURE controlled integration of the isolated dev-preview host with the real App as
 * pure metadata. It IMPLEMENTS NO integration. It creates NO App/router/menu/sidebar wiring, NO
 * route/menu exposure, NO Runtime UI mount in the App, NO feature flag connected to the App, NO
 * productionUiGuard extension, NO `Route`/`Routes`/`Link`/`NavLink`/`BrowserRouter`/
 * `createBrowserRouter`/`useNavigate`, NO `ReactDOM`/`createRoot`/`window`/`document`, NO public
 * deep link, NO module, and never touches backend/Prisma/migration/network/production/staging, never
 * mutates, never persists, never reads/writes real data, never rewrites Empresas, and NEVER relinks
 * the old Studio prototype. On an invalid/missing/fallback App integration contract it returns a safe
 * fallback and never throws. It authorizes NO App integration implementation slice.
 *
 * @param {Object} [options]
 * @param {Object} [options.appIntegrationContract] a dev preview app integration contract
 * @returns {Object} the app integration implementation plan
 */
export function createStudioDevPreviewAppIntegrationImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const appIntegrationContract = isGenericModelPlainObject(o.appIntegrationContract) ? o.appIntegrationContract : null;

  if (!appIntegrationContract
    || appIntegrationContract.kind !== 'studio-dev-preview-app-integration-contract'
    || appIntegrationContract.fallback === true) {
    return createAppIntegrationImplementationPlanFallback({
      reason: appIntegrationContract ? 'invalid_or_fallback_app_integration_contract' : 'invalid_or_missing_app_integration_contract',
    });
  }

  const session = createAppIntegrationImplementationPlanSession({ appIntegrationContract });
  const phases = createAppIntegrationImplementationPhases();
  const appTouchBoundary = createAppTouchBoundaryPlan();
  const productionUiGuardExtension = createProductionUiGuardExtensionPlan();
  const featureFlag = createFeatureFlagImplementationPlan();
  const appAttachment = createAppAttachmentImplementationPlan({ appIntegrationContract });
  const routerExposure = createRouterExposureImplementationPlan();
  const menuSidebarExposure = createMenuSidebarExposureImplementationPlan();
  const runtimeUiMount = createRuntimeUiMountImplementationPlan();
  const dependencyInjection = createDependencyInjectionImplementationPlan();
  const lifecycleCleanup = createLifecycleCleanupImplementationPlan();
  const failureContainment = createFailureContainmentImplementationPlan();
  const productionStagingFailClosed = createProductionStagingFailClosedPlan();
  const prototypeRelinkStaticAssertion = createPrototypeRelinkStaticAssertionPlan();
  const testHarness = createAppIntegrationTestHarnessPlan();
  const manualGate = createAppIntegrationManualEnablementGatePlan();
  const rolloutRollback = createAppIntegrationRolloutRollbackPlan();
  const observability = createAppIntegrationObservabilityDiagnosticsPlan();
  const governanceRegistry = createAppIntegrationGovernanceRegistryPlan();
  const safety = createAppIntegrationSafetyPlan();

  const compatibility = checkAppIntegrationImplementationPlanCompatibility({ appIntegrationContract });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (appTouchBoundary.appTouched === true) blockers.push('app_integration_plan_app_touched_unsafe');
  if (appTouchBoundary.appWiringImplemented === true) blockers.push('app_integration_plan_app_wiring_unsafe');
  if (productionUiGuardExtension.productionUiGuardExtended === true) blockers.push('app_integration_plan_production_ui_guard_unsafe');
  if (featureFlag.featureFlagConnectedToApp === true) blockers.push('app_integration_plan_feature_flag_connected_unsafe');
  if (routerExposure.routeExposedToProduct === true) blockers.push('app_integration_plan_route_exposed_unsafe');
  if (menuSidebarExposure.menuExposedToProduct === true) blockers.push('app_integration_plan_menu_exposed_unsafe');
  if (runtimeUiMount.runtimeUiMountedInApp === true) blockers.push('app_integration_plan_runtime_ui_mounted_unsafe');
  if (safety.anyForbiddenSideEffect === true) blockers.push('app_integration_plan_safety_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('app_integration_plan_manual_gate_missing');
  if (prototypeRelinkStaticAssertion.prototypeRelinkAllowed === true) blockers.push('app_integration_plan_prototype_relink_unsafe');

  const readiness = createAppIntegrationImplementationReadinessDecision({ blockers, warnings });

  const parts = {
    session, phases, appTouchBoundary, productionUiGuardExtension, featureFlag, appAttachment,
    routerExposure, menuSidebarExposure, runtimeUiMount, dependencyInjection, lifecycleCleanup,
    failureContainment, productionStagingFailClosed, prototypeRelinkStaticAssertion, testHarness,
    manualGate, rolloutRollback, observability, governanceRegistry, safety, readiness,
  };
  const manifest = createAppIntegrationImplementationPlanManifest({ appIntegrationContract, parts });

  const core = {
    kind: 'studio-dev-preview-app-integration-implementation-plan',
    appIntegrationImplementationPlanName: APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
    appIntegrationImplementationPlanVersion: APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
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
    mode: APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
    moduleId: String(appIntegrationContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    phases,
    appTouchBoundary,
    productionUiGuardExtension,
    featureFlag,
    appAttachment,
    routerExposure,
    menuSidebarExposure,
    runtimeUiMount,
    dependencyInjection,
    lifecycleCleanup,
    failureContainment,
    productionStagingFailClosed,
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
    readyForAppIntegrationImplementationPlan: readiness.readyForAppIntegrationImplementationPlan === true,
    readyForAppIntegrationImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };

  const plan = safeCloneGenericModel({ ...core, overallDigest: appIntegrationPlanDigest(core) });

  const verification = verifyAppIntegrationImplementationPlan({ plan });
  const diagnostics = createAppIntegrationImplementationPlanDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...plan,
    verification,
    diagnostics,
    appIntegrationImplementationPlanDigest: appIntegrationPlanDigest({ overallDigest: plan.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewAppIntegrationImplementationPlan;
