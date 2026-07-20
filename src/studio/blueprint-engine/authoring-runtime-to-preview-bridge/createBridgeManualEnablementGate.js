import { SOURCE_CHECKPOINT, SOURCE_DECISION, REQUIRED_FUTURE_CHECKPOINT } from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * MANUAL ENABLEMENT GATE — this slice authorizes the HEADLESS bridge implementation only. It authorizes
 * NOTHING further (preview mount, UI, editor, App, route/menu, persistence, backend, module generation,
 * certification, product exposure, production, real data, permission/tenancy integration).
 */
export function createBridgeManualEnablementGate() {
  return deepFreeze({
    kind: 'bridge-manual-enablement-gate',
    manualGateRequired: true,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceDecision: SOURCE_DECISION,
    currentSliceAuthorization: 'headless_bridge_implementation_only',
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    authorizesBridgeImplementation: true,
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
    authorizesPermissionTenancyIntegration: false,
  });
}

export default createBridgeManualEnablementGate;
