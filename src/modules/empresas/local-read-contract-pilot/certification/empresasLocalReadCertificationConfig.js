/**
 * Config + local flags for the Empresas LOCAL READ CONTRACT CERTIFICATION layer.
 * Flags are for diagnostics/tests only — enabling one NEVER touches a backend/
 * Prisma/fetch/production/staging, NEVER mounts UI, NEVER mutates, and NEVER causes
 * auto-consumption by the app. Local-only; off by default; fail-closed in
 * production. Reversible by non-consumption.
 *
 * File lives under `src/modules/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`. NO React import (pure config).
 */
import { EMPRESAS_LOCAL_READ_ENVIRONMENT } from '../empresasLocalReadContractConfig.js';

export { EMPRESAS_LOCAL_READ_ENVIRONMENT };

export const EMPRESAS_CONTRACT_NAME = 'empresas-local-read-contract';
export const EMPRESAS_CONTRACT_VERSION = '1.0.0';
export const EMPRESAS_CONTRACT_ID = 'empresas-local-read-contract@1.0.0';
export const EMPRESAS_CERTIFICATION_VERSION = '1.0.0';
export const EMPRESAS_CERTIFICATION_SOURCE = 'local_read_contract_certification';
/** Deterministic default createdAt (injectable) — never a real timestamp. */
export const EMPRESAS_CERTIFICATION_DEFAULT_CREATED_AT = '2025-01-01T00:00:00.000Z';

export const EMPRESAS_LOCAL_READ_CONTRACT_CERTIFICATION_FLAG = 'MAK_EMPRESAS_LOCAL_READ_CONTRACT_CERTIFICATION';
export const EMPRESAS_LOCAL_READ_CERTIFICATION_VERIFY_FLAG = 'MAK_EMPRESAS_LOCAL_READ_CERTIFICATION_VERIFY';
export const EMPRESAS_LOCAL_READ_COMPATIBILITY_CHECK_FLAG = 'MAK_EMPRESAS_LOCAL_READ_COMPATIBILITY_CHECK';

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
  const requested = env[flag] === 'true' || env[EMPRESAS_LOCAL_READ_CONTRACT_CERTIFICATION_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalReadContractCertificationEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_READ_CONTRACT_CERTIFICATION_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalReadCertificationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_READ_CERTIFICATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalReadCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_READ_COMPATIBILITY_CHECK_FLAG);
}

export default {
  EMPRESAS_CONTRACT_NAME,
  EMPRESAS_CONTRACT_VERSION,
  EMPRESAS_CONTRACT_ID,
};
