import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_MODE,
  MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
} from './modulePreviewSandboxConfig.js';

const READINESS = new Set([
  'module_preview_sandbox_contract_ready', 'ready_for_dev_preview_contract', 'needs_reference_plan_fix',
  'needs_blueprint_fix', 'needs_empresas_alignment', 'needs_registry', 'blocked', 'invalid', 'skipped',
]);

/**
 * Passive diagnostics for a preview sandbox run. Pure. Asserts headless/preview-only
 * invariants and never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createModulePreviewSandboxDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const st = (k) => (typeof o[k] === 'string' ? o[k] : 'unknown');

  let readiness = 'module_preview_sandbox_contract_ready';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_reference_plan_fix';

  return safeCloneGenericModel({
    kind: 'module-preview-sandbox-diagnostics',
    diagnosticId: typeof o.diagnosticId === 'string' ? o.diagnosticId : 'studio-module-preview-sandbox-contract',
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: MODULE_PREVIEW_SANDBOX_MODE,
    ...MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
    sessionStatus: st('sessionStatus'),
    tablePreviewStatus: st('tablePreviewStatus'),
    formPreviewStatus: st('formPreviewStatus'),
    detailPreviewStatus: st('detailPreviewStatus'),
    fieldPreviewStatus: st('fieldPreviewStatus'),
    actionPreviewStatus: st('actionPreviewStatus'),
    permissionPreviewStatus: st('permissionPreviewStatus'),
    routeMenuBlockedStatus: st('routeMenuBlockedStatus'),
    persistenceBlockedStatus: st('persistenceBlockedStatus'),
    runtimeBindingStatus: st('runtimeBindingStatus'),
    readinessDecisionStatus: st('readinessDecisionStatus'),
    compatibilityStatus: st('compatibilityStatus'),
    readyForPreviewSandbox: o.readyForPreviewSandbox === true,
    readyForDevPreviewContract: o.readyForDevPreviewContract === true,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createModulePreviewSandboxDiagnostics;
