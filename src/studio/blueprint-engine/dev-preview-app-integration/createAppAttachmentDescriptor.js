import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_DEV_PREVIEW_ROUTE_PATH, appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Describes the single additive attachment of the dev-only route into the App. Metadata only — it
 * performs no attachment; the App itself opts in with one dev-guarded route element. Asserts the
 * attachment is dev-only, not exposed to product menu/sidebar, not a public route, and follows the
 * sanctioned dev-route pattern. Pure and deterministic.
 * @returns {Object}
 */
export function createAppAttachmentDescriptor() {
  const core = {
    kind: 'app-integration-app-attachment-descriptor',
    path: STUDIO_DEV_PREVIEW_ROUTE_PATH,
    devOnly: true,
    additiveOnly: true,
    devRouteAttached: true,
    followsSanctionedDevRoutePattern: true,
    routeExposedToProduct: false,
    menuExposedToProduct: false,
    sidebarExposedToProduct: false,
    publicRoute: false,
    inMainMenu: false,
    newRouterCreated: false,
    existingRouterRefactored: false,
    providersTouched: false,
    authTouched: false,
    layoutTouched: false,
  };
  return safeCloneGenericModel({ ...core, appAttachmentDigest: appIntegrationDigest(core) });
}

export default createAppAttachmentDescriptor;
