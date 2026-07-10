import { resolveModeloBase1LocalWriteActivation } from '../resolveModeloBase1LocalWriteActivation.js';

/**
 * Feature flags for the ModeloBase1 LOCAL PERSISTENCE VALIDATION. Dev-only, off
 * by default, fail-closed in production unless the matching `*_ALLOW_PROD`
 * override is set. Enabling validation NEVER enables real persistence — it only
 * makes the in-memory validation surface available. It additionally REQUIRES the
 * full local write activation chain (beta + plan + activation).
 */
export const MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_FLAG = 'MAK_MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION';
export const EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_FLAG = 'MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION';
export const CADCPS_LOCAL_PERSISTENCE_VALIDATION_FLAG = 'MAK_MODELOBASE1_CADCPS_LOCAL_PERSISTENCE_VALIDATION';

export const MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD';
export const EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD';
export const CADCPS_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_CADCPS_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD';

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
function validationRequested(env, moduleFlag, allowProd) {
  const requested = env[moduleFlag] === 'true' || env[MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[allowProd] === 'true' || env[MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the validation flag is requested for a module (respecting prod
 * fail-closed). Does NOT check the beta/plan/activation preconditions.
 * @param {string} moduleId
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase1LocalPersistenceValidationRequested(moduleId, env) {
  const e = env ?? resolveEnv();
  if (moduleId === 'empresas') return validationRequested(e, EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_FLAG, EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD_FLAG);
  if (moduleId === 'cadcps') return validationRequested(e, CADCPS_LOCAL_PERSISTENCE_VALIDATION_FLAG, CADCPS_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD_FLAG);
  return e[MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_FLAG] === 'true'
    && (!isProductionEnv(e) || e[MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD_FLAG] === 'true');
}

/**
 * Resolves whether local persistence VALIDATION is enabled for a module.
 * Requires the validation flag AND the full local write activation chain
 * (beta + plan + activation). Pure.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.readState] Applied runtime read state (needs betaApplied).
 * @param {Record<string, unknown>} [options.env]
 * @returns {{ moduleId: string, validationRequested: boolean, activationApplied: boolean, enabled: boolean, reason: string|null }}
 */
export function resolveModeloBase1LocalPersistenceValidation(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const readState = o.readState && typeof o.readState === 'object' ? o.readState : null;
  const moduleId = typeof o.moduleId === 'string'
    ? o.moduleId
    : (readState && typeof readState.moduleId === 'string' ? readState.moduleId : 'unknown');
  const env = o.env;

  const requested = isModeloBase1LocalPersistenceValidationRequested(moduleId, env);
  const activation = resolveModeloBase1LocalWriteActivation({ moduleId, readState, env });
  const enabled = requested && activation.activationApplied;

  let reason = null;
  if (!enabled) {
    if (!requested) reason = 'validation-flag-off';
    else if (!activation.activationApplied) reason = `activation-off:${activation.reason}`;
  }
  return { moduleId, validationRequested: requested, activationApplied: activation.activationApplied, enabled, reason };
}

/** @param {string} moduleId @param {Record<string, unknown>} [env] */
export function isEmpresasLocalPersistenceValidationEnabled(env) {
  return resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: { moduleId: 'empresas', betaApplied: true }, env }).enabled;
}
