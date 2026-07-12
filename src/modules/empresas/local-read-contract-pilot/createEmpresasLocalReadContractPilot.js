import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createEmpresasSyntheticDataset } from './createEmpresasSyntheticDataset.js';
import { createEmpresasSyntheticTenantContext } from './createEmpresasSyntheticTenantContext.js';
import { createEmpresasReadOnlyRepository } from './createEmpresasReadOnlyRepository.js';
import { createEmpresasReadOnlyApiAdapter } from './createEmpresasReadOnlyApiAdapter.js';
import { createEmpresasRuntimeReadProjection } from './createEmpresasRuntimeReadProjection.js';
import { compareEmpresasReadParity } from './compareEmpresasReadParity.js';
import { createEmpresasReadContractDiagnostics } from './createEmpresasReadContractDiagnostics.js';
import { createEmpresasReadContractFallback } from './createEmpresasReadContractFallback.js';
import { blockEmpresasReadPilotMutation } from './blockEmpresasReadPilotMutation.js';
import {
  isEmpresasLocalReadContractPilotEnabled,
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
  EMPRESAS_LOCAL_READ_PILOT_MODE,
} from './empresasLocalReadContractConfig.js';
import { empresasLocalReadError } from './errors.js';

/**
 * Top-level Empresas LOCAL READ-ONLY CONTRACT PILOT. Wires the synthetic dataset,
 * read-only repository + API adapter, runtime projection, parity checker,
 * diagnostics and fallback into one local, read-only, deterministic harness.
 * Never touches a real backend/Prisma/fetch/production; never mutates.
 *
 * @param {Object} [options]
 * @param {string} [options.testRunId]
 * @param {Record<string, unknown>} [options.env]
 * @param {Object} [options.dataset]
 * @returns {Object} pilot
 */
export function createEmpresasLocalReadContractPilot(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw empresasLocalReadError('MAK-EMP-LOCAL-READ-002', 'createEmpresasLocalReadContractPilot() options must be a plain object');
  }
  const testRunId = typeof options.testRunId === 'string' ? options.testRunId : 'RUN_LOCAL_0001';
  const env = isGenericModelPlainObject(options.env) ? options.env : {};
  const enabled = isEmpresasLocalReadContractPilotEnabled(env);
  const pilotId = `empresas-local-read-pilot-${testRunId}`;

  const dataset = isGenericModelPlainObject(options.dataset) ? options.dataset : createEmpresasSyntheticDataset({ testRunId });
  const repository = createEmpresasReadOnlyRepository({ dataset });
  const apiAdapter = createEmpresasReadOnlyApiAdapter({ repository });

  /**
   * Runs a scoped read through repository → runtime projection → parity.
   * @param {Object} query
   * @param {Object} context synthetic tenant context
   */
  function read(query, context) {
    const legacy = repository.list(query, context);
    const runtime = createEmpresasRuntimeReadProjection({ listResult: legacy, query: legacy.query, tenantScope: context && context.tenantId });
    const parity = compareEmpresasReadParity({ legacy, runtime });
    return { legacy, runtime, parity };
  }

  const descriptor = safeCloneGenericModel({
    kind: 'empresas-local-read-contract-pilot',
    pilotId,
    mode: EMPRESAS_LOCAL_READ_PILOT_MODE,
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
    datasetSize: Array.isArray(dataset.records) ? dataset.records.length : 0,
    tenants: Array.isArray(dataset.tenants) ? dataset.tenants.map((t) => t.tenantId) : [],
    nextSteps: ['Empresas Local Read Parity Hardening'],
  });

  return {
    ...descriptor,
    dataset,
    repository,
    apiAdapter,
    createContext: (input) => createEmpresasSyntheticTenantContext(isGenericModelPlainObject(input) ? input : {}),
    read,
    projection: (input) => createEmpresasRuntimeReadProjection(isGenericModelPlainObject(input) ? input : {}),
    parity: (input) => compareEmpresasReadParity(isGenericModelPlainObject(input) ? input : {}),
    fallback: (input) => createEmpresasReadContractFallback(isGenericModelPlainObject(input) ? input : {}),
    blockMutation: (operation) => blockEmpresasReadPilotMutation({ operation }),
    diagnostics: (input) => createEmpresasReadContractDiagnostics({ pilotId, datasetSize: Array.isArray(dataset.records) ? dataset.records.length : 0, ...(isGenericModelPlainObject(input) ? input : {}) }),
  };
}

export default createEmpresasLocalReadContractPilot;
