import { detectEnvLabel } from '../hub/devPreviewHubConfig.js';

/** The dev-only route path. Never a production route, never in the menu. */
export const RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH = '/__dev/runtime-v2/previews';

/** Dev-only opt-in flag for the preview route. Off by default; only `'true'` enables. */
export const RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG = 'MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE';

/** Explicit, documented escape hatch to allow the route in a production build. Off by default. */
export const RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD';

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
export function isRouteProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the dev-only preview ROUTE is enabled. Off by default. Requires the
 * route opt-in flag AND a non-production environment — in production it FAILS
 * CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * @param {Record<string, unknown>} [env] Explicit env (for testing); defaults to import.meta.env/process.env.
 * @returns {boolean}
 */
export function isRuntimeV2DevPreviewRouteEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG] !== 'true') return false;
  if (detectEnvLabel(e) !== 'production') return true;
  return e[RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG] === 'true';
}
