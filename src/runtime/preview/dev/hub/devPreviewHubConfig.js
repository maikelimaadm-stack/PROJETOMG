/** Dev-only opt-in flag for the runtime v2 preview hub. Off by default; only `'true'` enables. */
export const RUNTIME_V2_DEV_PREVIEW_HUB_FLAG = 'MAK_RUNTIME_V2_DEV_PREVIEW_HUB';

/** Explicit, documented escape hatch to allow the hub in a production build. Off by default. */
export const RUNTIME_V2_DEV_PREVIEW_HUB_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_DEV_PREVIEW_HUB_ALLOW_PROD';

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

/** @param {Record<string, unknown>} e */
export function isProductionEnv(e) {
  return e.PROD === true || e.PROD === 'true' || e.NODE_ENV === 'production' || e.MODE === 'production';
}

/** @param {Record<string, unknown>} [env] @returns {'production'|'development'} */
export function detectEnvLabel(env) {
  return isProductionEnv(env ?? resolveEnv()) ? 'production' : 'development';
}

/**
 * Whether the runtime v2 dev preview HUB is enabled. Off by default. Requires
 * the opt-in flag AND a non-production environment — in production it FAILS
 * CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * @param {Record<string, unknown>} [env] Explicit env (for testing); defaults to import.meta.env/process.env.
 * @returns {boolean}
 */
export function isRuntimeV2DevPreviewHubEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[RUNTIME_V2_DEV_PREVIEW_HUB_FLAG] !== 'true') return false;
  if (!isProductionEnv(e)) return true;
  return e[RUNTIME_V2_DEV_PREVIEW_HUB_ALLOW_PROD_FLAG] === 'true';
}
