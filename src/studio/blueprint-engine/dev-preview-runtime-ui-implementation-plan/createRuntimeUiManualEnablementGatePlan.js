import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans the manual enablement gate. A future real implementation slice requires a new enterprise
 * checkpoint. This slice authorizes nothing real. Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiManualEnablementGatePlan() {
  const core = {
    kind: 'runtime-ui-manual-enablement-gate-plan',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'plan_only',
    authorizesRealUi: false,
    authorizesRouteMenu: false,
    authorizesModuleGeneration: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesProduction: false,
    gateImplemented: false,
  };
  return safeCloneGenericModel({ ...core, manualGatePlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiManualEnablementGatePlan;
