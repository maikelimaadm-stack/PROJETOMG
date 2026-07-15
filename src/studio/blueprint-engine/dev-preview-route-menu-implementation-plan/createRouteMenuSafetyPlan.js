import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Safety PLAN — every forbidden flag stays false; reversible by non-consumption. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRouteMenuSafetyPlan() {
  const forbiddenFlags = {
    routeImplemented: false,
    menuImplemented: false,
    appWiringImplemented: false,
    routerWiringImplemented: false,
    navigationWiringImplemented: false,
    sidebarWiringImplemented: false,
    deepLinkImplemented: false,
    runtimeUiMounted: false,
    routeCreated: false,
    menuCreated: false,
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
    kind: 'route-menu-safety-plan',
    headless: true,
    contractOnly: true,
    planOnly: true,
    failClosed: true,
    anyForbiddenSideEffect: Object.values(forbiddenFlags).some((v) => v === true),
    reversibleByNonConsumption: true,
    forbiddenFlags,
  };
  return safeCloneGenericModel({ ...core, safetyDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuSafetyPlan;
