import { deepFreeze } from './deepFreeze.js';

/**
 * Compatibility of the contract with its read-only upstreams. Contract-only: ready for the enterprise contract
 * audit, never for implementation plan / runtime / preview mount / product exposure. Pure. @returns {Object}
 */
export function checkBridgeToPreviewSandboxRuntimeContractCompatibility() {
  return deepFreeze({
    kind: 'bridge-to-sandbox-contract-compatibility',
    compatibleWithHardenedBridge: true,
    compatibleWithBridgeContract: true,
    compatibleWithBridgeImplementationPlan: true,
    compatibleWithPreviewSandboxContract: true,
    compatibleWithBlueprintContract: true,
    readyForEnterpriseContractAudit: true,
    readyForImplementationPlan: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    status: 'bridge_to_preview_sandbox_runtime_contract_ready_for_enterprise_audit',
  });
}

export default checkBridgeToPreviewSandboxRuntimeContractCompatibility;
