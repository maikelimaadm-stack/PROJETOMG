import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioBlueprintContractHardening } from '../hardening/createStudioBlueprintContractHardening.js';
import { STUDIO_CERTIFICATION_HARDENING_BASELINE } from './studioBlueprintCertificationConfig.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the hardening baseline by running the hardening layer and asserting every
 * minimum scenario count still holds, with zero blockers/warnings and
 * `blueprint_contract_hardened` readiness. Pure. If any baseline regresses, the
 * baseline is invalid and certification must fail.
 *
 * @param {Object} [options]
 * @returns {Object} canonical hardening baseline
 */
export function createStudioCanonicalHardeningBaseline(options = {}) {
  void options;
  const h = createStudioBlueprintContractHardening();
  const d = h.diagnostics;

  const measured = {
    invalidCaseScenarios: d.invalidCaseScenarios,
    dangerousScenarios: d.dangerousScenarios,
    fieldScenarios: d.fieldScenarios,
    screenScenarios: d.screenScenarios,
    validationScenarios: d.validationScenarios,
    permissionScenarios: d.permissionScenarios,
    routeMenuScenarios: d.routeMenuScenarios,
    persistenceTransitionScenarios: d.persistenceTransitionScenarios,
    runtimeBindingScenarios: d.runtimeBindingScenarios,
    compatibilityScenarios: d.compatibilityScenarios,
    digestScenarios: d.digestScenarios,
    verifierScenarios: d.verifierScenarios,
    safetyInvariants: d.safetyInvariants,
    performanceScenarios: h.performance.totalScenarios,
  };

  const min = STUDIO_CERTIFICATION_HARDENING_BASELINE;
  /** @type {string[]} */ const regressions = [];
  for (const key of Object.keys(min)) {
    if (key === 'safetyInvariants') {
      if (measured[key] !== min[key]) regressions.push(`${key} must equal ${min[key]} (got ${measured[key]})`);
    } else if (Number(measured[key]) < Number(min[key])) {
      regressions.push(`${key} below baseline ${min[key]} (got ${measured[key]})`);
    }
  }

  const hardeningReadiness = h.readiness;
  const hardeningBlockers = Array.isArray(h.blockers) ? h.blockers : [];
  const hardeningWarnings = Array.isArray(h.warnings) ? h.warnings : [];
  if (hardeningReadiness !== 'blueprint_contract_hardened') regressions.push(`hardening readiness is ${hardeningReadiness}`);
  if (hardeningBlockers.length > 0) regressions.push('hardening has blockers');

  const valid = regressions.length === 0;
  const body = {
    kind: 'studio-canonical-hardening-baseline',
    baseline: { ...min },
    measured,
    regressions,
    valid,
    hardeningReadiness,
    hardeningBlockers,
    hardeningWarnings,
  };
  return safeCloneGenericModel({ ...body, canonicalHardeningBaselineDigest: certificationDigest({ baseline: min, valid }) });
}

export default createStudioCanonicalHardeningBaseline;
