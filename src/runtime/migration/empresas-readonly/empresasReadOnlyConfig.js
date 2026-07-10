import { detectEnvLabel } from '../../preview/dev/hub/devPreviewHubConfig.js';

/** Dev-only opt-in flag for the Empresas read-only runtime v2 candidate. Off by default; only `'true'` enables. */
export const EMPRESAS_READONLY_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READONLY';

/** Explicit, documented escape hatch to allow the candidate in a production build. Off by default. */
export const EMPRESAS_READONLY_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READONLY_ALLOW_PROD';

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
export function isEmpresasReadOnlyProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the Empresas read-only candidate is enabled. Off by default. Requires
 * the opt-in flag AND a non-production environment — in production it FAILS
 * CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set. This is
 * a read-only capability: enabling it never enables any write.
 * @param {Record<string, unknown>} [env] Explicit env (for testing); defaults to import.meta.env/process.env.
 * @returns {boolean}
 */
export function isEmpresasReadOnlyEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[EMPRESAS_READONLY_FLAG] !== 'true') return false;
  if (detectEnvLabel(e) !== 'production') return true;
  return e[EMPRESAS_READONLY_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the flag is on but production blocks it (fail-closed) — used to
 * distinguish "off" from "blocked in production" in diagnostics.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasReadOnlyProductionBlocked(env) {
  const e = env ?? resolveEnv();
  return e[EMPRESAS_READONLY_FLAG] === 'true'
    && detectEnvLabel(e) === 'production'
    && e[EMPRESAS_READONLY_ALLOW_PROD_FLAG] !== 'true';
}
