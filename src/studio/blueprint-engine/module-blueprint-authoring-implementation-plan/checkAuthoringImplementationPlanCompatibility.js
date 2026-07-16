import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  authoringPlanDigest,
} from './authoringImplementationPlanConfig.js';

/**
 * Checks compatibility of the plan with its upstream authoring foundation contract, blueprint
 * contract/engine, module reference planner and preview sandbox. Ready for the plan itself; NEVER
 * authorizes a real runtime implementation slice, UI, permission/tenancy integration, product
 * exposure, module generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.authoringFoundationContract]
 * @returns {Object}
 */
export function checkAuthoringImplementationPlanCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.authoringFoundationContract) ? o.authoringFoundationContract : {};
  const warnings = [];

  const compatibleWithAuthoringFoundationContract = String(c.authoringFoundationContractVersion ?? '') === AUTHORING_FOUNDATION_CONTRACT_VERSION
    || c.kind === 'studio-module-blueprint-authoring-foundation-contract';
  const compatibleWithBlueprintContract = String(c.blueprintContractVersion ?? BLUEPRINT_CONTRACT_VERSION) === BLUEPRINT_CONTRACT_VERSION;
  const compatibleWithBlueprintEngine = String(c.blueprintEngineVersion ?? BLUEPRINT_ENGINE_VERSION) === BLUEPRINT_ENGINE_VERSION;
  const compatibleWithModuleReferencePlanner = String(c.moduleReferencePlannerVersion ?? MODULE_REFERENCE_PLANNER_VERSION) === MODULE_REFERENCE_PLANNER_VERSION;
  const compatibleWithPreviewSandbox = String(c.previewSandboxVersion ?? PREVIEW_SANDBOX_CONTRACT_VERSION) === PREVIEW_SANDBOX_CONTRACT_VERSION;

  if (!compatibleWithAuthoringFoundationContract) warnings.push('incompatible_authoringFoundationContract');
  if (!compatibleWithBlueprintContract) warnings.push('incompatible_blueprintContract');
  if (!compatibleWithBlueprintEngine) warnings.push('incompatible_blueprintEngine');
  if (!compatibleWithModuleReferencePlanner) warnings.push('incompatible_moduleReferencePlanner');
  if (!compatibleWithPreviewSandbox) warnings.push('incompatible_previewSandbox');
  if (c.readyForAuthoringFoundationContract === false) warnings.push('authoring_foundation_contract_not_ready');

  const core = {
    kind: 'authoring-implementation-plan-compatibility',
    compatibleWithAuthoringFoundationContract,
    compatibleWithBlueprintContract,
    compatibleWithBlueprintEngine,
    compatibleWithModuleReferencePlanner,
    compatibleWithPreviewSandbox,
    readyForAuthoringImplementationPlan: compatibleWithAuthoringFoundationContract && compatibleWithBlueprintContract && compatibleWithBlueprintEngine,
    readyForAuthoringRuntimeImplementationSlice: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_authoring_runtime_implementation_slice_after_enterprise_checkpoint',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: authoringPlanDigest(core) });
}

export default checkAuthoringImplementationPlanCompatibility;
