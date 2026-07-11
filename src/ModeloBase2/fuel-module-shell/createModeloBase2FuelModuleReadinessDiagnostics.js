import { isGenericModelPlainObject, safeCloneGenericModel, GENERIC_MODEL_DANGEROUS_CAPABILITIES } from '../../runtime/generic-model/index.js';
import {
  FUEL_MODULE_SHELL_MODULE_ID,
  FUEL_DOMAIN,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
} from './modeloBase2FuelModuleShellConfig.js';

const READINESS = new Set(['ready_for_beta_shell', 'blocked', 'partial', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the fuel module shell readiness. Pure; React-free.
 * Asserts the no-registration / no-side-effect invariants and reports readiness.
 *
 * @param {Object} [options]
 * @param {string} [options.readinessId]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.enabled]
 * @param {Object} [options.uiComposition]
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object} diagnostics
 */
export function createModeloBase2FuelModuleReadinessDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ui = isGenericModelPlainObject(o.uiComposition) ? o.uiComposition : {};
  const enabled = o.enabled === true;
  const uiCompositionReady = ui.moduleShellReady === true;
  const productionReady = ui.productionReady === true;

  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  if (Array.isArray(ui.missingForProduction)) {
    for (const m of ui.missingForProduction) warnings.push(`missing for production: ${m}`);
  }

  // Readiness: prepared for a beta shell but NOT production-ready → partial when
  // enabled; ready_for_beta_shell when enabled + shell composition is ready;
  // blocked when disabled.
  let readiness;
  if (!enabled) readiness = 'blocked';
  else if (uiCompositionReady && !productionReady) readiness = 'ready_for_beta_shell';
  else if (!uiCompositionReady) readiness = 'needs_fixes';
  else readiness = 'partial';

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-readiness-diagnostics',
    readinessId: typeof o.readinessId === 'string' ? o.readinessId : null,
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : FUEL_MODULE_SHELL_MODULE_ID,
    domain: FUEL_DOMAIN,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    moduleRegistered: false,
    routeRegistered: false,
    menuRegistered: false,
    permissionsRegistered: false,
    backendRegistered: false,
    localOnly: true,
    sent: false,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    uiCompositionReady,
    shellReadiness: uiCompositionReady ? 'shell_ready' : 'shell_incomplete',
    dangerousCapabilities: Object.fromEntries(GENERIC_MODEL_DANGEROUS_CAPABILITIES.map((c) => [c, false])),
    noSideEffects: true,
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createModeloBase2FuelModuleReadinessDiagnostics;
