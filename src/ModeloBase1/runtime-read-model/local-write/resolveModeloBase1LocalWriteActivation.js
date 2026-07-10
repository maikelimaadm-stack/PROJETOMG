import { isModeloBase1LocalWritePlanEnabled } from './modeloBase1LocalWriteConfig.js';

/**
 * Feature flags for the ModeloBase1 CONTROLLED LOCAL WRITE ACTIVATION. Dev-only,
 * off by default, fail-closed in production unless the matching `*_ALLOW_PROD`
 * override is set. Activation NEVER enables a backend/Prisma/storage write — it
 * only lets the in-memory local write controller drive the beta UI.
 *
 * Activation additionally REQUIRES the beta read model to be applied AND the
 * local write PLAN to be enabled — it can never turn on standalone.
 */
export const MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_FLAG = 'MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION';
export const EMPRESAS_LOCAL_WRITE_ACTIVATION_FLAG = 'MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION';
export const CADCPS_LOCAL_WRITE_ACTIVATION_FLAG = 'MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_ACTIVATION';

export const MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_ALLOW_PROD';
export const EMPRESAS_LOCAL_WRITE_ACTIVATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION_ALLOW_PROD';
export const CADCPS_LOCAL_WRITE_ACTIVATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_ACTIVATION_ALLOW_PROD';

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

/** @param {Record<string, unknown>} env @param {string} moduleFlag @param {string} allowProd */
function activationRequested(env, moduleFlag, allowProd) {
  const requested = env[moduleFlag] === 'true' || env[MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[allowProd] === 'true' || env[MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the activation flag is requested for a module (respecting prod
 * fail-closed). Does NOT check beta/plan preconditions — see
 * `resolveModeloBase1LocalWriteActivation`.
 * @param {string} moduleId
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase1LocalWriteActivationRequested(moduleId, env) {
  const e = env ?? resolveEnv();
  if (moduleId === 'empresas') return activationRequested(e, EMPRESAS_LOCAL_WRITE_ACTIVATION_FLAG, EMPRESAS_LOCAL_WRITE_ACTIVATION_ALLOW_PROD_FLAG);
  if (moduleId === 'cadcps') return activationRequested(e, CADCPS_LOCAL_WRITE_ACTIVATION_FLAG, CADCPS_LOCAL_WRITE_ACTIVATION_ALLOW_PROD_FLAG);
  return e[MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_FLAG] === 'true'
    && (!isProductionEnv(e) || e[MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_ALLOW_PROD_FLAG] === 'true');
}

/**
 * Resolves whether controlled local write is ACTIVE for a module. Requires all
 * three: the activation flag, the local write PLAN flag, and the beta read model
 * applied. Pure and side-effect-free.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.readState] Applied runtime read state (needs betaApplied).
 * @param {Record<string, unknown>} [options.env]
 * @returns {{ moduleId: string, activationRequested: boolean, planEnabled: boolean, betaApplied: boolean, activationApplied: boolean, readOnlyFallback: boolean, reason: string|null }}
 */
export function resolveModeloBase1LocalWriteActivation(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const readState = o.readState && typeof o.readState === 'object' ? o.readState : null;
  const moduleId = typeof o.moduleId === 'string'
    ? o.moduleId
    : (readState && typeof readState.moduleId === 'string' ? readState.moduleId : 'unknown');
  const env = o.env;

  const requested = isModeloBase1LocalWriteActivationRequested(moduleId, env);
  const planEnabled = isModeloBase1LocalWritePlanEnabled(moduleId, env);
  const betaApplied = Boolean(readState && readState.betaApplied === true);
  const activationApplied = requested && planEnabled && betaApplied;

  let reason = null;
  if (!activationApplied) {
    if (!requested) reason = 'activation-flag-off';
    else if (!planEnabled) reason = 'local-write-plan-off';
    else if (!betaApplied) reason = 'beta-read-model-off';
  }

  return {
    moduleId,
    activationRequested: requested,
    planEnabled,
    betaApplied,
    activationApplied,
    readOnlyFallback: !activationApplied,
    reason,
  };
}

export default resolveModeloBase1LocalWriteActivation;
