import { detectEnvLabel } from '../../../preview/dev/hub/devPreviewHubConfig.js';
import { EMPRESAS_GUARDED_READ_UI_FLAG } from '../empresasGuardedReadUiConfig.js';

/** Dev-only opt-in flag for the Empresas guarded read UI overlay. Off by default; only `'true'` enables. */
export const EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY';

/** Explicit, documented escape hatch to allow the overlay in a production build. Off by default. */
export const EMPRESAS_GUARDED_READ_UI_OVERLAY_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY_ALLOW_PROD';

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
export function isEmpresasGuardedReadUiOverlayProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the Empresas guarded read UI overlay is enabled. Off by default.
 * Requires the opt-in flag AND a non-production environment — in production it
 * FAILS CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * This is a read-only preview surface: enabling it never enables any write.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasGuardedReadUiOverlayEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG] !== 'true') return false;
  if (detectEnvLabel(e) !== 'production') return true;
  return e[EMPRESAS_GUARDED_READ_UI_OVERLAY_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the flag is on but production blocks it (fail-closed).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasGuardedReadUiOverlayProductionBlocked(env) {
  const e = env ?? resolveEnv();
  return e[EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG] === 'true'
    && detectEnvLabel(e) === 'production'
    && e[EMPRESAS_GUARDED_READ_UI_OVERLAY_ALLOW_PROD_FLAG] !== 'true';
}

/**
 * The overlay is a dev-only preview surface for the guarded read UI. When the
 * overlay is enabled (dev, or explicit prod override), this enriches the env so
 * the guarded read UI it renders is permitted — WITHOUT ever weakening its own
 * production fail-closed behavior (the overlay's own gate already blocked
 * production). It NEVER enables any write flag.
 * @param {Record<string, unknown>} [env]
 * @returns {Record<string, unknown>}
 */
export function composeOverlayEnv(env) {
  const e = { ...(env ?? {}) };
  return {
    ...e,
    [EMPRESAS_GUARDED_READ_UI_FLAG]: 'true',
  };
}
