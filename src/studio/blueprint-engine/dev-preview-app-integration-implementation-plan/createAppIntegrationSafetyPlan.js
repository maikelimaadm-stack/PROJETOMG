import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Safety PLAN — aggregates the forbidden-side-effect flags and asserts none is present, and that the
 * plan is reversible by non-consumption. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationSafetyPlan() {
  const forbiddenFlags = {
    appIntegrated: false,
    appTouched: false,
    appWiringImplemented: false,
    productionUiGuardExtended: false,
    featureFlagImplemented: false,
    featureFlagConnectedToApp: false,
    routerWiringImplemented: false,
    routeExposedToProduct: false,
    menuExposedToProduct: false,
    sidebarExposedToProduct: false,
    runtimeUiMountedInApp: false,
    reactDomUsed: false,
    createRootUsed: false,
    windowUsed: false,
    documentUsed: false,
    deepLinkCreated: false,
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
  const anyForbiddenSideEffect = Object.values(forbiddenFlags).some((v) => v === true);

  const core = {
    kind: 'app-integration-safety-plan',
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    planOnly: true,
    forbiddenFlags,
  };
  return safeCloneGenericModel({ ...core, safetyPlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationSafetyPlan;
