import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Router attachment contract — metadata only; asserts no router is touched and no router primitive
 * or API is used. Pure and deterministic.
 * @returns {Object}
 */
export function createRouterAttachmentContract() {
  const core = {
    kind: 'app-integration-router-attachment-contract',
    routerTouched: false,
    routerAttachmentCreated: false,
    routeRegistered: false,
    browserRouterUsed: false,
    createBrowserRouterUsed: false,
    useNavigateUsed: false,
    futureAttachment: 'dev_only_contract',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, routerAttachmentDigest: appIntegrationDigest(core) });
}

export default createRouterAttachmentContract;
