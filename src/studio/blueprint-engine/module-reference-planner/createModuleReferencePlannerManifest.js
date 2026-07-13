import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_REFERENCE_PLANNER_NAME,
  MODULE_REFERENCE_PLANNER_VERSION,
  MODULE_REFERENCE_PLANNER_MODE,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
  plannerDigest,
} from './moduleReferencePlannerConfig.js';

/**
 * Builds the planner manifest, aggregating every plan digest into an `overallDigest`.
 * Pure. Readiness `module_reference_plan_ready` when there are no blockers; `blocked`
 * otherwise. `readyForRealModuleGeneration` is always false.
 *
 * @param {Object} [options]
 * @returns {Object} manifest descriptor
 */
export function createModuleReferencePlannerManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const get = (obj, key) => (isGenericModelPlainObject(obj) ? obj[key] : undefined) ?? null;

  const digests = {
    sourceBlueprintDigest: typeof o.sourceBlueprintDigest === 'string' ? o.sourceBlueprintDigest : null,
    identityPlanDigest: get(o.identityPlan, 'identityPlanDigest'),
    filePlanDigest: get(o.filePlan, 'filePlanDigest'),
    screenPlanDigest: get(o.screenPlan, 'screenPlanDigest'),
    fieldTableFormPlanDigest: get(o.fieldTableFormPlan, 'fieldTableFormPlanDigest'),
    permissionPlanDigest: get(o.permissionPlan, 'permissionPlanDigest'),
    routeMenuPlanDigest: get(o.routeMenuPlan, 'routeMenuPlanDigest'),
    persistencePlanDigest: get(o.persistencePlan, 'persistencePlanDigest'),
    runtimeBindingPlanDigest: get(o.runtimeBindingPlan, 'runtimeBindingPlanDigest'),
    testGatePlanDigest: get(o.testGatePlan, 'testGatePlanDigest'),
    evidencePlanDigest: get(o.evidencePlan, 'evidencePlanDigest'),
    riskPlanDigest: get(o.riskPlan, 'riskPlanDigest'),
    readinessDecisionDigest: get(o.readinessDecision, 'readinessDecisionDigest'),
  };

  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];

  const readyForPreviewSandbox = get(o.readinessDecision, 'readyForPreviewSandbox') === true;
  const readiness = blockers.length === 0 ? 'module_reference_plan_ready' : 'blocked';
  const overallDigest = plannerDigest({ ...digests, readiness });

  return safeCloneGenericModel({
    kind: 'module-reference-planner-manifest',
    manifestId: `${MODULE_REFERENCE_PLANNER_NAME}@${MODULE_REFERENCE_PLANNER_VERSION.split('@')[1]}#manifest`,
    plannerName: MODULE_REFERENCE_PLANNER_NAME,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: MODULE_REFERENCE_PLANNER_MODE,
    moduleId: get(o.identityPlan, 'moduleId'),
    ...digests,
    overallDigest,
    ...MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
    readyForPreviewSandbox,
    readyForRealModuleGeneration: false,
    blockers,
    warnings,
    readiness,
    nextSteps: 'studio-module-preview-sandbox-contract',
  });
}

export default createModuleReferencePlannerManifest;
