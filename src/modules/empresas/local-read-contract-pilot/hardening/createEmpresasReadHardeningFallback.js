import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';

/** Known hardening fallback scenarios. */
export const EMPRESAS_HARDENING_FALLBACK_SCENARIOS = [
  'hardening_flag_off',
  'invalid_dataset',
  'invalid_query_matrix',
  'tenant_leakage_detected',
  'permission_bypass_detected',
  'parity_mismatch',
  'digest_mismatch',
  'performance_anomaly',
  'mutation_exposure',
  'production_access_attempt',
  'backend_access_attempt',
  'prisma_access_attempt',
  'fetch_attempt',
];

/**
 * Passive, fail-closed fallback for the hardening layer. Never mutates, never
 * touches production/backend/Prisma/fetch. Readiness is always `blocked` (the
 * fallback exists to stop, not to serve). Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createEmpresasReadHardeningFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && EMPRESAS_HARDENING_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'hardening_flag_off';

  return safeCloneGenericModel({
    kind: 'empresas-read-hardening-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `hardening fallback: ${scenario}`,
    readiness: 'blocked',
    mutationExecuted: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    datasetChanged: false,
    productionCodeChanged: false,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
    localOnly: true,
    readOnly: true,
  });
}

export default createEmpresasReadHardeningFallback;
