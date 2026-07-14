import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_CONTRACT_NAME,
  ROUTE_MENU_CONTRACT_VERSION,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ROUTE_MENU_CONTRACT_CAPABILITIES,
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

/**
 * Builds the route/menu contract manifest with deterministic digests for every part. Pure — can
 * build standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUi]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createDevPreviewRouteMenuManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ui = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createRouteMenuContractSession({ runtimeUi: ui });
  const routeDescriptor = p.routeDescriptor ?? createDevPreviewRouteDescriptorContract({ runtimeUi: ui });
  const routeEligibility = p.routeEligibility ?? createDevPreviewRouteEligibilityContract();
  const routeGuard = p.routeGuard ?? createDevPreviewRouteGuardContract();
  const routeIsolation = p.routeIsolation ?? createDevPreviewRouteIsolationContract();
  const routeVisibility = p.routeVisibility ?? createDevPreviewRouteVisibilityContract();
  const routeAccessDecision = p.routeAccessDecision ?? createDevPreviewRouteAccessDecision({ env: {} });
  const menuPlacement = p.menuPlacement ?? createDevPreviewMenuPlacementContract({ runtimeUi: ui });
  const menuVisibility = p.menuVisibility ?? createDevPreviewMenuVisibilityContract();
  const menuEligibility = p.menuEligibility ?? createDevPreviewMenuEligibilityContract();
  const navigationBoundary = p.navigationBoundary ?? createDevPreviewNavigationBoundaryContract();
  const deepLinkBlocked = p.deepLinkBlocked ?? createDevPreviewDeepLinkBlockedContract();
  const appWiringBlocked = p.appWiringBlocked ?? createDevPreviewAppWiringBlockedContract();
  const manualGate = p.manualGate ?? createDevPreviewManualEnablementGateContract();
  const rolloutRollback = p.rolloutRollback ?? createDevPreviewRouteMenuRolloutRollbackContract();
  const safety = p.safety ?? createDevPreviewRouteMenuSafetyContract();
  const readiness = p.readiness ?? null;

  const parts = {
    session: session.sessionDigest,
    routeDescriptor: routeDescriptor.routeDescriptorDigest,
    routeEligibility: routeEligibility.routeEligibilityDigest,
    routeGuard: routeGuard.routeGuardDigest,
    routeIsolation: routeIsolation.routeIsolationDigest,
    routeVisibility: routeVisibility.routeVisibilityDigest,
    routeAccessDecision: routeAccessDecision.routeAccessDigest,
    menuPlacement: menuPlacement.menuPlacementDigest,
    menuVisibility: menuVisibility.menuVisibilityDigest,
    menuEligibility: menuEligibility.menuEligibilityDigest,
    navigationBoundary: navigationBoundary.navigationBoundaryDigest,
    deepLinkBlocked: deepLinkBlocked.deepLinkBlockedDigest,
    appWiringBlocked: appWiringBlocked.appWiringBlockedDigest,
    manualGate: manualGate.manualGateDigest,
    rolloutRollback: rolloutRollback.rolloutRollbackDigest,
    safety: safety.safetyDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
  };

  const core = {
    kind: 'dev-preview-route-menu-manifest',
    routeMenuContractName: ROUTE_MENU_CONTRACT_NAME,
    routeMenuContractVersion: ROUTE_MENU_CONTRACT_VERSION,
    upstream: {
      runtimeUi: RUNTIME_UI_VERSION,
      runtimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
    },
    parts,
    capabilities: { ...ROUTE_MENU_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteMenuManifest;
