import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { createEmpresasScaledSyntheticDataset } from '../hardening/createEmpresasScaledSyntheticDataset.js';

export const EMPRESAS_CERTIFICATION_FIXTURE_VERSION = '1.0.0';
const CERT_SEED = 7;

/**
 * Immutable, versioned, deterministic, synthetic certification fixtures. Two
 * profiles: certification-small (20) and certification-medium (250, >=4 tenants).
 * The `large` profile stays only in the performance envelope. No real data.
 *
 * @param {Object} [options]
 * @param {'certification-small'|'certification-medium'} [options.profile]
 * @returns {Object} fixtures descriptor
 */
export function createEmpresasCanonicalFixtures(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const profile = o.profile === 'certification-medium' ? 'certification-medium' : 'certification-small';
  const scaledProfile = profile === 'certification-medium' ? 'medium' : 'small';
  const dataset = createEmpresasScaledSyntheticDataset({ profile: scaledProfile, seed: CERT_SEED, testRunId: `CERT_${profile}` });

  const body = {
    kind: 'empresas-canonical-fixtures',
    fixtureVersion: EMPRESAS_CERTIFICATION_FIXTURE_VERSION,
    datasetProfile: profile,
    seed: CERT_SEED,
    recordCount: dataset.total,
    tenantCount: dataset.tenants.length,
    synthetic: true,
    environment: 'local_test',
    hasSensitiveData: false,
    records: dataset.records,
    tenants: dataset.tenants,
  };

  return safeCloneGenericModel({ ...body, fixtureDigest: createGenericModelChecksum({ value: { records: dataset.records, tenants: dataset.tenants, profile } }) });
}

/** Builds both canonical fixture profiles. */
export function createEmpresasCanonicalFixtureSet() {
  const small = createEmpresasCanonicalFixtures({ profile: 'certification-small' });
  const medium = createEmpresasCanonicalFixtures({ profile: 'certification-medium' });
  return safeCloneGenericModel({
    kind: 'empresas-canonical-fixture-set',
    fixtureVersion: EMPRESAS_CERTIFICATION_FIXTURE_VERSION,
    profiles: { 'certification-small': small, 'certification-medium': medium },
    fixtureSetDigest: createGenericModelChecksum({ value: [small.fixtureDigest, medium.fixtureDigest] }),
  });
}

export default createEmpresasCanonicalFixtures;
