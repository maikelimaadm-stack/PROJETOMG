import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION,
  STUDIO_BASE_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_HARDENING_ENVIRONMENT,
  STUDIO_HARDENING_HEADLESS_CAPABILITIES,
} from './studioBlueprintHardeningConfig.js';

const READINESS = new Set(['blueprint_contract_hardened', 'blocked', 'invalid', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the blueprint hardening layer. Pure. Asserts headless/
 * no-side-effect invariants and never contains secrets.
 *
 * @param {Object} [options] scenario counts + blockers/warnings
 * @returns {Object} diagnostics
 */
export function createStudioBlueprintHardeningDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const num = (k) => (typeof o[k] === 'number' ? o[k] : 0);

  let readiness = 'blueprint_contract_hardened';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_fixes';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-hardening-diagnostics',
    hardeningId: typeof o.hardeningId === 'string' ? o.hardeningId : 'studio-blueprint-contract-hardening',
    contractVersion: STUDIO_BASE_CONTRACT_VERSION,
    hardeningVersion: STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION,
    environment: STUDIO_BLUEPRINT_HARDENING_ENVIRONMENT,
    ...STUDIO_HARDENING_HEADLESS_CAPABILITIES,
    invalidCaseScenarios: num('invalidCaseScenarios'),
    dangerousScenarios: num('dangerousScenarios'),
    fieldScenarios: num('fieldScenarios'),
    screenScenarios: num('screenScenarios'),
    validationScenarios: num('validationScenarios'),
    permissionScenarios: num('permissionScenarios'),
    routeMenuScenarios: num('routeMenuScenarios'),
    persistenceTransitionScenarios: num('persistenceTransitionScenarios'),
    runtimeBindingScenarios: num('runtimeBindingScenarios'),
    compatibilityScenarios: num('compatibilityScenarios'),
    digestScenarios: num('digestScenarios'),
    verifierScenarios: num('verifierScenarios'),
    safetyInvariants: num('safetyInvariants'),
    exactSafety: o.exactSafety === true,
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createStudioBlueprintHardeningDiagnostics;
