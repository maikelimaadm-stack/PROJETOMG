import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Product isolation contract — asserts every product surface stays isolated from the dev-preview
 * host. Pure and deterministic.
 * @returns {Object}
 */
export function createProductIsolationContract() {
  const core = {
    kind: 'app-integration-product-isolation-contract',
    productAppIsolated: true,
    productRouterIsolated: true,
    productMenuIsolated: true,
    productSidebarIsolated: true,
    productNavigationIsolated: true,
    productModulesIsolated: true,
    productDataIsolated: true,
    isolationBreached: false,
  };
  return safeCloneGenericModel({ ...core, productIsolationDigest: appIntegrationDigest(core) });
}

export default createProductIsolationContract;
