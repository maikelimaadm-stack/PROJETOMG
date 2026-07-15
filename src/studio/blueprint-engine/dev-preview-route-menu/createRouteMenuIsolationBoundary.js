import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuConfig.js';

/**
 * Declares the isolation boundary the runtime proves. Every flag asserts a forbidden wiring / mount
 * / import / navigation stays off. Pure and deterministic.
 * @returns {Object}
 */
export function createRouteMenuIsolationBoundary() {
  const core = {
    kind: 'route-menu-isolation-boundary',
    appJsxTouched: false,
    mainRouterWired: false,
    productMenuWired: false,
    productSidebarWired: false,
    globalBrowserNavigation: false,
    browserRouteRegistered: false,
    publicUrlCreated: false,
    deepLinkImplemented: false,
    productionAccessed: false,
    stagingAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    realDataAccessed: false,
    oldPrototypeImported: false,
    reactRouterUsed: false,
    reactDomUsed: false,
    internalCreateRootUsed: false,
    windowUsed: false,
    documentUsed: false,
    historyUsed: false,
    locationUsed: false,
    autoMountOnImport: false,
    moduleGenerated: false,
    confinedToIsolatedHost: true,
    reversibleByNonConsumption: true,
  };
  return safeCloneGenericModel({ ...core, isolationBoundaryDigest: routeMenuDigest(core) });
}

export default createRouteMenuIsolationBoundary;
