import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { EMPRESAS_LOCAL_READ_ENVIRONMENT } from './empresasLocalReadCertificationConfig.js';

const READINESS = new Set(['certified_local_read_only', 'blocked', 'invalid', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the certification package. Pure. Asserts the local/
 * read-only/no-side-effect invariants and reflects the manifest + verification.
 *
 * @param {Object} [options]
 * @param {Object} [options.certification] full certification package
 * @returns {Object} diagnostics
 */
export function createEmpresasCertificationDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const cert = isGenericModelPlainObject(o.certification) ? o.certification : {};
  const manifest = isGenericModelPlainObject(cert.manifest) ? cert.manifest : {};
  const verification = isGenericModelPlainObject(cert.verification) ? cert.verification : {};

  const exactParity = manifest.exactParity === true;
  const blockers = Array.isArray(manifest.blockers) ? manifest.blockers : [];
  const certified = verification.certified === true && manifest.status === 'certified_local_read_only';

  let readiness;
  if (certified && blockers.length === 0) readiness = 'certified_local_read_only';
  else if (verification.valid === false) readiness = 'invalid';
  else if (blockers.length > 0) readiness = 'blocked';
  else readiness = 'needs_fixes';

  return safeCloneGenericModel({
    kind: 'empresas-certification-diagnostics',
    certificationId: manifest.certificationId ?? null,
    contractVersion: manifest.contractVersion ?? null,
    certificationStatus: manifest.status ?? null,
    verifierStatus: verification.status ?? null,
    compatibilityStatus: typeof o.compatibilityStatus === 'string' ? o.compatibilityStatus : 'not_run',
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    synthetic: true,
    localOnly: true,
    readOnly: true,
    mutationAllowed: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    fixtureStatus: manifest.fixtureDigest ? 'present' : 'missing',
    queryCatalogStatus: manifest.queryCatalogDigest ? 'present' : 'missing',
    errorCatalogStatus: manifest.errorCatalogDigest ? 'present' : 'missing',
    tenantRulesStatus: manifest.tenantRulesDigest ? 'present' : 'missing',
    permissionRulesStatus: manifest.permissionRulesDigest ? 'present' : 'missing',
    parityStatus: exactParity ? 'exact' : 'divergent',
    performanceStatus: manifest.performanceEnvelopeDigest ? 'present' : 'missing',
    exactParity,
    parityScore: typeof manifest.parityScore === 'number' ? manifest.parityScore : 0,
    tenantLeakageFound: manifest.tenantLeakageFound === true,
    permissionBypassFound: manifest.permissionBypassFound === true,
    mutationExposureFound: manifest.mutationExposureFound === true,
    blockers,
    warnings: Array.isArray(manifest.warnings) ? manifest.warnings : [],
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createEmpresasCertificationDiagnostics;
