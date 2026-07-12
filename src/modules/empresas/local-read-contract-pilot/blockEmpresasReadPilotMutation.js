import { EMPRESAS_LOCAL_READ_MUTATION_TOKENS } from './empresasLocalReadContractConfig.js';
import { empresasLocalReadError } from './errors.js';

/**
 * Explicit mutation blocker for the read-only pilot. Any write-shaped operation is
 * refused: nothing is executed, nothing is mutated, production is never touched.
 * Defense in depth — the repository/adapter expose no write methods at all.
 *
 * @param {Object} [options]
 * @param {string} [options.operation]
 * @param {boolean} [options.throwOnBlock] When true, throws a typed error instead of returning.
 * @returns {{blocked: boolean, operation: string, reason: string, code: string, mutationExecuted: false, productionAccessed: false, datasetChanged: false}}
 */
export function blockEmpresasReadPilotMutation(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const operation = typeof o.operation === 'string' ? o.operation : 'unknown';
  const normalized = operation.toLowerCase();
  const isMutation = EMPRESAS_LOCAL_READ_MUTATION_TOKENS.some((t) => normalized.includes(t));

  const result = {
    blocked: isMutation,
    operation,
    reason: isMutation
      ? `mutation operation "${operation}" is blocked in the local read-only contract pilot`
      : `operation "${operation}" is not a mutation`,
    code: 'MAK-EMP-LOCAL-READ-001',
    mutationExecuted: false,
    productionAccessed: false,
    datasetChanged: false,
  };

  if (isMutation && o.throwOnBlock === true) {
    throw empresasLocalReadError('MAK-EMP-LOCAL-READ-001', result.reason, result);
  }
  return result;
}

export default blockEmpresasReadPilotMutation;
