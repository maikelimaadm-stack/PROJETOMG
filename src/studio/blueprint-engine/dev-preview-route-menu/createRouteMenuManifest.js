import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_NAME,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
  RUNTIME_UI_VERSION,
  ROUTE_MENU_CAPABILITIES,
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

/**
 * Builds the route/menu manifest with deterministic digests for every part. Pure — can build
 * standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createRouteMenuManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createRouteMenuSession({ routeMenuContract: c });
  const preflight = p.preflight ?? createRouteMenuPreflight({ routeMenuContract: c });
  const contractLoader = p.contractLoader ?? createRouteMenuContractLoader({ routeMenuContract: c });
  const checkpointReceipt = p.checkpointReceipt ?? createRouteMenuCheckpointReceipt({});
  const featureGate = p.featureGate ?? createDevOnlyFeatureGate({});
  const routeRegistry = p.routeRegistry ?? createIsolatedRouteRegistry();
  const routeResolver = p.routeResolver ?? createIsolatedRouteResolver({});
  const menuRegistry = p.menuRegistry ?? createIsolatedMenuRegistry();
  const navigationController = p.navigationController ?? createIsolatedNavigationController({}).descriptor;
  const routeGuard = p.routeGuard ?? createRouteGuard({});
  const menuVisibility = p.menuVisibility ?? createMenuVisibilityDecision({});
  const mountRequest = p.mountRequest ?? createRuntimeUiMountRequest({});
  const reactHostTree = p.reactHostTree ?? createRouteMenuReactHostTree();
  const blockedNavigation = p.blockedNavigation ?? createBlockedNavigationModel();
  const isolationBoundary = p.isolationBoundary ?? createRouteMenuIsolationBoundary();

  const parts = {
    session: session.sessionDigest,
    preflight: preflight.preflightDigest,
    contractLoader: contractLoader.contractLoaderDigest,
    checkpointReceipt: checkpointReceipt.checkpointReceiptDigest,
    featureGate: featureGate.featureGateDigest,
    routeRegistry: routeRegistry.routeRegistryDigest,
    routeResolver: routeResolver.routeResolverDigest,
    menuRegistry: menuRegistry.menuRegistryDigest,
    navigationController: navigationController.navigationControllerDigest,
    routeGuard: routeGuard.routeGuardDigest,
    menuVisibility: menuVisibility.menuVisibilityDigest,
    mountRequest: mountRequest.mountRequestDigest,
    reactHostTree: reactHostTree.reactHostTreeDigest,
    blockedNavigation: blockedNavigation.blockedNavigationDigest,
    isolationBoundary: isolationBoundary.isolationBoundaryDigest,
  };

  const core = {
    kind: 'route-menu-manifest',
    routeMenuName: ROUTE_MENU_NAME,
    routeMenuVersion: ROUTE_MENU_VERSION,
    upstream: {
      routeMenuContract: ROUTE_MENU_CONTRACT_VERSION,
      runtimeUi: RUNTIME_UI_VERSION,
    },
    parts,
    capabilities: { ...ROUTE_MENU_CAPABILITIES },
  };
  return safeCloneGenericModel({ ...core, manifestDigest: routeMenuDigest(core) });
}

export default createRouteMenuManifest;
