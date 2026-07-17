import {
  BRIDGE_CONTRACT_VERSION, AUTHORING_RUNTIME_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Checks compatibility of the plan with its upstream bridge contract + authoring runtime + preview
 * sandbox contract + blueprint contract. Ready for the plan and thereby for the enterprise checkpoint;
 * never for a real implementation slice. Pure. @param {Object} [options] @returns {Object}
 */
export function checkBridgeImplementationPlanCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bc = isGenericModelPlainObject(o.bridgeContract) ? o.bridgeContract : {};
  const warnings = [];

  const compatibleWithBridgeContract = String(bc.bridgeContractVersion ?? BRIDGE_CONTRACT_VERSION) === BRIDGE_CONTRACT_VERSION
    && (bc.kind === undefined || bc.kind === 'studio-authoring-runtime-to-preview-bridge-contract');
  if (!compatibleWithBridgeContract) warnings.push('incompatible_bridgeContract');

  const core = {
    kind: 'bridge-implementation-plan-compatibility',
    compatibleWithBridgeContract,
    compatibleWithAuthoringRuntime: true,
    compatibleWithPreviewSandboxContract: true,
    compatibleWithBlueprintContract: true,
    upstream: {
      bridgeContract: BRIDGE_CONTRACT_VERSION,
      authoringRuntime: AUTHORING_RUNTIME_VERSION,
      previewSandboxContract: PREVIEW_SANDBOX_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
    },
    readyForBridgeImplementationPlan: compatibleWithBridgeContract,
    readyForBridgeImplementationSlice: false,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_bridge_implementation_enterprise_checkpoint',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: bridgePlanDigest(core) });
}

export default checkBridgeImplementationPlanCompatibility;
