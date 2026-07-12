/**
 * Config + local flags for the Empresas LOCAL READ PARITY HARDENING layer. Flags
 * are for diagnostics/tests only — enabling one NEVER touches a backend/Prisma/
 * fetch/production, NEVER mounts UI, NEVER mutates. Local-only; off by default;
 * fail-closed in production. Reversible by non-consumption.
 *
 * File lives under `src/modules/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`. NO React import (pure config).
 */
import { EMPRESAS_LOCAL_READ_ENVIRONMENT } from '../empresasLocalReadContractConfig.js';

export { EMPRESAS_LOCAL_READ_ENVIRONMENT };

export const EMPRESAS_HARDENING_MODE = 'empresas_local_read_parity_hardening';
export const EMPRESAS_HARDENING_SOURCE = 'deterministic_scaled_fixture';

/** Dataset scale profiles and their sizes. `large` is capped at 2000 this slice. */
export const EMPRESAS_DATASET_PROFILES = {
  tiny: 4,
  small: 20,
  medium: 250,
  large: 2000,
};
export const EMPRESAS_DATASET_MAX = 5000;

export const EMPRESAS_LOCAL_READ_PARITY_HARDENING_FLAG = 'MAK_EMPRESAS_LOCAL_READ_PARITY_HARDENING';
export const EMPRESAS_LOCAL_READ_SCALE_TEST_FLAG = 'MAK_EMPRESAS_LOCAL_READ_SCALE_TEST';
export const EMPRESAS_LOCAL_TENANT_FUZZ_FLAG = 'MAK_EMPRESAS_LOCAL_TENANT_FUZZ';
export const EMPRESAS_LOCAL_PERMISSION_MATRIX_FLAG = 'MAK_EMPRESAS_LOCAL_PERMISSION_MATRIX';
export const EMPRESAS_LOCAL_PERFORMANCE_BASELINE_FLAG = 'MAK_EMPRESAS_LOCAL_PERFORMANCE_BASELINE';

/** @returns {Record<string, unknown>} */
function resolveEnv() {
  /** @type {Record<string, unknown>} */
  let metaEnv = {};
  try {
    metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  } catch {
    metaEnv = {};
  }
  const proc = (typeof globalThis !== 'undefined' && globalThis.process) ? globalThis.process : undefined;
  const procEnv = proc && proc.env ? proc.env : {};
  return { ...procEnv, ...metaEnv };
}

/** @param {Record<string, unknown>} env @returns {boolean} */
function isProductionEnv(env) {
  if (env.DEV === true || env.DEV === 'true') return false;
  const label = String(env.MAK_ENV_LABEL || env.VITE_ENV_LABEL || '').toLowerCase();
  if (label === 'production') return true;
  if (label && label !== 'production') return false;
  const mode = String(env.MODE || '').toLowerCase();
  if (mode === 'production') return true;
  if (mode && mode !== 'production') return false;
  const nodeEnv = String(env.NODE_ENV || '').toLowerCase();
  if (nodeEnv === 'production') return true;
  if (env.PROD === true || env.PROD === 'true') return true;
  return false;
}

/** @param {Record<string, unknown>} env @param {string} flag @returns {boolean} */
function flagEnabled(env, flag) {
  const requested = env[flag] === 'true' || env[EMPRESAS_LOCAL_READ_PARITY_HARDENING_FLAG] === 'true';
  if (!requested) return false;
  // Local-only: fails closed in production, with NO allow-prod escape.
  return !isProductionEnv(env);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalReadParityHardeningEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_READ_PARITY_HARDENING_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalReadScaleTestEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_READ_SCALE_TEST_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalTenantFuzzEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_TENANT_FUZZ_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalPermissionMatrixEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_PERMISSION_MATRIX_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalPerformanceBaselineEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_PERFORMANCE_BASELINE_FLAG);
}

export default {
  EMPRESAS_HARDENING_MODE,
  EMPRESAS_DATASET_PROFILES,
};
