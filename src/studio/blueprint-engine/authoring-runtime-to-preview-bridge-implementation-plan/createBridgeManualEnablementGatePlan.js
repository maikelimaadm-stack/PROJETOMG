import { REQUIRED_FUTURE_CHECKPOINT, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * MANUAL ENABLEMENT GATE PLAN. This slice authorizes the bridge IMPLEMENTATION PLAN only — NOT the bridge
 * contract (already certified), NOT a real bridge implementation, and nothing real (preview mount, UI,
 * App, persistence, backend, module generation, certification, product exposure, production). Pure.
 * @returns {Object}
 */
export function createBridgeManualEnablementGatePlan() {
  const core = {
    kind: 'bridge-manual-enablement-gate-plan',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'bridge_implementation_plan_only',
    authorizesBridgeContract: false,
    authorizesBridgeImplementationPlan: true,
    authorizesBridgeImplementation: false,
    authorizesPreviewMount: false,
    authorizesAuthoringUi: false,
    authorizesEditor: false,
    authorizesAppTouch: false,
    authorizesRouteMenu: false,
    authorizesPersistence: false,
    authorizesFilesystemWrites: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesModuleGeneration: false,
    authorizesCertification: false,
    authorizesProductExposure: false,
    authorizesProduction: false,
    authorizesRealData: false,
  };
  return safeCloneGenericModel({ ...core, manualEnablementGatePlanDigest: bridgePlanDigest(core) });
}

export default createBridgeManualEnablementGatePlan;
