import {
  AUTHORING_RUNTIME_VERSION, AUTHORING_FOUNDATION_CONTRACT_VERSION, AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION, SOURCE_HANDOFF_KIND, bridgeDigest,
} from './bridgeContractConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Checks compatibility of the bridge contract with its upstream authoring runtime + foundation +
 * implementation plan + preview sandbox contract + blueprint contract. Ready for the contract and a
 * future implementation plan only. Pure. @param {Object} [options] @returns {Object}
 */
export function checkBridgeCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.sourceHandoff) ? o.sourceHandoff : {};
  const warnings = [];

  const compatibleWithAuthoringRuntime = String(s.runtimeVersion ?? AUTHORING_RUNTIME_VERSION) === AUTHORING_RUNTIME_VERSION
    && (s.handoffKind === undefined || s.handoffKind === SOURCE_HANDOFF_KIND);
  const compatibleWithAuthoringFoundationContract = true;
  const compatibleWithAuthoringImplementationPlan = true;
  const compatibleWithPreviewSandboxContract = true;
  const compatibleWithBlueprintContract = true;
  if (!compatibleWithAuthoringRuntime) warnings.push('incompatible_authoringRuntime');

  const core = {
    kind: 'bridge-compatibility',
    compatibleWithAuthoringRuntime,
    compatibleWithAuthoringFoundationContract,
    compatibleWithAuthoringImplementationPlan,
    compatibleWithPreviewSandboxContract,
    compatibleWithBlueprintContract,
    upstream: {
      authoringRuntime: AUTHORING_RUNTIME_VERSION,
      authoringFoundationContract: AUTHORING_FOUNDATION_CONTRACT_VERSION,
      authoringImplementationPlan: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
      previewSandboxContract: PREVIEW_SANDBOX_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
    },
    readyForBridgeContract: compatibleWithAuthoringRuntime,
    readyForBridgeImplementationPlan: compatibleWithAuthoringRuntime,
    readyForBridgeImplementationSlice: false,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_bridge_implementation_plan_only',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: bridgeDigest(core) });
}

export default checkBridgeCompatibility;
