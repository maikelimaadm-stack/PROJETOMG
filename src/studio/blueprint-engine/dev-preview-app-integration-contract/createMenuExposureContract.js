import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Menu exposure contract — metadata only; asserts no menu/sidebar/navigation is exposed to the
 * product and no menu item is created. Pure and deterministic.
 * @returns {Object}
 */
export function createMenuExposureContract() {
  const core = {
    kind: 'app-integration-menu-exposure-contract',
    menuExposedToProduct: false,
    sidebarExposedToProduct: false,
    navigationExposedToProduct: false,
    menuItemCreated: false,
    futureExposure: 'dev_only_contract',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, menuExposureDigest: appIntegrationDigest(core) });
}

export default createMenuExposureContract;
