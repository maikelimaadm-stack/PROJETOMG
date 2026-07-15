import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Manual enablement gate PLAN — a future real route/menu implementation slice requires a new
 * enterprise checkpoint. This slice authorizes nothing real. Pure and deterministic.
 * @returns {Object}
 */
export function createRouteMenuManualEnablementGatePlan() {
  const core = {
    kind: 'route-menu-manual-enablement-gate-plan',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'plan_only',
    authorizesRoute: false,
    authorizesMenu: false,
    authorizesAppWiring: false,
    authorizesRouterWiring: false,
    authorizesNavigationWiring: false,
    authorizesSidebarWiring: false,
    authorizesRuntimeUiMount: false,
    authorizesModuleGeneration: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesProduction: false,
  };
  return safeCloneGenericModel({ ...core, manualGateDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuManualEnablementGatePlan;
