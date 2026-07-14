import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Safety CONTRACT — every forbidden flag stays false; reversible by non-consumption. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createDevPreviewRouteMenuSafetyContract() {
  const forbiddenFlags = {
    routeCreated: false,
    menuCreated: false,
    appWiringCreated: false,
    routerWiringCreated: false,
    navigationWiringCreated: false,
    sidebarWiringCreated: false,
    deepLinkCreated: false,
    linkCreated: false,
    navLinkCreated: false,
    moduleGenerated: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    productionAccessed: false,
    stagingAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
    persistenceCreated: false,
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
    oldPrototypeImported: false,
  };
  const core = {
    kind: 'dev-preview-route-menu-safety-contract',
    headless: true,
    contractOnly: true,
    devOnly: true,
    failClosed: true,
    anyForbiddenSideEffect: Object.values(forbiddenFlags).some((v) => v === true),
    reversibleByNonConsumption: true,
    forbiddenFlags,
  };
  return safeCloneGenericModel({ ...core, safetyDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteMenuSafetyContract;
