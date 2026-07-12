/**
 * Barrel for the Empresas LOCAL READ-ONLY CONTRACT PILOT — pure, React-free,
 * node-importable. An isolated harness that validates the Empresas READ contracts
 * against SYNTHETIC fixtures, with tenant isolation, a read-only repository + API
 * adapter, runtime projection, parity, diagnostics, fallback and an explicit
 * mutation blocker. It NEVER touches a real backend/Prisma/fetch/Railway/production,
 * NEVER mutates, NEVER uses real data, and does NOT alter any Empresas production
 * file. Reversible by non-consumption.
 */

export { createEmpresasLocalReadContractPilot } from './createEmpresasLocalReadContractPilot.js';
export { createEmpresasSyntheticDataset } from './createEmpresasSyntheticDataset.js';
export { createEmpresasSyntheticTenantContext } from './createEmpresasSyntheticTenantContext.js';
export { createEmpresasReadOnlyRepository } from './createEmpresasReadOnlyRepository.js';
export { createEmpresasReadOnlyApiAdapter } from './createEmpresasReadOnlyApiAdapter.js';
export { normalizeEmpresaReadPayload, normalizeEmpresaReadPayloadList, EMPRESAS_READ_FIELDS } from './normalizeEmpresaReadPayload.js';
export { validateEmpresaReadQuery } from './validateEmpresaReadQuery.js';
export { applyEmpresaReadFilters } from './applyEmpresaReadFilters.js';
export { applyEmpresaReadSorting } from './applyEmpresaReadSorting.js';
export { applyEmpresaReadPagination } from './applyEmpresaReadPagination.js';
export { createEmpresasRuntimeReadProjection } from './createEmpresasRuntimeReadProjection.js';
export { compareEmpresasReadParity } from './compareEmpresasReadParity.js';
export { createEmpresasReadContractDiagnostics } from './createEmpresasReadContractDiagnostics.js';
export { createEmpresasReadContractFallback, EMPRESAS_READ_FALLBACK_SCENARIOS } from './createEmpresasReadContractFallback.js';
export { blockEmpresasReadPilotMutation } from './blockEmpresasReadPilotMutation.js';
export {
  isEmpresasLocalReadContractPilotEnabled,
  isEmpresasLocalSyntheticFixturesEnabled,
  isEmpresasLocalRuntimeParityEnabled,
  EMPRESAS_LOCAL_READ_PILOT_MODE,
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
  EMPRESAS_LOCAL_READ_SOURCE,
  EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG,
} from './empresasLocalReadContractConfig.js';
export { EmpresasLocalReadError, empresasLocalReadError } from './errors.js';
