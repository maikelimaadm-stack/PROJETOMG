import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Known fallback scenarios for the read-only pilot. */
export const EMPRESAS_READ_FALLBACK_SCENARIOS = [
  'flag_off',
  'invalid_query',
  'invalid_context',
  'missing_tenant',
  'permission_denied',
  'runtime_projection_failure',
  'invalid_dataset',
  'parity_mismatch',
  'mutation_attempt',
];

/** Scenarios where the local legacy read path is still safe to serve. */
const SAFE_LEGACY = new Set(['flag_off', 'runtime_projection_failure']);

/**
 * Passive fallback for the read-only pilot. Pure. Fails closed: never mutates,
 * never touches production; serves the safe local legacy path only when the
 * scenario is safe, otherwise returns `blocked`.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createEmpresasReadContractFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && EMPRESAS_READ_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'flag_off';
  const serveLegacy = SAFE_LEGACY.has(scenario);

  return safeCloneGenericModel({
    kind: 'empresas-read-contract-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `read pilot fallback: ${scenario}`,
    status: serveLegacy ? 'legacy_safe' : 'blocked',
    serveLegacyLocalPath: serveLegacy,
    mutationExecuted: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    localOnly: true,
    readOnly: true,
  });
}

export default createEmpresasReadContractFallback;
