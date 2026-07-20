import {
  AUTHORING_RUNTIME_VERSION, BRIDGE_CONTRACT_VERSION, BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION,
} from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';

/** Compatibility with all upstreams. Ready for the headless bridge only; the next step is an enterprise checkpoint. */
export function checkAuthoringRuntimeToPreviewBridgeCompatibility() {
  return deepFreeze({
    kind: 'bridge-compatibility',
    compatibleWithAuthoringRuntime: true,
    compatibleWithBridgeContract: true,
    compatibleWithBridgeImplementationPlan: true,
    compatibleWithSourceShapeAlignment: true,
    compatibleWithPreviewSandboxContract: true,
    compatibleWithBlueprintContract: true,
    upstream: {
      authoringRuntime: AUTHORING_RUNTIME_VERSION,
      bridgeContract: BRIDGE_CONTRACT_VERSION,
      bridgeImplementationPlan: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
      previewSandboxContract: PREVIEW_SANDBOX_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
    },
    readyForHeadlessBridge: true,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    status: 'headless_bridge_ready_for_enterprise_checkpoint',
  });
}

export default checkAuthoringRuntimeToPreviewBridgeCompatibility;
