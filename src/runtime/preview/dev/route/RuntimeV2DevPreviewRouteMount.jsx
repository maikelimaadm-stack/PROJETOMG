import { RuntimeV2DevPreviewRoute } from './RuntimeV2DevPreviewRoute.jsx';
import { shouldMountRuntimeV2DevPreviewRoute } from './registerRuntimeV2DevPreviewRoute.js';

/**
 * Dev-only mount wrapper for the runtime v2 preview route. Renders the route
 * (which itself renders a safe fallback until its flags permit) ONLY when the
 * mount gate allows it — i.e. a development environment AND the route flag on.
 * In production (or with the flag off) it renders `null`, so it can be dropped
 * anywhere safely without affecting production.
 *
 * This wrapper mounts NOTHING by itself into the app router or main menu — it
 * is an opt-in unit a dev harness / dev-guarded router branch can render. The
 * canonical router opt-in is a single guarded line (see
 * `getRuntimeV2DevPreviewRouteMountPlan`); this component is the equivalent for
 * non-`<Routes>` contexts (e.g. a dev overlay).
 *
 * @param {Object} props
 * @param {import('../../../types/dev-preview-route.js').RuntimeV2DevPreviewRouteModel} [props.routeModel]
 * @param {Record<string, unknown>} [props.env]
 */
export function RuntimeV2DevPreviewRouteMount({ routeModel, env }) {
  if (!shouldMountRuntimeV2DevPreviewRoute(env)) {
    // Fail closed — never mounts outside an opted-in dev environment.
    return null;
  }
  return <RuntimeV2DevPreviewRoute routeModel={routeModel} env={env} />;
}

export default RuntimeV2DevPreviewRouteMount;
