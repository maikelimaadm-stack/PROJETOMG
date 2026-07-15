import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Manual enablement gate PLAN — a future real App integration implementation slice requires an
 * explicit enterprise checkpoint. This slice authorizes NOTHING real. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationManualEnablementGatePlan() {
  const core = {
    kind: 'app-integration-manual-enablement-gate-plan',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'plan_only',
    authorizesAppTouch: false,
    authorizesAppWiring: false,
    authorizesRouterWiring: false,
    authorizesRouteExposure: false,
    authorizesMenuExposure: false,
    authorizesRuntimeUiMount: false,
    authorizesProductionUiGuardExtension: false,
    authorizesProduction: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesRealData: false,
  };
  return safeCloneGenericModel({ ...core, manualEnablementGatePlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationManualEnablementGatePlan;
