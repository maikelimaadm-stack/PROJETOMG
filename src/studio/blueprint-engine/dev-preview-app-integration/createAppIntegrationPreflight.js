import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_VERSION, appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Ordered precondition checks before the dev-only route may attach. Pure and deterministic; performs
 * no mounting. Fails closed on any failing check.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime]
 * @param {Object} [options.featureGate]
 * @param {Object} [options.checkpointReceipt]
 * @returns {Object}
 */
export function createAppIntegrationPreflight(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const runtime = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : {};
  const gate = isGenericModelPlainObject(o.featureGate) ? o.featureGate : {};
  const receipt = isGenericModelPlainObject(o.checkpointReceipt) ? o.checkpointReceipt : {};

  const blockers = [];
  const routeMenuCompatible = runtime.kind === 'studio-dev-preview-route-menu' && runtime.fallback !== true;
  if (!routeMenuCompatible) blockers.push('route_menu_runtime_incompatible');
  if (String(runtime.routeMenuVersion ?? ROUTE_MENU_VERSION) !== ROUTE_MENU_VERSION) blockers.push('route_menu_version_incompatible');
  if (gate.open !== true) blockers.push('feature_gate_closed');
  if (receipt.approved !== true) blockers.push('checkpoint_not_approved');

  const ok = blockers.length === 0;
  const core = {
    kind: 'app-integration-preflight',
    ok,
    routeMenuCompatible,
    featureGateOpen: gate.open === true,
    checkpointApproved: receipt.approved === true,
    syntheticDataOnly: true,
    blockers,
    blockerCount: blockers.length,
  };
  return safeCloneGenericModel({ ...core, preflightDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationPreflight;
