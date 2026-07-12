import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { EMPRESAS_CONTRACT_VERSION } from './empresasLocalReadCertificationConfig.js';

/**
 * Verifies a certification package: re-derives the overall digest from the manifest
 * digests and checks every invariant. Any altered digest → not certified. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.manifest]
 * @returns {Object} verification result
 */
export function verifyEmpresasLocalReadCertification(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const m = isGenericModelPlainObject(o.manifest) ? o.manifest : {};

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('contract-version-known', m.contractVersion === EMPRESAS_CONTRACT_VERSION);
  check('manifest-present', m.kind === 'empresas-certification-manifest');
  const digestKeys = ['fixtureDigest', 'canonicalContractDigest', 'queryCatalogDigest', 'errorCatalogDigest', 'tenantRulesDigest', 'permissionRulesDigest', 'parityCertificationDigest', 'performanceEnvelopeDigest'];
  for (const k of digestKeys) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  // Re-derive the overall digest — a mismatch means a digest was tampered with.
  const recomputed = createGenericModelChecksum({ value: {
    fixtureDigest: m.fixtureDigest, canonicalContractDigest: m.canonicalContractDigest, queryCatalogDigest: m.queryCatalogDigest,
    errorCatalogDigest: m.errorCatalogDigest, tenantRulesDigest: m.tenantRulesDigest, permissionRulesDigest: m.permissionRulesDigest,
    parityCertificationDigest: m.parityCertificationDigest, performanceEnvelopeDigest: m.performanceEnvelopeDigest,
    exactParity: m.exactParity, parityScore: m.parityScore, status: m.status,
  } });
  check('overall-digest-matches', recomputed === m.overallDigest);

  check('exact-parity', m.exactParity === true);
  check('parity-score-1', m.parityScore === 1);
  check('tenant-leakage-false', m.tenantLeakageFound === false);
  check('permission-bypass-false', m.permissionBypassFound === false);
  check('mutation-exposure-false', m.mutationExposureFound === false);
  check('blockers-zero', Array.isArray(m.blockers) && m.blockers.length === 0);
  check('local-only', m.localOnly === true);
  check('read-only', m.readOnly === true);
  check('mutation-not-allowed', m.mutationAllowed === false);
  check('production-not-accessed', m.productionAccessed === false);
  check('backend-not-accessed', m.backendAccessed === false);
  check('prisma-not-accessed', m.prismaAccessed === false);
  check('fetch-not-used', m.fetchUsed === false);

  const failures = checks.filter((c) => !c.ok).map((c) => c.name);
  const valid = failures.length === 0;
  const certified = valid && m.status === 'certified_local_read_only';

  return safeCloneGenericModel({
    kind: 'empresas-certification-verification',
    valid,
    certified,
    status: certified ? 'certified_local_read_only' : (m.status === 'certified_local_read_only' ? 'invalid' : (m.status || 'invalid')),
    contractVersion: m.contractVersion ?? null,
    certificationId: m.certificationId ?? null,
    checks,
    failures,
    warnings: [],
    safeToUseAsReference: certified,
    nextSteps: certified ? ['Empresas Staging Read-Only Readiness Audit'] : ['fix local certification blockers'],
  });
}

export default verifyEmpresasLocalReadCertification;
