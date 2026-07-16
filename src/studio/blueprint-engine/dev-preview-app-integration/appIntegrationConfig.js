/**
 * Config + flags for the STUDIO DEV PREVIEW APP INTEGRATION (minimal, additive, dev-only mount).
 *
 * This is the FIRST authorized integration of the isolated Studio Dev Preview into the main App. It
 * is strictly MINIMAL, ADDITIVE, DEV-ONLY, DEFAULT-OFF, FAIL-CLOSED and SYNTHETIC-DATA-ONLY. It adds
 * exactly ONE dev-only surface at the internal path `/__dev/studio/preview`, mounted only through the
 * sanctioned dev-route pattern already used by `__dev/runtime-v2/previews` and `__dev/modelobase2/fuel`.
 *
 * The route is gated by `shouldMountStudioDevPreviewRoute()`: it requires an explicit opt-in flag AND
 * an explicit checkpoint receipt AND a development environment, and FAILS CLOSED in production/staging.
 * The preview is lazy-loaded (the App wraps the lazy import behind a build-time `import.meta.env.DEV`
 * so the production bundle strips the preview chunk entirely). It mounts ONLY the isolated host from
 * `src/studio/blueprint-engine/dev-preview-route-menu/`, consumes only synthetic data, never registers
 * a menu/sidebar/public route, never touches backend/Prisma/real data, and NEVER imports or relinks
 * the old Studio prototype. Reversible by flag-off and by removing the additive App block.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). The `.jsx` boundaries in this subtree use the automatic
 * JSX runtime. No `.tsx`, no `.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const APP_INTEGRATION_NAME = 'studio-dev-preview-app-integration';
export const APP_INTEGRATION_SEMVER = '1.0.0';
export const APP_INTEGRATION_VERSION = 'studio-dev-preview-app-integration@1.0.0';
export const APP_INTEGRATION_MODE = 'dev_only_app_integration';

/** Upstream references (consumed read-only). */
export const APP_INTEGRATION_CONTRACT_VERSION = 'studio-dev-preview-app-integration-contract@1.0.0';
export const APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-app-integration-implementation-plan@1.0.0';
export const ROUTE_MENU_VERSION = 'studio-dev-preview-route-menu@1.0.0';
export const RUNTIME_UI_VERSION = 'studio-dev-preview-runtime-ui@1.0.0';

/** The single dev-only route path exposed by this integration. Never a production/public route. */
export const STUDIO_DEV_PREVIEW_ROUTE_PATH = '/__dev/studio/preview';

/** Dev-only opt-in flag for the route. Off by default; only the exact string `'true'` enables. */
export const STUDIO_DEV_PREVIEW_ROUTE_FLAG = 'MAK_STUDIO_DEV_PREVIEW';

/** Env flag carrying the checkpoint receipt required to mount the route. */
export const STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_CHECKPOINT';

/** The exact checkpoint receipt value a valid mount requires (strict equality — no permissive fallback). */
export const REQUIRED_CHECKPOINT_RECEIPT = 'approved_for_app_integration_slice';

/** The isolated host subtree this integration mounts (metadata only — referenced, never relinked). */
export const ISOLATED_HOST_SUBTREE = 'src/studio/blueprint-engine/dev-preview-route-menu/';

/** Old Studio prototype paths that must NEVER be imported/relinked. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications this integration can emit. */
export const APP_INTEGRATION_READINESS_STATES = Object.freeze([
  'studio_dev_preview_app_integration_ready',
  'needs_route_menu_runtime_fix', 'needs_app_integration_contract_fix', 'blocked', 'invalid',
]);

/**
 * Immutable capability flags. This slice DOES integrate a dev-only route into the App (appTouched,
 * appWiringImplemented, productionUiGuardExtended, featureFlagImplemented/connected, devRouteAttached,
 * runtimeUiMountedInApp are TRUE — but strictly dev-only / default-off / lazy / synthetic). Every
 * product exposure / eager-import / production-bundle / real-data / backend / prototype capability is
 * FALSE.
 */
