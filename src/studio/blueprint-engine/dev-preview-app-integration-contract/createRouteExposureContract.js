import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Route exposure contract — metadata only; asserts no route is exposed to the product, no public
 * route or deep link is created, and browser navigation is not allowed. Pure and deterministic.
 * @returns {Object}
 */
export function createRouteExposureContract() {
  const core = {
    kind: 'app-integration-route-exposure-contract',
    routeExposedToProduct: false,
    publicRouteCreated: false,
    deepLinkCreated: false,
    browserNavigationAllowed: false,
    futureExposure: 'dev_only_contract',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, routeExposureDigest: appIntegrationDigest(core) });
}

export default createRouteExposureContract;
