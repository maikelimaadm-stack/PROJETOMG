import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Route registration PLAN — metadata only. Nothing is registered in a real router. Pure and
 * deterministic.
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @returns {Object}
 */
export function createRouteRegistrationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const rd = isGenericModelPlainObject(c.routeDescriptor) ? c.routeDescriptor : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'route-menu-route-registration-plan',
    futureRouteId: String(rd.routeId ?? `dev-preview-${moduleId}`),
    futurePath: String(rd.futurePath ?? `/__dev/studio-preview/${moduleId}`),
    futureRouteName: String(rd.futureRouteName ?? `studioDevPreview_${moduleId}`),
    futureRuntimeUiEntry: 'studio-dev-preview-runtime-ui@1.0.0',
    registrationImplemented: false,
    routeCreated: false,
    deepLinkCreated: false,
  };
  return safeCloneGenericModel({ ...core, routeRegistrationDigest: routeMenuPlanDigest(core) });
}

export default createRouteRegistrationPlan;
