import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_NAME,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_MODE,
  ROUTE_MENU_CAPABILITIES,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
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
  routeMenuDigest,
} from './routeMenuConfig.js';
import { createRouteMenuSession } from './createRouteMenuSession.js';
import { createRouteMenuPreflight } from './createRouteMenuPreflight.js';
import { createRouteMenuContractLoader } from './createRouteMenuContractLoader.js';
import { createRouteMenuCheckpointReceipt } from './createRouteMenuCheckpointReceipt.js';
import { createDevOnlyFeatureGate } from './createDevOnlyFeatureGate.js';
import { createIsolatedRouteRegistry } from './createIsolatedRouteRegistry.js';
import { createIsolatedRouteResolver } from './createIsolatedRouteResolver.js';
import { createIsolatedMenuRegistry } from './createIsolatedMenuRegistry.js';
import { createIsolatedNavigationController } from './createIsolatedNavigationController.js';
import { createRouteGuard } from './createRouteGuard.js';
import { createMenuVisibilityDecision } from './createMenuVisibilityDecision.js';
import { createRuntimeUiMountRequest } from './createRuntimeUiMountRequest.js';
import { createRouteMenuReactHostTree } from './createRouteMenuReactHostTree.js';
import { createBlockedNavigationModel } from './createBlockedNavigationModel.js';
import { createRouteMenuIsolationBoundary } from './createRouteMenuIsolationBoundary.js';
import { createRouteMenuManifest } from './createRouteMenuManifest.js';
import { verifyRouteMenuRuntime } from './verifyRouteMenuRuntime.js';
import { checkRouteMenuRuntimeCompatibility } from './checkRouteMenuRuntimeCompatibility.js';
import { createRouteMenuDiagnostics } from './createRouteMenuDiagnostics.js';
import { createRouteMenuFallback } from './createRouteMenuFallback.js';

/**
 * Composes the STUDIO DEV PREVIEW ROUTE/MENU (isolated dev-only runtime) from a Dev Preview
 * Route/Menu Contract. Deterministic, DEV-ONLY, ISOLATED, DEFAULT-OFF and FAIL-CLOSED. It produces
 * the metadata contract of the isolated route/menu host (real renderable React lives in the sibling
 * `.jsx` files, referenced by name — never imported into this pure graph, never mounted here; the
 * mount adapter mounts only via injected `rootFactory`/`mountNode`). It creates NO App / product
 * router / product menu / sidebar wiring, NO browser route, NO public URL, NO deep link, and never
 * touches backend / Prisma / migration / network / production / staging, never mutates, never
 * persists, never reads/writes real data, never rewrites Empresas, and NEVER relinks the old Studio
 * prototype. On an invalid/missing/fallback route/menu contract it returns a safe fallback and never
 * throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract] a dev preview route/menu contract
 * @param {Object} [options.runtimeUi] optional dev preview runtime UI (for compatibility)
 * @param {Object} [options.implementationPlan] optional route/menu implementation plan (manual gate)
 * @param {boolean} [options.enabled] explicit feature flag (default false)
 * @param {string} [options.environment] explicit environment label (default 'unknown')
 * @param {string} [options.checkpointReceipt] explicit checkpoint receipt
 * @param {Object} [options.virtualFrame] synthetic virtual frame
 * @param {string} [options.initialPath] initial local path
 * @returns {Object} the isolated route/menu runtime contract
 */
