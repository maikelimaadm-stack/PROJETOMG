import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_MODE,
  MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
} from './moduleReferencePlannerConfig.js';

const READINESS = new Set(['module_reference_plan_ready', 'ready_for_preview_sandbox', 'needs_blueprint_fix', 'needs_empresas_alignment', 'needs_registry', 'blocked', 'invalid', 'skipped']);

/**
 * Passive diagnostics for a planner run. Pure. Asserts headless/contract-only invariants
 * and never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createModuleReferencePlannerDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const st = (k) => (typeof o[k] === 'string' ? o[k] : 'unknown');

  let readiness = 'module_reference_plan_ready';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_blueprint_fix';

  return safeCloneGenericModel({
    kind: 'module-reference-planner-diagnostics',
    diagnosticId: typeof o.diagnosticId === 'string' ? o.diagnosticId : 'studio-blueprint-module-reference-planner',
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: MODULE_REFERENCE_PLANNER_MODE,
    ...MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
    identityPlanStatus: st('identityPlanStatus'),
    filePlanStatus: st('filePlanStatus'),
    screenPlanStatus: st('screenPlanStatus'),
    fieldTableFormPlanStatus: st('fieldTableFormPlanStatus'),
    permissionPlanStatus: st('permissionPlanStatus'),
    routeMenuPlanStatus: st('routeMenuPlanStatus'),
    persistencePlanStatus: st('persistencePlanStatus'),
    runtimeBindingPlanStatus: st('runtimeBindingPlanStatus'),
    testGatePlanStatus: st('testGatePlanStatus'),
    evidencePlanStatus: st('evidencePlanStatus'),
    riskPlanStatus: st('riskPlanStatus'),
    readinessDecisionStatus: st('readinessDecisionStatus'),
    compatibilityStatus: st('compatibilityStatus'),
    readyForPreviewSandbox: o.readyForPreviewSandbox === true,
    readyForRealModuleGeneration: false,
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createModuleReferencePlannerDiagnostics;
