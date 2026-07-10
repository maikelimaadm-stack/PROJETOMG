import { RuntimeV2DevPreviewRoutePage } from './RuntimeV2DevPreviewRoutePage.jsx';
import { isRuntimeV2DevPreviewRouteEnabled, RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH } from './devPreviewRouteConfig.js';

/**
 * Dev-only, opt-in route component for the runtime v2 preview hub. It is an
 * exportable, self-guarding route unit — NOT wired into the production router
 * or `src/App.jsx`, NOT in the main menu, NOT a public production route. A
 * future dev-only router change can mount it at
 * `RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH` ("/__dev/runtime-v2/previews"); until
 * then it stays inert.
 *
 * When the route flag is off (or in production without an explicit override) it
 * renders a SAFE FALLBACK (a small dev-only notice), never the previews and
 * never real data. It never fetches, never executes an action/workflow/
 * connector, never saves.
 *
 * @param {Object} props
 * @param {import('../../../types/dev-preview-route.js').RuntimeV2DevPreviewRouteModel} [props.routeModel]
 * @param {Record<string, unknown>} [props.env]
 */
export function RuntimeV2DevPreviewRoute({ routeModel, env }) {
  if (!isRuntimeV2DevPreviewRouteEnabled(env)) {
    // Fail closed — safe fallback, never renders previews outside an opted-in dev environment.
    return (
      <div className="mak-dev-route-fallback" data-testid="runtime-v2-dev-preview-route-fallback" data-dev-only="true">
        <p className="text-xs">Runtime v2 dev preview route is disabled (dev-only, opt-in).</p>
      </div>
    );
  }
  return <RuntimeV2DevPreviewRoutePage routeModel={routeModel} env={env} />;
}

/**
 * Returns a plain route descriptor a dev-only router could spread. This does
 * NOT mount anything by itself.
 * @returns {{ path: string, Component: typeof RuntimeV2DevPreviewRoute, devOnly: true }}
 */
export function getRuntimeV2DevPreviewRouteDescriptor() {
  return { path: RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH, Component: RuntimeV2DevPreviewRoute, devOnly: true };
}

export default RuntimeV2DevPreviewRoute;
