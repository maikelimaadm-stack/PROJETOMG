import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';
import {
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
} from './studioBlueprintCertificationConfig.js';

const DIGEST_KEYS = [
  'metamodelDigest', 'blueprintContractDigest', 'moduleBlueprintDigest', 'fieldContractDigest',
  'screenContractDigest', 'validationContractDigest', 'permissionContractDigest', 'routeMenuContractDigest',
  'persistenceBoundaryDigest', 'runtimeBindingDigest', 'safetyInvariantsDigest', 'errorCatalogDigest',
  'compatibilityRulesDigest', 'hardeningBaselineDigest',
];

/**
 * Verifies a Studio blueprint certification package: re-derives the overall digest,
 * checks every canonical digest is present, and asserts the headless invariants +
 * exactSafety. Any altered digest → not certified. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.certification] the full certification package
 * @returns {Object} verification result
 */
export function verifyStudioBlueprintContractCertification(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.certification) ? o.certification : {};
  const m = isGenericModelPlainObject(c.manifest) ? c.manifest : {};

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('certification-version-known', c.certificationVersion === STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION);
  check('blueprint-contract-version-known', c.blueprintContractVersion === STUDIO_BLUEPRINT_CONTRACT_VERSION);
  check('manifest-present', m.kind === 'studio-blueprint-certification-manifest');

  for (const k of DIGEST_KEYS) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  const recomputed = certificationDigest({
    metamodelDigest: m.metamodelDigest, blueprintContractDigest: m.blueprintContractDigest,
    moduleBlueprintDigest: m.moduleBlueprintDigest, fieldContractDigest: m.fieldContractDigest,
    screenContractDigest: m.screenContractDigest, validationContractDigest: m.validationContractDigest,
    permissionContractDigest: m.permissionContractDigest, routeMenuContractDigest: m.routeMenuContractDigest,
    persistenceBoundaryDigest: m.persistenceBoundaryDigest, runtimeBindingDigest: m.runtimeBindingDigest,
    safetyInvariantsDigest: m.safetyInvariantsDigest, errorCatalogDigest: m.errorCatalogDigest,
    compatibilityRulesDigest: m.compatibilityRulesDigest, hardeningBaselineDigest: m.hardeningBaselineDigest,
    status: m.certificationStatus, exactSafety: m.exactSafety,
  });
  check('overall-digest-matches', recomputed === m.overallDigest);

  check('exact-safety', c.exactSafety === true && m.exactSafety === true);
  check('blockers-zero', Array.isArray(m.blockers) && m.blockers.length === 0);
  check('warnings-zero', Array.isArray(c.warnings) && c.warnings.length === 0);

  // Headless invariants (fail-closed).
  check('headless', c.headless === true);
  check('no-ui', c.uiEnabled === false);
  check('no-route', c.routeEnabled === false);
  check('no-menu', c.menuEnabled === false);
  check('no-module-registration', c.moduleRegistrationEnabled === false);
  check('no-backend', c.backendEnabled === false);
  check('no-prisma', c.prismaEnabled === false);
  check('no-migration', c.migrationEnabled === false);
  check('no-production', c.productionEnabled === false);
  check('no-staging', c.stagingEnabled === false);
  check('no-fetch', c.fetchEnabled === false);
  check('no-mutation', c.mutationAllowed === false);
  check('no-generated-module', c.generatedModuleAllowed === false);
  check('no-marketplace', c.marketplaceEnabled === false);
  check('default-deny', isGenericModelPlainObject(c.canonicalPermissionContract) && c.canonicalPermissionContract.defaultDeny === true);
  check('fail-closed', isGenericModelPlainObject(c.canonicalPermissionContract) && c.canonicalPermissionContract.failClosed === true);
  check('tenant-required', isGenericModelPlainObject(c.canonicalSafetyInvariants) && c.canonicalSafetyInvariants.invariants && c.canonicalSafetyInvariants.invariants.tenantRequired === true);
  check('permission-required', isGenericModelPlainObject(c.canonicalSafetyInvariants) && c.canonicalSafetyInvariants.invariants && c.canonicalSafetyInvariants.invariants.permissionRequired === true);

  const failures = checks.filter((ch) => !ch.ok).map((ch) => ch.name);
  const valid = failures.length === 0;
  const certified = valid && m.certificationStatus === 'certified_headless_blueprint_contract';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-certification-verification',
    valid,
    certified,
    status: certified ? 'certified_headless_blueprint_contract' : (valid ? 'needs_fixes' : 'invalid'),
    readiness: certified ? 'certified_headless_blueprint_contract' : 'blocked',
    safeToUseAsBlueprintReference: certified,
    checks,
    failures,
    warnings: [],
  });
}

export default verifyStudioBlueprintContractCertification;
