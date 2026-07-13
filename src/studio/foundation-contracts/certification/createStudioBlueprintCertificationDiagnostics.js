import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT,
  STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
} from './studioBlueprintCertificationConfig.js';

const READINESS = new Set(['certified_headless_blueprint_contract', 'blocked', 'invalid', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the blueprint certification layer. Pure. Asserts headless/
 * no-side-effect invariants and never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createStudioBlueprintCertificationDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const st = (k, d = 'certified') => (typeof o[k] === 'string' ? o[k] : d);

  let readiness = 'certified_headless_blueprint_contract';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_fixes';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-certification-diagnostics',
    diagnosticId: typeof o.diagnosticId === 'string' ? o.diagnosticId : 'studio-blueprint-contract-certification',
    certificationName: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    certificationVersion: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
    certificationStatus: readiness === 'certified_headless_blueprint_contract' ? 'certified_headless_blueprint_contract' : readiness,
    environment: STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT,
    ...STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
    exactSafety: o.exactSafety === true,
    metamodelStatus: st('metamodelStatus'),
    blueprintStatus: st('blueprintStatus'),
    moduleBlueprintStatus: st('moduleBlueprintStatus'),
    fieldStatus: st('fieldStatus'),
    screenStatus: st('screenStatus'),
    validationStatus: st('validationStatus'),
    permissionStatus: st('permissionStatus'),
    routeMenuStatus: st('routeMenuStatus'),
    persistenceStatus: st('persistenceStatus'),
    runtimeBindingStatus: st('runtimeBindingStatus'),
    safetyStatus: st('safetyStatus', 'enforced'),
    errorCatalogStatus: st('errorCatalogStatus'),
    compatibilityStatus: st('compatibilityStatus'),
    hardeningBaselineStatus: st('hardeningBaselineStatus'),
    verifierStatus: st('verifierStatus', 'valid'),
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createStudioBlueprintCertificationDiagnostics;
