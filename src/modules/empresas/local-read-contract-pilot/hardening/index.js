/**
 * Barrel for the Empresas LOCAL READ PARITY HARDENING layer — pure, React-free,
 * node-importable. Extends the isolated read-only pilot with scaled synthetic
 * datasets, composite query matrix, tenant fuzz matrix, permission matrix, typed
 * error contract, deterministic parity digests, a parity scenario runner, a local
 * performance baseline, aggregate diagnostics and a fail-closed fallback. It NEVER
 * touches a real backend/Prisma/fetch/Railway/production, NEVER mutates, NEVER uses
 * real data, and does NOT alter any Empresas production file. Reversible by
 * non-consumption. Next step is Empresas Local Read Contract Certification.
 */

export { createEmpresasScaledSyntheticDataset, contextForScaledTenant } from './createEmpresasScaledSyntheticDataset.js';
export { createEmpresasCompositeQueryMatrix, empresasCompositeQueryScenarios } from './createEmpresasCompositeQueryMatrix.js';
export { createEmpresasTenantFuzzMatrix } from './createEmpresasTenantFuzzMatrix.js';
export { createEmpresasPermissionMatrix } from './createEmpresasPermissionMatrix.js';
export { createEmpresasReadErrorContract, createEmpresasReadError, EMPRESAS_READ_ERROR_TYPES } from './createEmpresasReadErrorContract.js';
export { createEmpresasParityDigest } from './createEmpresasParityDigest.js';
export { createEmpresasParityScenarioRunner } from './createEmpresasParityScenarioRunner.js';
export { createEmpresasReadPerformanceBaseline } from './createEmpresasReadPerformanceBaseline.js';
export { createEmpresasReadHardeningDiagnostics } from './createEmpresasReadHardeningDiagnostics.js';
export { createEmpresasReadHardeningFallback, EMPRESAS_HARDENING_FALLBACK_SCENARIOS } from './createEmpresasReadHardeningFallback.js';
export { validateEmpresasHardeningInvariant } from './validateEmpresasHardeningInvariant.js';
export {
  isEmpresasLocalReadParityHardeningEnabled,
  isEmpresasLocalReadScaleTestEnabled,
  isEmpresasLocalTenantFuzzEnabled,
  isEmpresasLocalPermissionMatrixEnabled,
  isEmpresasLocalPerformanceBaselineEnabled,
  EMPRESAS_HARDENING_MODE,
  EMPRESAS_DATASET_PROFILES,
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
  EMPRESAS_LOCAL_READ_PARITY_HARDENING_FLAG,
} from './empresasLocalReadHardeningConfig.js';
export { EmpresasReadHardeningError, empresasReadHardeningError } from './errors.js';
