import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';

export const EMPRESAS_CERTIFICATION_FALLBACK_SCENARIOS = [
  'certification_flag_off',
  'invalid_manifest',
  'unknown_contract_version',
  'fixture_digest_mismatch',
  'canonical_contract_mismatch',
  'query_catalog_mismatch',
  'error_catalog_mismatch',
  'tenant_rules_mismatch',
  'permission_rules_mismatch',
  'parity_mismatch',
  'performance_anomaly',
  'tenant_leakage',
  'permission_bypass',
  'mutation_exposure',
  'production_access_attempt',
  'backend_access_attempt',
  'prisma_access_attempt',
  'fetch_attempt',
];

/**
 * Passive, fail-closed fallback for the certification layer. Never certifies, never
 * mutates, never touches production/backend/Prisma/fetch, never alters original
 * fixtures. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createEmpresasCertificationFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && EMPRESAS_CERTIFICATION_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'certification_flag_off';

  return safeCloneGenericModel({
    kind: 'empresas-certification-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `certification fallback: ${scenario}`,
    certified: false,
    status: 'blocked',
    safeToUseAsReference: false,
    mutationExecuted: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    fixturesMutated: false,
    productionCodeChanged: false,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
    localOnly: true,
    readOnly: true,
  });
}

export default createEmpresasCertificationFallback;
