import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { createEmpresasCanonicalContract } from './createEmpresasCanonicalContract.js';
import { createEmpresasCanonicalFixtures, createEmpresasCanonicalFixtureSet } from './createEmpresasCanonicalFixtures.js';
import { createEmpresasCanonicalQueryCatalog } from './createEmpresasCanonicalQueryCatalog.js';
import { createEmpresasCanonicalErrorCatalog } from './createEmpresasCanonicalErrorCatalog.js';
import { createEmpresasCanonicalTenantRules } from './createEmpresasCanonicalTenantRules.js';
import { createEmpresasCanonicalPermissionRules } from './createEmpresasCanonicalPermissionRules.js';
import { createEmpresasCanonicalParityBaseline } from './createEmpresasCanonicalParityBaseline.js';
import { createEmpresasLocalPerformanceEnvelope } from './createEmpresasLocalPerformanceEnvelope.js';
import { createEmpresasCertificationManifest } from './createEmpresasCertificationManifest.js';
import { verifyEmpresasLocalReadCertification } from './verifyEmpresasLocalReadCertification.js';
import {
  isEmpresasLocalReadContractCertificationEnabled,
  EMPRESAS_CONTRACT_NAME,
  EMPRESAS_CONTRACT_VERSION,
  EMPRESAS_CONTRACT_ID,
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
} from './empresasLocalReadCertificationConfig.js';
import { empresasCertificationError } from './errors.js';

/**
 * The top-level Empresas LOCAL READ CONTRACT CERTIFICATION. Composes the canonical
 * contract, fixtures, query/error catalogs, tenant/permission rules, parity baseline
 * and performance envelope into a versioned, verifiable certification package with a
 * manifest and verification result. Pure aside from local synthetic reads. NEVER
 * touches production/staging/backend/Prisma/fetch, NEVER mutates, NEVER auto-consumed.
 *
 * @param {Object} [options]
 * @param {string} [options.createdAt] deterministic timestamp
 * @param {() => number} [options.clock]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} certification package
 */
export function createEmpresasLocalReadContractCertification(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw empresasCertificationError('MAK-EMP-CERT-001', 'createEmpresasLocalReadContractCertification() options must be a plain object');
  }
  const env = isGenericModelPlainObject(options.env) ? options.env : {};
  const enabled = isEmpresasLocalReadContractCertificationEnabled(env);
  const clock = options.clock || (() => 0);

  const contract = createEmpresasCanonicalContract();
  const fixtures = createEmpresasCanonicalFixtures({ profile: 'certification-small' });
  const fixtureSet = createEmpresasCanonicalFixtureSet();
  const queryCatalog = createEmpresasCanonicalQueryCatalog({ fixtures });
  const errorCatalog = createEmpresasCanonicalErrorCatalog();
  const tenantRules = createEmpresasCanonicalTenantRules({ fixtures: createEmpresasCanonicalFixtures({ profile: 'certification-medium' }) });
  const permissionRules = createEmpresasCanonicalPermissionRules({ fixtures });
  const parity = createEmpresasCanonicalParityBaseline({ fixtures, clock });
  const performance = createEmpresasLocalPerformanceEnvelope({ clock });

  const manifest = createEmpresasCertificationManifest({
    contract, fixtures, queryCatalog, errorCatalog, tenantRules, permissionRules, parity, performance,
    createdAt: options.createdAt,
  });
  const verification = verifyEmpresasLocalReadCertification({ manifest });

  return safeCloneGenericModel({
    kind: 'empresas-local-read-contract-certification',
    contractName: EMPRESAS_CONTRACT_NAME,
    contractVersion: EMPRESAS_CONTRACT_VERSION,
    contractId: EMPRESAS_CONTRACT_ID,
    certificationId: manifest.certificationId,
    certificationStatus: manifest.status,
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    enabled,
    synthetic: true,
    localOnly: true,
    readOnly: true,
    mutationAllowed: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    contract,
    fixtures,
    fixtureSet,
    queryCatalog,
    errorCatalog,
    tenantRules,
    permissionRules,
    parity,
    performance,
    manifest,
    verification,
    exactParity: manifest.exactParity,
    parityScore: manifest.parityScore,
    tenantLeakageFound: manifest.tenantLeakageFound,
    permissionBypassFound: manifest.permissionBypassFound,
    mutationExposureFound: manifest.mutationExposureFound,
    blockers: manifest.blockers,
    warnings: manifest.warnings,
    safeToUseAsReference: verification.safeToUseAsReference,
    nextSteps: ['Empresas Staging Read-Only Readiness Audit'],
  });
}

export default createEmpresasLocalReadContractCertification;
