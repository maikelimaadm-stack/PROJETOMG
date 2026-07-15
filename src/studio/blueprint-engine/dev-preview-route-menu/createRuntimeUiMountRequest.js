import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuConfig.js';

/**
 * Builds a Runtime UI mount REQUEST descriptor (metadata). It records WHETHER a mount is authorized
 * — the dev gate open, the route guard allowing, the resolver matching the preview route, and a
 * synthetic virtual frame — but performs NO mount itself. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.featureGate]
 * @param {Object} [options.routeGuard]
 * @param {Object} [options.routeResolver]
 * @param {Object} [options.virtualFrame]
 * @returns {Object}
 */
export function createRuntimeUiMountRequest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const gate = isGenericModelPlainObject(o.featureGate) ? o.featureGate : {};
  const guard = isGenericModelPlainObject(o.routeGuard) ? o.routeGuard : {};
  const resolver = isGenericModelPlainObject(o.routeResolver) ? o.routeResolver : {};
  const vf = isGenericModelPlainObject(o.virtualFrame) ? o.virtualFrame : {};

  const syntheticFrame = vf.syntheticDataOnly !== false;
  const routeAuthorized = resolver.screenKind === 'preview' && resolver.matched === true;
  const mountAuthorized = gate.open === true && guard.allow === true && routeAuthorized && syntheticFrame;

  const core = {
    kind: 'route-menu-runtime-ui-mount-request',
    mountAuthorized,
    featureGateOpen: gate.open === true,
    routeGuardAllows: guard.allow === true,
    routeAuthorized,
    syntheticFrame,
    globalRuntimeUiMounted: false,
    mountedByDefault: false,
    reason: mountAuthorized ? 'authorized_dev_only_isolated_mount' : 'blocked_not_authorized',
  };
  return safeCloneGenericModel({ ...core, mountRequestDigest: routeMenuDigest(core) });
}

export default createRuntimeUiMountRequest;
