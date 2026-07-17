import { REQUIRED_FUTURE_CHECKPOINT, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the MANUAL ENABLEMENT GATE. This slice authorizes the bridge CONTRACT and a future bridge
 * IMPLEMENTATION PLAN only — nothing real (no bridge implementation, preview mount, UI, App, persistence,
 * backend, module generation, certification, product exposure, production). Pure. @returns {Object}
 */
export function createBridgeManualEnablementGateContract() {
  const core = {
    kind: 'bridge-manual-enablement-gate-contract',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'bridge_contract_only',
    authorizesBridgeContract: true,
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
  return safeCloneGenericModel({ ...core, manualEnablementGateContractDigest: bridgeDigest(core) });
}

export default createBridgeManualEnablementGateContract;
