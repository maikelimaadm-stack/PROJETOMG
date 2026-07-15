import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Manual enablement gate contract — a future real App integration requires an explicit enterprise
 * checkpoint. This slice authorizes NOTHING real. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationManualEnablementGateContract() {
  const core = {
    kind: 'app-integration-manual-enablement-gate-contract',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'contract_only',
    authorizesAppTouch: false,
    authorizesAppWiring: false,
    authorizesRouterWiring: false,
    authorizesRouteExposure: false,
    authorizesMenuExposure: false,
    authorizesRuntimeUiMount: false,
    authorizesProduction: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesRealData: false,
  };
  return safeCloneGenericModel({ ...core, manualEnablementGateDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationManualEnablementGateContract;
