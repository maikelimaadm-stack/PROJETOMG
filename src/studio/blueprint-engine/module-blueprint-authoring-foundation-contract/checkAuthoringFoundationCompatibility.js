import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  authoringFoundationDigest,
} from './authoringFoundationContractConfig.js';

/**
 * Checks compatibility of the foundation contract with its upstream certified blueprint contract,
 * blueprint engine, module reference planner and preview sandbox. Ready for the foundation contract
 * itself; NEVER authorizes a real authoring implementation plan/runtime/UI, permission/tenancy
 * integration, product exposure, module generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.certifiedBlueprint]
 * @returns {Object}
 */
export function checkAuthoringFoundationCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.certifiedBlueprint) ? o.certifiedBlueprint : {};
  const warnings = [];

  const declaredContractVersion = String(b.blueprintContractVersion ?? BLUEPRINT_CONTRACT_VERSION);
  const declaredEngineVersion = String(b.engineVersion ?? BLUEPRINT_ENGINE_VERSION);
  const compatibleWithBlueprintContract = declaredContractVersion === BLUEPRINT_CONTRACT_VERSION
    || b.kind === 'studio-blueprint-contract' || b.certified === true;
  const compatibleWithBlueprintEngine = declaredEngineVersion === BLUEPRINT_ENGINE_VERSION;
  const compatibleWithModuleReferencePlanner = String(b.moduleReferencePlannerVersion ?? MODULE_REFERENCE_PLANNER_VERSION) === MODULE_REFERENCE_PLANNER_VERSION;
  const compatibleWithPreviewSandbox = String(b.previewSandboxContractVersion ?? PREVIEW_SANDBOX_CONTRACT_VERSION) === PREVIEW_SANDBOX_CONTRACT_VERSION;

  if (!compatibleWithBlueprintContract) warnings.push('incompatible_blueprintContract');
  if (!compatibleWithBlueprintEngine) warnings.push('incompatible_blueprintEngine');
  if (!compatibleWithModuleReferencePlanner) warnings.push('incompatible_moduleReferencePlanner');
  if (!compatibleWithPreviewSandbox) warnings.push('incompatible_previewSandbox');
  if (b.certified === false) warnings.push('blueprint_not_certified');

  const ready = compatibleWithBlueprintContract && compatibleWithBlueprintEngine
    && compatibleWithModuleReferencePlanner && compatibleWithPreviewSandbox;

  const core = {
    kind: 'authoring-foundation-compatibility',
    compatibleWithBlueprintContract,
    compatibleWithBlueprintEngine,
    compatibleWithModuleReferencePlanner,
    compatibleWithPreviewSandbox,
    readyForAuthoringFoundationContract: ready,
    readyForAuthoringImplementationPlan: false,
    readyForAuthoringRuntime: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_authoring_implementation_plan_after_explicit_authorization',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: authoringFoundationDigest(core) });
}

export default checkAuthoringFoundationCompatibility;