export const APP_INTEGRATION_CAPABILITIES = Object.freeze({
  devOnly: true,
  defaultOff: true,
  isolated: true,
  failClosed: true,
  syntheticDataOnly: true,
  appIntegrated: true,
  appTouched: true,
  appWiringImplemented: true,
  productionUiGuardExtended: true,
  featureFlagImplemented: true,
  featureFlagConnectedToApp: true,
  routerWiringImplemented: false,
  devRouteAttached: true,
  routeExposedToProduct: false,
  menuExposedToProduct: false,
  sidebarExposedToProduct: false,
  runtimeUiMountedInApp: true,
  runtimeUiMountedByDefault: false,
  lazyImportUsed: true,
  eagerImportUsed: false,
  productionBundleContainsPreview: false,
  reactDomUsed: false,
  createRootUsed: false,
  windowUsed: false,
  documentUsed: false,
  deepLinkPublic: false,
  moduleGenerated: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  mutationAllowed: false,
  persistenceCreated: false,
  realDataRead: false,
  realDataWrite: false,
  rewriteEmpresas: false,
  prototypeRelinked: false,
  rollbackByFlagOff: true,
  rollbackByRemovingAdditiveBlock: true,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function appIntegrationDigest(value) {
  return createGenericModelChecksum({ value: value ?? null });
}

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

/** @param {Record<string, unknown>} env @returns {string} */
export function resolveEnvironmentLabel(env) {
  const e = env && typeof env === 'object' ? env : {};
  if (e.DEV === true || e.DEV === 'true') return 'development';
  const label = String(e.MAK_ENV_LABEL || e.VITE_ENV_LABEL || '').toLowerCase();
  if (label) return label;
  const mode = String(e.MODE || '').toLowerCase();
  if (mode) return mode;
  const nodeEnv = String(e.NODE_ENV || '').toLowerCase();
  if (nodeEnv) return nodeEnv;
  if (e.PROD === true || e.PROD === 'true') return 'production';
  return 'unknown';
}

/** @param {Record<string, unknown>} env @returns {boolean} */
export function isDevelopmentEnvironment(env) {
  return resolveEnvironmentLabel(env) === 'development';
}

/**
 * True when ANY environment source names production or staging — checked independently of the `DEV`
 * shortcut so production/staging FAIL CLOSED even if a `DEV` flag is also present. Pure.
 * @param {Record<string, unknown>} env @returns {boolean}
 */
export function isProductionOrStaging(env) {
  const e = env && typeof env === 'object' ? env : {};
  if (e.PROD === true || e.PROD === 'true') return true;
  const sources = [e.MAK_ENV_LABEL, e.VITE_ENV_LABEL, e.MODE, e.NODE_ENV];
  for (const s of sources) {
    const label = String(s ?? '').toLowerCase();
    if (label === 'production' || label === 'staging') return true;
  }
  return false;
}

/**
 * The single mount gate: whether the dev-only Studio Dev Preview route should be mounted into the
 * App router. Off by default. Requires, with STRICT equality and no permissive fallback:
 *   - a development environment (never production/staging);
 *   - the route opt-in flag exactly `'true'`;
 *   - the checkpoint receipt flag exactly equal to `REQUIRED_CHECKPOINT_RECEIPT`.
 * Returns false in production, staging, when the flag is absent/false/invalid, when the checkpoint is
 * absent/invalid, or when the environment is not development. Pure — reads env only; no side effects.
 *
 * @param {Record<string, unknown>} [env] explicit env (for testing); defaults to import.meta.env/process.env.
 * @returns {boolean}
 */
export function shouldMountStudioDevPreviewRoute(env) {
  const e = env ?? resolveEnv();
  if (isProductionOrStaging(e)) return false;
  if (!isDevelopmentEnvironment(e)) return false;
  if (e[STUDIO_DEV_PREVIEW_ROUTE_FLAG] !== 'true') return false;
  if (e[STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG] !== REQUIRED_CHECKPOINT_RECEIPT) return false;
  return true;
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteFlagEnabled(env) {
  const e = env ?? resolveEnv();
  return e[STUDIO_DEV_PREVIEW_ROUTE_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewCheckpointApproved(env) {
  const e = env ?? resolveEnv();
  return e[STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG] === REQUIRED_CHECKPOINT_RECEIPT;
}

export default {
  APP_INTEGRATION_VERSION,
  APP_INTEGRATION_CAPABILITIES,
  STUDIO_DEV_PREVIEW_ROUTE_PATH,
  shouldMountStudioDevPreviewRoute,
};
