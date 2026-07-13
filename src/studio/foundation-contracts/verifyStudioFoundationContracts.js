import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';
import { STUDIO_FOUNDATION_CONTRACT_VERSION } from './studioFoundationContractsConfig.js';

/**
 * Verifies a Studio foundation contracts package: re-derives the overall digest,
 * checks every digest is present, and asserts the headless invariants. Any altered
 * digest → not verified. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.foundation] the full foundation contract package
 * @returns {Object} verification result
 */
export function verifyStudioFoundationContracts(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const f = isGenericModelPlainObject(o.foundation) ? o.foundation : {};
  const m = isGenericModelPlainObject(f.manifest) ? f.manifest : {};

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('contract-version-known', f.contractVersion === STUDIO_FOUNDATION_CONTRACT_VERSION);
  check('foundation-present', f.kind === 'studio-foundation-contract');
  check('metamodel-valid', isGenericModelPlainObject(f.metamodel) && f.metamodel.entityCount >= 19);
  check('blueprint-valid', isGenericModelPlainObject(f.blueprint) && Array.isArray(f.blueprint.states));
  check('module-blueprint-valid', isGenericModelPlainObject(f.moduleBlueprint) && f.moduleBlueprint.permissionBlueprintRequired === true);
  check('field-blueprint-valid', isGenericModelPlainObject(f.fieldBlueprint) && Array.isArray(f.fieldBlueprint.allowedTypes));
  check('screen-blueprint-valid', isGenericModelPlainObject(f.screenBlueprint) && f.screenBlueprint.generatesUi === false);
  check('validation-blueprint-valid', isGenericModelPlainObject(f.validationBlueprint) && f.validationBlueprint.unsafeValidationAllowed === false);
  check('permission-blueprint-valid', isGenericModelPlainObject(f.permissionBlueprint) && f.permissionBlueprint.defaultDeny === true);
  check('route-menu-valid', isGenericModelPlainObject(f.routeMenu) && f.routeMenu.automaticRegistration === false);
  check('persistence-boundary-valid', isGenericModelPlainObject(f.persistenceBoundary) && f.persistenceBoundary.defaultState === 'noPersistence');
  check('runtime-binding-valid', isGenericModelPlainObject(f.runtimeBinding) && f.runtimeBinding.activatesProduction === false);
  check('safety-policy-valid', isGenericModelPlainObject(f.safetyPolicy) && f.safetyPolicy.invariants && f.safetyPolicy.invariants.failClosed === true);
  check('manifest-present', m.kind === 'studio-contract-manifest');

  const digestKeys = ['metamodelDigest', 'blueprintDigest', 'moduleBlueprintDigest', 'fieldBlueprintDigest', 'screenBlueprintDigest', 'validationBlueprintDigest', 'permissionBlueprintDigest', 'routeMenuDigest', 'persistenceBoundaryDigest', 'runtimeBindingDigest', 'safetyPolicyDigest'];
  for (const k of digestKeys) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  const recomputed = createStudioContractDigest({ value: {
    foundationDigest: m.foundationDigest, metamodelDigest: m.metamodelDigest, blueprintDigest: m.blueprintDigest,
    moduleBlueprintDigest: m.moduleBlueprintDigest, fieldBlueprintDigest: m.fieldBlueprintDigest, screenBlueprintDigest: m.screenBlueprintDigest,
    validationBlueprintDigest: m.validationBlueprintDigest, permissionBlueprintDigest: m.permissionBlueprintDigest, routeMenuDigest: m.routeMenuDigest,
    persistenceBoundaryDigest: m.persistenceBoundaryDigest, runtimeBindingDigest: m.runtimeBindingDigest, safetyPolicyDigest: m.safetyPolicyDigest,
    diagnosticsDigest: m.diagnosticsDigest, status: m.status,
  } });
  check('overall-digest-matches', recomputed === m.overallDigest);

  // Headless invariants (fail-closed).
  check('no-ui', f.uiEnabled === false);
  check('no-route', f.routeEnabled === false);
  check('no-menu', f.menuEnabled === false);
  check('no-backend', f.backendEnabled === false);
  check('no-prisma', f.prismaEnabled === false);
  check('no-migration', f.migrationEnabled === false);
  check('no-fetch', f.fetchEnabled === false);
  check('no-production', f.productionEnabled === false);
  check('no-mutation', f.mutationAllowed === false);
  check('no-module-registration', f.moduleRegistrationEnabled === false);
  check('default-deny', f.permissionBlueprint && f.permissionBlueprint.defaultDeny === true);
  check('fail-closed', f.safetyPolicy && f.safetyPolicy.invariants && f.safetyPolicy.invariants.failClosed === true);
  check('blockers-zero', Array.isArray(m.blockers) && m.blockers.length === 0);

  const failures = checks.filter((c) => !c.ok).map((c) => c.name);
  const valid = failures.length === 0;
  const status = valid && m.status === 'foundation_contract_ready' ? 'foundation_contract_ready' : (valid ? 'needs_fixes' : 'invalid');

  return safeCloneGenericModel({
    kind: 'studio-foundation-verification',
    valid,
    status,
    readiness: valid && m.status === 'foundation_contract_ready' ? 'foundation_contract_ready' : 'blocked',
    checks,
    failures,
    warnings: [],
    safeToUseAsFoundationReference: valid && m.status === 'foundation_contract_ready',
  });
}

export default verifyStudioFoundationContracts;
