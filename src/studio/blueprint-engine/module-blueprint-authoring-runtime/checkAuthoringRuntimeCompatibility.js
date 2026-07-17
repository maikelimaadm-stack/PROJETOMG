import {
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
} from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Checks compatibility of the runtime with its upstream implementation plan + foundation contract +
 * blueprint contract/engine + planner + preview sandbox. Ready for headless synthetic validation only.
 * @param {Object} [options] @returns {Object}
 */
export function checkAuthoringRuntimeCompatibility(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const p = isPlainObject(o.authoringImplementationPlan) ? o.authoringImplementationPlan : {};
  const warnings = [];

  const compatibleWithAuthoringImplementationPlan = String(p.authoringImplementationPlanVersion ?? '') === AUTHORING_IMPLEMENTATION_PLAN_VERSION
    || p.kind === 'studio-module-blueprint-authoring-implementation-plan';
  const compatibleWithAuthoringFoundationContract = String(p.authoringFoundationContractVersion ?? AUTHORING_FOUNDATION_CONTRACT_VERSION) === AUTHORING_FOUNDATION_CONTRACT_VERSION;
  const compatibleWithBlueprintContract = String(p.blueprintContractVersion ?? BLUEPRINT_CONTRACT_VERSION) === BLUEPRINT_CONTRACT_VERSION;
  const compatibleWithBlueprintEngine = String(p.blueprintEngineVersion ?? BLUEPRINT_ENGINE_VERSION) === BLUEPRINT_ENGINE_VERSION;
  const compatibleWithModuleReferencePlanner = String(p.moduleReferencePlannerVersion ?? MODULE_REFERENCE_PLANNER_VERSION) === MODULE_REFERENCE_PLANNER_VERSION;
  const compatibleWithPreviewSandbox = String(p.previewSandboxContractVersion ?? PREVIEW_SANDBOX_CONTRACT_VERSION) === PREVIEW_SANDBOX_CONTRACT_VERSION;

  if (!compatibleWithAuthoringImplementationPlan) warnings.push('incompatible_authoringImplementationPlan');
  if (!compatibleWithAuthoringFoundationContract) warnings.push('incompatible_authoringFoundationContract');
  if (!compatibleWithBlueprintContract) warnings.push('incompatible_blueprintContract');
  if (!compatibleWithBlueprintEngine) warnings.push('incompatible_blueprintEngine');
  if (!compatibleWithModuleReferencePlanner) warnings.push('incompatible_moduleReferencePlanner');
  if (!compatibleWithPreviewSandbox) warnings.push('incompatible_previewSandbox');

  const core = {
    kind: 'authoring-runtime-compatibility',
    compatibleWithAuthoringImplementationPlan,
    compatibleWithAuthoringFoundationContract,
    compatibleWithBlueprintContract,
    compatibleWithBlueprintEngine,
    compatibleWithModuleReferencePlanner,
    compatibleWithPreviewSandbox,
    readyForAuthoringRuntime: compatibleWithAuthoringImplementationPlan && compatibleWithAuthoringFoundationContract && compatibleWithBlueprintContract && compatibleWithBlueprintEngine,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'authoring_runtime_ready_for_headless_synthetic_validation_only',
    warnings,
    warningCount: warnings.length,
  };
  return Object.freeze({ ...core, compatibilityDigest: createDeterministicDigest(core) });
}

export default checkAuthoringRuntimeCompatibility;
