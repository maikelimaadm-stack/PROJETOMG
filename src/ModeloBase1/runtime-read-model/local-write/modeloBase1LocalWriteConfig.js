/**
 * Feature flags for the ModeloBase1 CONTROLLED LOCAL WRITE PLAN.
 *
 * Dev-only opt-in flags. Off by default; only `'true'` enables. Fail-closed in
 * production unless the matching `*_ALLOW_PROD` override is set. Enabling a plan
 * flag NEVER enables any backend/Prisma/storage write — it only makes the
 * in-memory local write plan/controller available.
 *
 * Self-contained (no `src/runtime` import) so the ModeloBase1 engine stays
 * decoupled from the runtime module.
 */

/** Umbrella flag — enables the local write plan for both screens. */
export const MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_FLAG = 'MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN';
/** Per-module flag — Empresas local write plan. */
export const EMPRESAS_LOCAL_WRITE_PLAN_FLAG = 'MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN';
/** Per-module flag — Campos Personalizados (cadcps) local write plan. */
export const CADCPS_LOCAL_WRITE_PLAN_FLAG = 'MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_PLAN';

export const MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_ALLOW_PROD';
export const EMPRESAS_LOCAL_WRITE_PLAN_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN_ALLOW_PROD';
export const CADCPS_LOCAL_WRITE_PLAN_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_PLAN_ALLOW_PROD';

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

/**
 * Local production detector (mirrors the runtime's env-label logic without
 * importing it).
 * @param {Record<string, unknown>} env
 * @returns {boolean}
 */
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

/**
 * @param {Record<string, unknown>} env
 * @param {string} moduleFlag
 * @param {string} moduleAllowProdFlag
 * @returns {boolean}
 */
function resolveEnabled(env, moduleFlag, moduleAllowProdFlag) {
  const requested = env[moduleFlag] === 'true' || env[MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[moduleAllowProdFlag] === 'true' || env[MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_ALLOW_PROD_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasLocalWritePlanEnabled(env) {
  return resolveEnabled(env ?? resolveEnv(), EMPRESAS_LOCAL_WRITE_PLAN_FLAG, EMPRESAS_LOCAL_WRITE_PLAN_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isCadcpsLocalWritePlanEnabled(env) {
  return resolveEnabled(env ?? resolveEnv(), CADCPS_LOCAL_WRITE_PLAN_FLAG, CADCPS_LOCAL_WRITE_PLAN_ALLOW_PROD_FLAG);
}

/**
 * Resolves the plan-enabled state for a given moduleId. Unknown modules follow
 * the umbrella flag only.
 * @param {string} moduleId
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase1LocalWritePlanEnabled(moduleId, env) {
  const e = env ?? resolveEnv();
  if (moduleId === 'empresas') return isEmpresasLocalWritePlanEnabled(e);
  if (moduleId === 'cadcps') return isCadcpsLocalWritePlanEnabled(e);
  return e[MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_FLAG] === 'true'
    && (!isProductionEnv(e) || e[MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_ALLOW_PROD_FLAG] === 'true');
}
