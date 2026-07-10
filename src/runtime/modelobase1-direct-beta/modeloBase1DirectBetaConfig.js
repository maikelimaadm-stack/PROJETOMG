import { detectEnvLabel } from '../preview/dev/hub/devPreviewHubConfig.js';

/**
 * Feature flags for the ModeloBase1 DIRECT BETA activation.
 *
 * These are dev-only opt-in flags. Off by default; only the literal string
 * `'true'` enables. In a production environment each flag FAILS CLOSED unless
 * its explicit, documented `*_ALLOW_PROD` escape hatch is also `'true'`.
 *
 * There is a per-module flag for Empresas and for Campos Personalizados
 * (cadcps), plus an optional umbrella flag that enables both at once. The
 * umbrella never widens scope beyond these two beta screens.
 */

/** Per-module flag — Cadastro de Empresa beta read model. */
export const EMPRESAS_MODELOBASE1_BETA_FLAG = 'MAK_MODELOBASE1_EMPRESAS_BETA';
/** Per-module flag — Campos Personalizados (cadcps) beta read model. */
export const CADCPS_MODELOBASE1_BETA_FLAG = 'MAK_MODELOBASE1_CADCPS_BETA';
/** Umbrella flag — enables both Empresas and Campos beta read models. */
export const MODELOBASE1_DIRECT_BETA_FLAG = 'MAK_MODELOBASE1_DIRECT_BETA';

/** Explicit, documented production escape hatch for Empresas. Off by default. */
export const EMPRESAS_MODELOBASE1_BETA_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_EMPRESAS_BETA_ALLOW_PROD';
/** Explicit, documented production escape hatch for Campos. Off by default. */
export const CADCPS_MODELOBASE1_BETA_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_CADCPS_BETA_ALLOW_PROD';
/** Explicit, documented production escape hatch for the umbrella. Off by default. */
export const MODELOBASE1_DIRECT_BETA_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_DIRECT_BETA_ALLOW_PROD';

/**
 * Resolves the effective env bag. In Vite this reads `import.meta.env`; under
 * `node --test` that is undefined, so it falls back to `process.env`.
 * @returns {Record<string, unknown>}
 */
function resolveEnv() {
  /** @type {Record<string, unknown>} */
  let metaEnv = {};
  try {
    metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  } catch {
    metaEnv = {};
  }
  const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
  return { ...procEnv, ...metaEnv };
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase1DirectBetaProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Core resolver: a beta read model is enabled when its own flag OR the umbrella
 * flag is on, AND the environment allows it (non-production, or the matching
 * explicit `*_ALLOW_PROD` override is set in production).
 *
 * @param {Record<string, unknown>} env
 * @param {string} moduleFlag
 * @param {string} moduleAllowProdFlag
 * @returns {boolean}
 */
function resolveEnabled(env, moduleFlag, moduleAllowProdFlag) {
  const requested = env[moduleFlag] === 'true' || env[MODELOBASE1_DIRECT_BETA_FLAG] === 'true';
  if (!requested) return false;
  if (detectEnvLabel(env) !== 'production') return true;
  return env[moduleAllowProdFlag] === 'true' || env[MODELOBASE1_DIRECT_BETA_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the flag was requested (own or umbrella) but production blocks it —
 * used to distinguish "off" from "fail-closed in production" in diagnostics.
 * @param {Record<string, unknown>} env
 * @param {string} moduleFlag
 * @param {string} moduleAllowProdFlag
 * @returns {boolean}
 */
function resolveProductionBlocked(env, moduleFlag, moduleAllowProdFlag) {
  const requested = env[moduleFlag] === 'true' || env[MODELOBASE1_DIRECT_BETA_FLAG] === 'true';
  if (!requested) return false;
  if (detectEnvLabel(env) !== 'production') return false;
  return !(env[moduleAllowProdFlag] === 'true' || env[MODELOBASE1_DIRECT_BETA_ALLOW_PROD_FLAG] === 'true');
}

/**
 * Whether the Empresas ModeloBase1 beta read model is enabled. Off by default;
 * fail-closed in production unless the explicit override is set. Enabling it
 * never enables any write.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasModeloBase1BetaEnabled(env) {
  return resolveEnabled(env ?? resolveEnv(), EMPRESAS_MODELOBASE1_BETA_FLAG, EMPRESAS_MODELOBASE1_BETA_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasModeloBase1BetaProductionBlocked(env) {
  return resolveProductionBlocked(env ?? resolveEnv(), EMPRESAS_MODELOBASE1_BETA_FLAG, EMPRESAS_MODELOBASE1_BETA_ALLOW_PROD_FLAG);
}

/**
 * Whether the Campos Personalizados (cadcps) ModeloBase1 beta read model is
 * enabled. Off by default; fail-closed in production unless the explicit
 * override is set. Enabling it never enables any write.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isCadcpsModeloBase1BetaEnabled(env) {
  return resolveEnabled(env ?? resolveEnv(), CADCPS_MODELOBASE1_BETA_FLAG, CADCPS_MODELOBASE1_BETA_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isCadcpsModeloBase1BetaProductionBlocked(env) {
  return resolveProductionBlocked(env ?? resolveEnv(), CADCPS_MODELOBASE1_BETA_FLAG, CADCPS_MODELOBASE1_BETA_ALLOW_PROD_FLAG);
}

/**
 * Whether the direct beta is enabled for at least one of the two screens.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase1DirectBetaEnabled(env) {
  const e = env ?? resolveEnv();
  return isEmpresasModeloBase1BetaEnabled(e) || isCadcpsModeloBase1BetaEnabled(e);
}
