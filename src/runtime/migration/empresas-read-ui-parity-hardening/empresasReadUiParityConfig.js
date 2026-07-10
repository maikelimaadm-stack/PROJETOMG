import { detectEnvLabel } from '../../preview/dev/hub/devPreviewHubConfig.js';
import { EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG } from '../empresas-guarded-read-ui/overlay/empresasGuardedReadUiOverlayConfig.js';

/** Dev-only opt-in flag for the Empresas read UI parity hardening. Off by default; only `'true'` enables. */
export const EMPRESAS_READ_UI_PARITY_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING';

/** Explicit, documented escape hatch to allow the hardening in a production build. Off by default. */
export const EMPRESAS_READ_UI_PARITY_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING_ALLOW_PROD';

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
export function isEmpresasReadUiParityProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the Empresas read UI parity hardening is enabled. Off by default.
 * Requires the opt-in flag AND a non-production environment — in production it
 * FAILS CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * This is a passive analysis layer: enabling it never enables any write.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasReadUiParityEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[EMPRESAS_READ_UI_PARITY_FLAG] !== 'true') return false;
  if (detectEnvLabel(e) !== 'production') return true;
  return e[EMPRESAS_READ_UI_PARITY_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the flag is on but production blocks it (fail-closed).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasReadUiParityProductionBlocked(env) {
  const e = env ?? resolveEnv();
  return e[EMPRESAS_READ_UI_PARITY_FLAG] === 'true'
    && detectEnvLabel(e) === 'production'
    && e[EMPRESAS_READ_UI_PARITY_ALLOW_PROD_FLAG] !== 'true';
}

/**
 * The hardening analyzes the read UI overlay. When the hardening is enabled
 * (dev, or explicit prod override), this enriches the env so the overlay it
 * inspects is permitted — WITHOUT ever weakening the overlay's own production
 * fail-closed behavior (the hardening's own gate already blocked production). It
 * NEVER enables any write flag.
 * @param {Record<string, unknown>} [env]
 * @returns {Record<string, unknown>}
 */
export function composeParityEnv(env) {
  const e = { ...(env ?? {}) };
  return {
    ...e,
    [EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG]: 'true',
  };
}
