import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_CONTRACT_NAME,
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_CONTRACT_MODE,
  ROUTE_MENU_CONTRACT_CAPABILITIES,
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
} from './routeMenuContractConfig.js';
import { createRouteMenuContractSession } from './createRouteMenuContractSession.js';
import { createDevPreviewRouteDescriptorContract } from './createDevPreviewRouteDescriptorContract.js';
import { createDevPreviewRouteEligibilityContract } from './createDevPreviewRouteEligibilityContract.js';
import { createDevPreviewRouteGuardContract } from './createDevPreviewRouteGuardContract.js';
import { createDevPreviewRouteIsolationContract } from './createDevPreviewRouteIsolationContract.js';
import { createDevPreviewRouteVisibilityContract } from './createDevPreviewRouteVisibilityContract.js';
import { createDevPreviewRouteAccessDecision } from './createDevPreviewRouteAccessDecision.js';
import { createDevPreviewMenuPlacementContract } from './createDevPreviewMenuPlacementContract.js';
import { createDevPreviewMenuVisibilityContract } from './createDevPreviewMenuVisibilityContract.js';
import { createDevPreviewMenuEligibilityContract } from './createDevPreviewMenuEligibilityContract.js';
import { createDevPreviewNavigationBoundaryContract } from './createDevPreviewNavigationBoundaryContract.js';
import { createDevPreviewDeepLinkBlockedContract } from './createDevPreviewDeepLinkBlockedContract.js';
import { createDevPreviewAppWiringBlockedContract } from './createDevPreviewAppWiringBlockedContract.js';
import { createDevPreviewManualEnablementGateContract } from './createDevPreviewManualEnablementGateContract.js';
import { createDevPreviewRouteMenuRolloutRollbackContract } from './createDevPreviewRouteMenuRolloutRollbackContract.js';
import { createDevPreviewRouteMenuSafetyContract } from './createDevPreviewRouteMenuSafetyContract.js';
import { createDevPreviewRouteMenuReadinessDecision } from './createDevPreviewRouteMenuReadinessDecision.js';
import { createDevPreviewRouteMenuManifest } from './createDevPreviewRouteMenuManifest.js';
import { verifyDevPreviewRouteMenuContract } from './verifyDevPreviewRouteMenuContract.js';
import { checkDevPreviewRouteMenuCompatibility } from './checkDevPreviewRouteMenuCompatibility.js';
import { createDevPreviewRouteMenuDiagnostics } from './createDevPreviewRouteMenuDiagnostics.js';
import { createDevPreviewRouteMenuFallback } from './createDevPreviewRouteMenuFallback.js';

/**
 * Composes the STUDIO DEV PREVIEW ROUTE/MENU CONTRACT from a Dev Preview Runtime UI. Pure,
 * deterministic, HEADLESS and CONTRACT-ONLY. Given the same runtime UI it always returns the same
 * object graph and digest.
 *
 * It produces the deterministic CONTRACT for a future controlled route/menu integration as pure
 * metadata. It creates NO real route / menu / router, NO App/router/navigation/sidebar wiring, NO
 * `Route`/`Routes`/`NavLink`/`Link`/`BrowserRouter`/`createBrowserRouter`/`useNavigate`, NO deep
 * link, NO module, and never touches backend / Prisma / migration / network / production /
 * staging, never mutates, never persists, never reads/writes real data, never rewrites Empresas,
 * and NEVER imports the old Studio prototype. On an invalid/missing/fallback runtime UI it returns
 * a safe fallback and never throws. It authorizes NO route/menu implementation and NO App
 * integration.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUi] a dev preview runtime UI
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} the route/menu contract
 */
export function createStudioDevPreviewRouteMenuContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const runtimeUi = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : null;
  const env = isGenericModelPlainObject(o.env) ? o.env : {};

  if (!runtimeUi || runtimeUi.kind !== 'studio-dev-preview-runtime-ui' || runtimeUi.fallback === true) {
    return createDevPreviewRouteMenuFallback({
      reason: runtimeUi ? 'invalid_or_fallback_runtime_ui' : 'invalid_or_missing_runtime_ui',
    });
  }

  const session = createRouteMenuContractSession({ runtimeUi });
  const routeDescriptor = createDevPreviewRouteDescriptorContract({ runtimeUi });
  const routeEligibility = createDevPreviewRouteEligibilityContract();
  const routeGuard = createDevPreviewRouteGuardContract();
  const routeIsolation = createDevPreviewRouteIsolationContract();
  const routeVisibility = createDevPreviewRouteVisibilityContract();
  const routeAccessDecision = createDevPreviewRouteAccessDecision({ env });
  const menuPlacement = createDevPreviewMenuPlacementContract({ runtimeUi });
  const menuVisibility = createDevPreviewMenuVisibilityContract();
  const menuEligibility = createDevPreviewMenuEligibilityContract();
  const navigationBoundary = createDevPreviewNavigationBoundaryContract();
  const deepLinkBlocked = createDevPreviewDeepLinkBlockedContract();
  const appWiringBlocked = createDevPreviewAppWiringBlockedContract();
  const manualGate = createDevPreviewManualEnablementGateContract();
  const rolloutRollback = createDevPreviewRouteMenuRolloutRollbackContract();
  const safety = createDevPreviewRouteMenuSafetyContract();

  const compatibility = checkDevPreviewRouteMenuCompatibility({ runtimeUi });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (routeDescriptor.routeCreated === true) blockers.push('route_menu_contract_route_created_unsafe');
  if (menuPlacement.menuCreated === true) blockers.push('route_menu_contract_menu_created_unsafe');
  if (navigationBoundary.anyAllowed === true) blockers.push('route_menu_contract_navigation_unsafe');
  if (deepLinkBlocked.deepLinkCreated === true) blockers.push('route_menu_contract_deep_link_unsafe');
  if (appWiringBlocked.wiringAllowed === true) blockers.push('route_menu_contract_wiring_unsafe');
  if (safety.anyForbiddenSideEffect === true) blockers.push('route_menu_contract_safety_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('route_menu_contract_manual_gate_missing');
  if (routeIsolation.noPrototypeRelink !== true) blockers.push('route_menu_contract_prototype_relink_unsafe');

  const readiness = createDevPreviewRouteMenuReadinessDecision({ blockers, warnings });

  const parts = {
    session, routeDescriptor, routeEligibility, routeGuard, routeIsolation, routeVisibility,
    routeAccessDecision, menuPlacement, menuVisibility, menuEligibility, navigationBoundary,
    deepLinkBlocked, appWiringBlocked, manualGate, rolloutRollback, safety, readiness,
  };
  const manifest = createDevPreviewRouteMenuManifest({ runtimeUi, parts });

  const core = {
    kind: 'studio-dev-preview-route-menu-contract',
    routeMenuContractName: ROUTE_MENU_CONTRACT_NAME,
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
    mode: ROUTE_MENU_CONTRACT_MODE,
    moduleId: String(runtimeUi.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    routeDescriptor,
    routeEligibility,
    routeGuard,
    routeIsolation,
    routeVisibility,
    routeAccessDecision,
    menuPlacement,
    menuVisibility,
    menuEligibility,
    navigationBoundary,
    deepLinkBlocked,
    appWiringBlocked,
    manualGate,
    rolloutRollback,
    safety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForRouteMenuContract: readiness.readyForRouteMenuContract === true,
    readyForRouteMenuImplementation: false,
    readyForAppIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...ROUTE_MENU_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: routeMenuDigest(core) });

  const verification = verifyDevPreviewRouteMenuContract({ contract });
  const diagnostics = createDevPreviewRouteMenuDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    routeMenuContractDigest: routeMenuDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewRouteMenuContract;
