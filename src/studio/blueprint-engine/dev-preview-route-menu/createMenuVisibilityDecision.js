import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuConfig.js';

/**
 * Decides local menu visibility. The isolated menu is visible ONLY when the dev feature gate is
 * open. It never registers a global menu/sidebar. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.featureGate]
 * @returns {Object}
 */
export function createMenuVisibilityDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const gate = isGenericModelPlainObject(o.featureGate) ? o.featureGate : {};
  const visible = gate.open === true;

  const core = {
    kind: 'route-menu-menu-visibility-decision',
    visibleLocalOnly: visible,
    visibleWhenGateOpen: true,
    registersGlobalMenu: false,
    registersSidebar: false,
    productMenuRegistered: false,
    productSidebarRegistered: false,
    featureGateOpen: gate.open === true,
  };
  return safeCloneGenericModel({ ...core, menuVisibilityDigest: routeMenuDigest(core) });
}

export default createMenuVisibilityDecision;
