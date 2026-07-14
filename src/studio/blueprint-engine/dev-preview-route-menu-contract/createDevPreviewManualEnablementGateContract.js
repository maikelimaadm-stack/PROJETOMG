import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Manual enablement gate CONTRACT — a future real route/menu implementation slice requires a new
 * enterprise checkpoint. This slice authorizes nothing real. Pure and deterministic.
 * @returns {Object}
 */
export function createDevPreviewManualEnablementGateContract() {
  const core = {
    kind: 'dev-preview-manual-enablement-gate-contract',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'contract_only',
    authorizesRoute: false,
    authorizesMenu: false,
    authorizesAppWiring: false,
    authorizesRouterWiring: false,
    authorizesModuleGeneration: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesProduction: false,
  };
  return safeCloneGenericModel({ ...core, manualGateDigest: routeMenuDigest(core) });
}

export default createDevPreviewManualEnablementGateContract;
