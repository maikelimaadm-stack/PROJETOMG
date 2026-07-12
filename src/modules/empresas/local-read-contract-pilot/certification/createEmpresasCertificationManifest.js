import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import {
  EMPRESAS_CONTRACT_NAME,
  EMPRESAS_CONTRACT_VERSION,
  EMPRESAS_CERTIFICATION_VERSION,
  EMPRESAS_CONTRACT_ID,
  EMPRESAS_CERTIFICATION_DEFAULT_CREATED_AT,
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
} from './empresasLocalReadCertificationConfig.js';

const STATUS = new Set(['certified_local_read_only', 'blocked', 'invalid', 'expired', 'superseded', 'draft']);

/**
 * Builds the certification manifest from the canonical parts. Aggregates every
 * digest into an overallDigest and computes the status. Pure. Deterministic
 * createdAt (injectable). Never touches production/backend/Prisma/fetch/staging.
 *
 * @param {Object} [options] the canonical parts + flags
 * @returns {Object} manifest descriptor
 */
export function createEmpresasCertificationManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const fixtures = isGenericModelPlainObject(o.fixtures) ? o.fixtures : {};
  const queryCatalog = isGenericModelPlainObject(o.queryCatalog) ? o.queryCatalog : {};
  const errorCatalog = isGenericModelPlainObject(o.errorCatalog) ? o.errorCatalog : {};
  const tenantRules = isGenericModelPlainObject(o.tenantRules) ? o.tenantRules : {};
  const permissionRules = isGenericModelPlainObject(o.permissionRules) ? o.permissionRules : {};
  const parity = isGenericModelPlainObject(o.parity) ? o.parity : {};
  const performance = isGenericModelPlainObject(o.performance) ? o.performance : {};
  const createdAt = typeof o.createdAt === 'string' ? o.createdAt : EMPRESAS_CERTIFICATION_DEFAULT_CREATED_AT;

  const exactParity = parity.exactParity === true;
  const parityScore = typeof parity.parityScore === 'number' ? parity.parityScore : 0;
  const tenantLeakageFound = tenantRules.tenantLeakageFound === true;
  const permissionBypassFound = permissionRules.permissionBypassFound === true;
  const mutationExposureFound = false;

  /** @type {string[]} */ const blockers = [];
  if (!exactParity) blockers.push('parity-not-exact');
  if (parityScore !== 1) blockers.push('parity-score-not-1');
  if (tenantLeakageFound) blockers.push('tenant-leakage');
  if (permissionBypassFound) blockers.push('permission-bypass');
  if (performance.hasAnomaly === true) blockers.push('performance-anomaly');

  let status = blockers.length === 0 ? 'certified_local_read_only' : 'blocked';
  if (o.forceStatus && STATUS.has(o.forceStatus)) status = o.forceStatus;

  const digests = {
    fixtureDigest: fixtures.fixtureDigest ?? null,
    canonicalContractDigest: contract.contractDigest ?? null,
    queryCatalogDigest: queryCatalog.queryCatalogDigest ?? null,
    errorCatalogDigest: errorCatalog.errorCatalogDigest ?? null,
    tenantRulesDigest: tenantRules.tenantRulesDigest ?? null,
    permissionRulesDigest: permissionRules.permissionRulesDigest ?? null,
    parityCertificationDigest: parity.certificationDigest ?? null,
    performanceEnvelopeDigest: performance.performanceEnvelopeDigest ?? null,
  };

  const core = {
    certificationId: `${EMPRESAS_CONTRACT_ID}#cert-${EMPRESAS_CERTIFICATION_VERSION}`,
    contractName: EMPRESAS_CONTRACT_NAME,
    contractVersion: EMPRESAS_CONTRACT_VERSION,
    certificationVersion: EMPRESAS_CERTIFICATION_VERSION,
    status,
    createdAt,
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    synthetic: true,
    localOnly: true,
    readOnly: true,
    mutationAllowed: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    fixtureVersion: fixtures.fixtureVersion ?? null,
    ...digests,
    exactParity,
    parityScore,
    tenantLeakageFound,
    permissionBypassFound,
    mutationExposureFound,
    blockers,
    warnings: [],
    limitations: [
      'local + synthetic only — never a production/staging authorization',
      'read-only; mutation is forbidden and never exposed',
      'not auto-consumed by the application',
    ],
    nextSteps: ['Empresas Staging Read-Only Readiness Audit'],
  };

  const overallDigest = createGenericModelChecksum({ value: { ...digests, exactParity, parityScore, status } });
  return safeCloneGenericModel({ kind: 'empresas-certification-manifest', ...core, overallDigest });
}

export default createEmpresasCertificationManifest;
