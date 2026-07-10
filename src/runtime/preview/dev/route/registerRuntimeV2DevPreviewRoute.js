import { detectEnvLabel } from '../hub/devPreviewHubConfig.js';
import {
  isRuntimeV2DevPreviewRouteEnabled,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG,
} from './devPreviewRouteConfig.js';

/**
 * Whether the current environment is a development environment for the
 * purposes of mounting the dev-only route. True when Vite's
 * `import.meta.env.DEV` is set, when the environment label is development, or
 * when the explicit production override flag is present (the only way it may
 * be true in a production build). Under `node --test`, `DEV` is undefined and
 * the environment defaults to development.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isRuntimeV2DevEnvironment(env) {
  const e = env ?? {};
  if (e.DEV === true || e.DEV === 'true') return true;
  if (e[RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG] === 'true') return true;
  return detectEnvLabel(e) === 'development';
}

/**
 * The single mount gate: whether the dev-only runtime v2 preview route should
 * be mounted into a router. Requires BOTH a development environment (or the
 * explicit production override) AND the route opt-in flag. Off by default;
 * fails closed in production.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function shouldMountRuntimeV2DevPreviewRoute(env) {
  return isRuntimeV2DevEnvironment(env) && isRuntimeV2DevPreviewRouteEnabled(env);
}

/**
 * Deterministic, plain mount plan for the dev-only route — the safe, framework
 * free contract a router uses to decide whether/where to mount. It never
 * renders, never touches real data, never registers into the main menu.
 *
 * A router (e.g. `src/App.jsx`) opts in with a single dev-guarded line inside
 * its `<Routes>`:
 *
 *   {shouldMountRuntimeV2DevPreviewRoute() && (
 *     <Route path={RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH} element={<RuntimeV2DevPreviewRoute />} />
 *   )}
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {import('../../../types/dev-preview-route-mount.js').RuntimeV2DevPreviewRouteMountPlan}
 */
export function getRuntimeV2DevPreviewRouteMountPlan(options = {}) {
  const env = options.env;
  const dev = isRuntimeV2DevEnvironment(env);
  const routeEnabled = isRuntimeV2DevPreviewRouteEnabled(env);
  const shouldMount = dev && routeEnabled;
  let reason;
  if (shouldMount) reason = 'mountable';
  else if (!dev) reason = 'not a development environment';
  else reason = 'route flag off or production-blocked';
  return {
    path: RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH,
    shouldMount,
    devOnly: true,
    inMainMenu: false,
    publicRoute: false,
    production: detectEnvLabel(env) === 'production',
    reason,
  };
}

export { RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH };
