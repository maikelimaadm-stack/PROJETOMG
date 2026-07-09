/**
 * Harness-specific opt-in flag. Off by default; only `'true'` enables the
 * dev-only preview harness. Separate from the base dev-preview flag so the
 * harness (which mounts a page-like wrapper) can be gated independently.
 */
export const EMPRESAS_DEV_PREVIEW_HARNESS_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_HARNESS';

/** Explicit, documented escape hatch to allow the harness in a production build. Off by default. */
export const EMPRESAS_DEV_PREVIEW_HARNESS_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_HARNESS_ALLOW_PROD';

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

/**
 * Whether the dev-only preview HARNESS is enabled. Off by default. It requires
 * the harness opt-in flag AND a non-production environment — in production it
 * FAILS CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * @param {Record<string, unknown>} [env] Explicit env (for testing); defaults to import.meta.env/process.env.
 * @returns {boolean}
 */
export function isEmpresasDevPreviewHarnessEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[EMPRESAS_DEV_PREVIEW_HARNESS_FLAG] !== 'true') return false;
  const isProd = e.PROD === true || e.PROD === 'true' || e.NODE_ENV === 'production' || e.MODE === 'production';
  if (!isProd) return true;
  return e[EMPRESAS_DEV_PREVIEW_HARNESS_ALLOW_PROD_FLAG] === 'true';
}
