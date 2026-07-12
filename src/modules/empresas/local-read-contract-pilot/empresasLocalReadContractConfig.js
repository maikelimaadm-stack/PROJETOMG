/**
 * Config + local feature flags for the Empresas LOCAL READ-ONLY CONTRACT PILOT.
 * Flags exist for diagnostics/tests only — enabling one NEVER touches a backend/
 * Prisma/fetch/production, NEVER mounts UI, NEVER mutates. Dev/local-only, off by
 * default; fail-closed in production. Reversible by non-consumption.
 *
 * File lives under `src/modules/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`. NO React import (pure config).
 */

export const EMPRESAS_LOCAL_READ_PILOT_MODE = 'empresas_local_read_only_contract_pilot';
export const EMPRESAS_LOCAL_READ_ENVIRONMENT = 'local_test';
export const EMPRESAS_LOCAL_READ_SOURCE = 'local_read_contract_pilot';
export const EMPRESAS_LOCAL_READ_MODULE_ID = 'empresas';
export const EMPRESAS_LOCAL_READ_MODEL_TYPE = 'cadastro';

/** Columns the pilot allows for sorting/filtering (mirrors the real Empresa fields). */
export const EMPRESAS_LOCAL_READ_SORTABLE = ['codempresa', 'razao_social', 'nome_fantasia', 'status', 'cidade', 'estado'];
export const EMPRESAS_LOCAL_READ_FILTERABLE = ['codempresa', 'razao_social', 'nome_fantasia', 'status', 'cidade', 'estado', 'tipo_pessoa'];
export const EMPRESAS_LOCAL_READ_SEARCHABLE = ['razao_social', 'nome_fantasia', 'cidade'];
export const EMPRESAS_LOCAL_READ_MAX_PAGE_SIZE = 100;
export const EMPRESAS_LOCAL_READ_MAX_SEARCH_LEN = 120;

/** Mutation-shaped tokens the pilot refuses (defense in depth; the pilot is read-only). */
export const EMPRESAS_LOCAL_READ_MUTATION_TOKENS = [
  'create', 'update', 'delete', 'upsert', 'save', 'patch', 'post', 'put',
  'remove', 'bulkcreate', 'bulkupdate', 'bulkdelete', 'prisma', 'migration', 'seed', 'sync',
];

export const EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG = 'MAK_EMPRESAS_LOCAL_READ_CONTRACT_PILOT';
export const EMPRESAS_LOCAL_SYNTHETIC_FIXTURES_FLAG = 'MAK_EMPRESAS_LOCAL_SYNTHETIC_FIXTURES';
export const EMPRESAS_LOCAL_RUNTIME_PARITY_FLAG = 'MAK_EMPRESAS_LOCAL_RUNTIME_PARITY';

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
  const requested = env[flag] === 'true' || env[EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG] === 'true';
  if (!requested) return false;
  // The pilot is local-only: it fails closed in production, with NO allow-prod escape.
  return !isProductionEnv(env);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalReadContractPilotEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalSyntheticFixturesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_SYNTHETIC_FIXTURES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalRuntimeParityEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_RUNTIME_PARITY_FLAG);
}

export default {
  EMPRESAS_LOCAL_READ_PILOT_MODE,
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
  EMPRESAS_LOCAL_READ_SOURCE,
};