export function createStudioDevPreviewRouteMenu(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const routeMenuContract = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : null;
  const runtimeUi = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : null;
  const implementationPlan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : null;
  const environment = String(o.environment ?? 'unknown');
  const enabled = o.enabled === true;
  const virtualFrame = isGenericModelPlainObject(o.virtualFrame) ? o.virtualFrame : { syntheticDataOnly: true };

  if (!routeMenuContract || routeMenuContract.kind !== 'studio-dev-preview-route-menu-contract' || routeMenuContract.fallback === true) {
    return createRouteMenuFallback({
      reason: routeMenuContract ? 'invalid_or_fallback_route_menu_contract' : 'invalid_or_missing_route_menu_contract',
    });
  }

  const session = createRouteMenuSession({ routeMenuContract });
  const preflight = createRouteMenuPreflight({ routeMenuContract, implementationPlan, runtimeUi, virtualFrame, enabled, environment, checkpointReceipt: o.checkpointReceipt });
  const contractLoader = createRouteMenuContractLoader({ routeMenuContract });
  const checkpointReceipt = createRouteMenuCheckpointReceipt({ checkpointReceipt: o.checkpointReceipt });
  const featureGate = createDevOnlyFeatureGate({ enabled, environment, checkpointReceipt: o.checkpointReceipt });
  const routeRegistry = createIsolatedRouteRegistry();
  const routeResolver = createIsolatedRouteResolver({ path: typeof o.initialPath === 'string' ? o.initialPath : undefined });
  const menuRegistry = createIsolatedMenuRegistry();
  const navigationController = createIsolatedNavigationController({ initialPath: o.initialPath }).descriptor;
  const routeGuard = createRouteGuard({ featureGate, environment, syntheticData: true });
  const menuVisibility = createMenuVisibilityDecision({ featureGate });
  const mountRequest = createRuntimeUiMountRequest({ featureGate, routeGuard, routeResolver, virtualFrame });
  const reactHostTree = createRouteMenuReactHostTree();
  const blockedNavigation = createBlockedNavigationModel();
  const isolationBoundary = createRouteMenuIsolationBoundary();

  const compatibility = checkRouteMenuRuntimeCompatibility({ routeMenuContract });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (isolationBoundary.appJsxTouched === true) blockers.push('route_menu_app_touched_unsafe');
  if (isolationBoundary.mainRouterWired === true) blockers.push('route_menu_main_router_unsafe');
  if (isolationBoundary.reactRouterUsed === true) blockers.push('route_menu_react_router_unsafe');
  if (isolationBoundary.autoMountOnImport === true) blockers.push('route_menu_auto_mount_unsafe');
  if (featureGate.featureFlagDefaultEnabled === true) blockers.push('route_menu_feature_flag_default_on_unsafe');
  if (mountRequest.globalRuntimeUiMounted === true) blockers.push('route_menu_global_mount_unsafe');
  if (blockedNavigation.anyAllowed === true) blockers.push('route_menu_blocked_navigation_unsafe');
  if (checkpointReceipt.approved !== true && enabled === true) warnings.push('checkpoint_not_approved');

  const parts = {
    session, preflight, contractLoader, checkpointReceipt, featureGate, routeRegistry, routeResolver,
    menuRegistry, navigationController, routeGuard, menuVisibility, mountRequest, reactHostTree,
    blockedNavigation, isolationBoundary,
  };
  const manifest = createRouteMenuManifest({ routeMenuContract, parts });

  const ready = blockers.length === 0;
  const core = {
    kind: 'studio-dev-preview-route-menu',
    routeMenuName: ROUTE_MENU_NAME,
    routeMenuVersion: ROUTE_MENU_VERSION,
    routeMenuImplementationPlanVersion: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    routeMenuContractVersion: ROUTE_MENU_CONTRACT_VERSION,
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
    mode: ROUTE_MENU_MODE,
    moduleId: String(routeMenuContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    preflight,
    contractLoader,
    checkpointReceipt,
    featureGate,
    routeRegistry,
    routeResolver,
    menuRegistry,
    navigationController,
    routeGuard,
    menuVisibility,
    mountRequest,
    reactHostTree,
    blockedNavigation,
    isolationBoundary,
    compatibility,
    manifest,
    readiness: ready ? 'studio_dev_preview_isolated_route_menu_runtime_ready' : 'blocked',
    readyForIsolatedRouteMenuRuntime: ready,
    readyForAppIntegration: false,
    readyForProductRouterIntegration: false,
    readyForProductMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...ROUTE_MENU_CAPABILITIES },
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: routeMenuDigest(core) });

  const verification = verifyRouteMenuRuntime({ contract });
  const diagnostics = createRouteMenuDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    routeMenuDigest: routeMenuDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewRouteMenu;
