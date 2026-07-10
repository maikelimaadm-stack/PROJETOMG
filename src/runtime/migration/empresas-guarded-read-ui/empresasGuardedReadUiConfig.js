import { detectEnvLabel } from '../../preview/dev/hub/devPreviewHubConfig.js';
import { EMPRESAS_READONLY_FLAG } from '../empresas-readonly/empresasReadOnlyConfig.js';
import { EMPRESAS_DUAL_READ_FLAG } from '../empresas-dual-read/empresasDualReadConfig.js';

/** Dev-only opt-in flag for the Empresas guarded read UI slice. Off by default; only `'true'` enables. */
export const EMPRESAS_GUARDED_READ_UI_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI';

/** Explicit, documented escape hatch to allow the slice in a production build. Off by default. */
export const EMPRESAS_GUARDED_READ_UI_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_ALLOW_PROD';

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
export function isEmpresasGuardedReadUiProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the Empresas guarded read UI slice is enabled. Off by default.
 * Requires the opt-in flag AND a non-production environment — in production it
 * FAILS CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * This is a read-only capability: enabling it never enables any write.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasGuardedReadUiEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[EMPRESAS_GUARDED_READ_UI_FLAG] !== 'true') return false;
  if (detectEnvLabel(e) !== 'production') return true;
  return e[EMPRESAS_GUARDED_READ_UI_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the flag is on but production blocks it (fail-closed).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasGuardedReadUiProductionBlocked(env) {
  const e = env ?? resolveEnv();
  return e[EMPRESAS_GUARDED_READ_UI_FLAG] === 'true'
    && detectEnvLabel(e) === 'production'
    && e[EMPRESAS_GUARDED_READ_UI_ALLOW_PROD_FLAG] !== 'true';
}

/**
 * The guarded read UI is a higher-level feature that composes the underlying
 * read-only + dual-read reads. When the guarded UI is enabled (dev, or explicit
 * prod override), this enriches the env so the sub-reads it depends on are on —
 * without ever weakening their own production fail-closed behavior (the guarded
 * UI's own gate already blocked production). It NEVER enables any write flag.
 * @param {Record<string, unknown>} [env]
 * @returns {Record<string, unknown>}
 */
export function composeGuardedReadUiEnv(env) {
  const e = { ...(env ?? {}) };
  return {
    ...e,
    [EMPRESAS_READONLY_FLAG]: 'true',
    [EMPRESAS_DUAL_READ_FLAG]: 'true',
  };
}
