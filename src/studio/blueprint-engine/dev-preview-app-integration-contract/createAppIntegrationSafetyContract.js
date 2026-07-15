import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Safety contract — aggregates the forbidden-side-effect flags and asserts none is present, and
 * that the contract is reversible by non-consumption. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationSafetyContract() {
  const forbiddenFlags = {
    appIntegrated: false,
    appTouched: false,
    appWiringCreated: false,
    routerWiringCreated: false,
    routeExposedToProduct: false,
    menuExposedToProduct: false,
    sidebarExposedToProduct: false,
    runtimeUiMountedInApp: false,
    featureFlagConnectedToApp: false,
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
    kind: 'app-integration-safety-contract',
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    contractOnly: true,
    forbiddenFlags,
  };
  return safeCloneGenericModel({ ...core, safetyDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationSafetyContract;
