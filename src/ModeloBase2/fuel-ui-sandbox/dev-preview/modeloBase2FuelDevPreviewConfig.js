/**
 * Config + guard for the ModeloBase2 FUEL DEV PREVIEW ROUTE. Dev-only, opt-in,
 * fails closed in production. The route NEVER appears in the menu, NEVER touches
 * a backend/Prisma/fetch/runtimeBridge, NEVER persists for real. Mirrors the
 * established `runtime-v2` dev-preview route pattern but self-contained (no
 * `src/runtime/preview` import) so ModeloBase2 stays decoupled.
 *
 * File lives under `src/ModeloBase2/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`. NO React import (pure config).
 */

/** The dev-only route path. Never a production route, never in the menu. */
export const MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH = '/__dev/modelobase2/fuel';

/** Dev-only opt-in flag for the preview route. Off by default; only `'true'` enables. */
export const MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG = 'MAK_MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE';

/** Explicit, documented escape hatch to allow the route in a production build. Off by default. */
export const MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD';

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

/**
 * Detects the environment label ('production' / 'development' / other) from an
 * env bag. Self-contained (no runtime import).
 * @param {Record<string, unknown>} env
 * @returns {'production'|'development'|'other'}
 */
export function detectFuelDevEnvLabel(env) {
  const e = env ?? {};
  if (e.DEV === true || e.DEV === 'true') return 'development';
  const label = String(e.MAK_ENV_LABEL || e.VITE_ENV_LABEL || '').toLowerCase();
  if (label === 'production') return 'production';
  if (label === 'development') return 'development';
  const mode = String(e.MODE || '').toLowerCase();
  if (mode === 'production') return 'production';
  if (mode === 'development') return 'development';
  const nodeEnv = String(e.NODE_ENV || '').toLowerCase();
  if (nodeEnv === 'production') return 'production';
  if (e.PROD === true || e.PROD === 'true') return 'production';
  // Under `node --test`, DEV/MODE/NODE_ENV are typically undefined → development.
  if (nodeEnv === 'test' || nodeEnv === 'development' || nodeEnv === '') return 'development';
  return 'other';
}

/** @param {Record<string, unknown>} [env] */
export function isFuelDevPreviewProductionEnv(env) {
  return detectFuelDevEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the dev-only preview ROUTE is enabled. Off by default. Requires the
 * route opt-in flag AND a non-production environment — in production it FAILS
 * CLOSED unless the explicit `*_ALLOW_PROD` override is set.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase2FuelDevPreviewRouteEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG] !== 'true') return false;
  if (detectFuelDevEnvLabel(e) !== 'production') return true;
  return e[MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the current environment is a development environment for mounting the
 * dev-only route (or the explicit production override is present).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase2FuelDevEnvironment(env) {
  const e = env ?? resolveEnv();
  if (e.DEV === true || e.DEV === 'true') return true;
  if (e[MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG] === 'true') return true;
  return detectFuelDevEnvLabel(e) === 'development';
}

/**
 * The single mount gate: whether the dev-only fuel preview route should be
 * mounted into a router. Requires BOTH a development environment (or the explicit
 * production override) AND the route opt-in flag. Off by default; fails closed in
 * production.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function shouldMountModeloBase2FuelDevPreviewRoute(env) {
  return isModeloBase2FuelDevEnvironment(env) && isModeloBase2FuelDevPreviewRouteEnabled(env);
}

export default shouldMountModeloBase2FuelDevPreviewRoute;
