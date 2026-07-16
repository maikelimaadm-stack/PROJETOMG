import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Router exposure implementation PLAN — metadata only; asserts no router is wired and no router
 * primitive/API is used, and no route is exposed to the product. Pure and deterministic.
 * @returns {Object}
 */
export function createRouterExposureImplementationPlan() {
  const core = {
    kind: 'app-integration-router-exposure-implementation-plan',
    routerWiringImplemented: false,
    routeExposedToProduct: false,
    routeElementCreated: false,
    routesElementCreated: false,
    browserRouterUsed: false,
    createBrowserRouterUsed: false,
    useNavigateUsed: false,
    futureExposure: 'dev_only_plan',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, routerExposureImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createRouterExposureImplementationPlan;
