import { detectEnvLabel } from '../../preview/dev/hub/devPreviewHubConfig.js';
import { EMPRESAS_READ_UI_PARITY_FLAG } from '../empresas-read-ui-parity-hardening/empresasReadUiParityConfig.js';

/** Dev-only opt-in flag for the Empresas read UI runtime bridge dry run. Off by default; only `'true'` enables. */
export const EMPRESAS_BRIDGE_DRY_RUN_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN';

/** Explicit, documented escape hatch to allow the dry run in a production build. Off by default. */
export const EMPRESAS_BRIDGE_DRY_RUN_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN_ALLOW_PROD';

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
export function isEmpresasBridgeDryRunProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the Empresas read UI runtime bridge dry run is enabled. Off by default.
 * Requires the opt-in flag AND a non-production environment — in production it
 * FAILS CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * This is a simulation-only layer: enabling it never enables any write and never
 * mounts anything real.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasBridgeDryRunEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[EMPRESAS_BRIDGE_DRY_RUN_FLAG] !== 'true') return false;
  if (detectEnvLabel(e) !== 'production') return true;
  return e[EMPRESAS_BRIDGE_DRY_RUN_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the flag is on but production blocks it (fail-closed).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasBridgeDryRunProductionBlocked(env) {
  const e = env ?? resolveEnv();
  return e[EMPRESAS_BRIDGE_DRY_RUN_FLAG] === 'true'
    && detectEnvLabel(e) === 'production'
    && e[EMPRESAS_BRIDGE_DRY_RUN_ALLOW_PROD_FLAG] !== 'true';
}

/**
 * The dry run analyzes the read UI parity hardening (which composes the whole
 * read chain). When the dry run is enabled (dev, or explicit prod override), this
 * enriches the env so the hardening it inspects is permitted — WITHOUT ever
 * weakening the hardening's own production fail-closed behavior (the dry run's own
 * gate already blocked production). It NEVER enables any write flag and NEVER
 * mounts anything.
 * @param {Record<string, unknown>} [env]
 * @returns {Record<string, unknown>}
 */
export function composeDryRunEnv(env) {
  const e = { ...(env ?? {}) };
  return {
    ...e,
    [EMPRESAS_READ_UI_PARITY_FLAG]: 'true',
  };
}
