import {
  REQUIRED_CHECKPOINT_RECEIPT,
  isDevelopmentEnvironment,
  isProductionOrStaging,
} from './routeMenuConfig.js';
import { createDevOnlyFeatureGate } from './createDevOnlyFeatureGate.js';
import { createRouteGuard } from './createRouteGuard.js';
import { createIsolatedNavigationController } from './createIsolatedNavigationController.js';

/**
 * Mount adapter for the isolated dev-only route/menu host. Mounts ONLY through EXPLICIT DEPENDENCY
 * INJECTION: the caller provides `rootFactory` (which turns `mountNode` into a React root) and,
 * optionally, `hostElementFactory` (which builds the host React element from a snapshot — kept out
 * of this pure `.js` graph so the module stays importable by `node --test`). It NEVER touches
 * `window`/`document`, NEVER calls `createRoot`/`ReactDOM` internally, and NEVER mounts on import.
 *
 * In production/staging/default-off/missing-checkpoint/missing-rootFactory/missing-mountNode it
 * returns a BLOCKED result WITHOUT calling `rootFactory`.
 *
 * @param {Object} [options]
 * @param {(mountNode: unknown) => { render: Function, unmount: Function }} [options.rootFactory]
 * @param {unknown} [options.mountNode]
 * @param {string} [options.environment]
 * @param {boolean} [options.enabled]
 * @param {string} [options.checkpointReceipt]
 * @param {string} [options.initialPath]
 * @param {Object} [options.virtualFrame]
 * @param {(snapshot: Object) => unknown} [options.hostElementFactory]
 * @returns {Object} controller with navigateLocal, render, dispose, getSnapshot + flags
 */
export function mountStudioDevPreviewRouteMenu(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const environment = String(o.environment ?? 'unknown');
  const enabled = o.enabled === true;
  const checkpointApproved = o.checkpointReceipt === REQUIRED_CHECKPOINT_RECEIPT;
  const hasRootFactory = typeof o.rootFactory === 'function';
  const hasMountNode = o.mountNode !== undefined && o.mountNode !== null;
  const prodOrStaging = isProductionOrStaging(environment);

  const gate = createDevOnlyFeatureGate({ enabled, environment, checkpointReceipt: o.checkpointReceipt });

  const blocked = (reason) => ({
    kind: 'route-menu-mount-controller',
    mounted: false,
    blocked: true,
    reason,
    rootFactoryCalled: false,
    usesWindow: false,
    usesDocument: false,
    usesInternalCreateRoot: false,
    navigateLocal() { return { path: null, blocked: true }; },
    render() { return false; },
    dispose() { return false; },
    getSnapshot() { return { mounted: false, blocked: true }; },
  });

  if (prodOrStaging) return blocked('production_or_staging_denied');
  if (!enabled) return blocked('default_off_or_disabled');
  if (!isDevelopmentEnvironment(environment)) return blocked('environment_not_development');
  if (!checkpointApproved) return blocked('checkpoint_not_approved');
  if (!gate.open) return blocked('feature_gate_closed');
  if (!hasRootFactory) return blocked('root_factory_missing');
  if (!hasMountNode) return blocked('mount_node_missing');

  const guard = createRouteGuard({ featureGate: gate, environment, syntheticData: true });
  if (guard.allow !== true) return blocked('route_guard_denied');

  const root = o.rootFactory(o.mountNode);
  const hostElementFactory = typeof o.hostElementFactory === 'function' ? o.hostElementFactory : null;

  let disposed = false;
  const doRender = (snapshot) => {
    if (disposed || !root || typeof root.render !== 'function') return false;
    const element = hostElementFactory ? hostElementFactory(snapshot) : { kind: 'render-descriptor', snapshot };
    root.render(element);
    return true;
  };

  const nav = createIsolatedNavigationController({ initialPath: o.initialPath, onChange: (snap) => { doRender(snap); } });
  const initialSnapshot = nav.controller.getSnapshot();
  doRender(initialSnapshot);

  return {
    kind: 'route-menu-mount-controller',
    mounted: true,
    blocked: false,
    reason: 'authorized_dev_only_isolated_mount',
    rootFactoryCalled: true,
    usesWindow: false,
    usesDocument: false,
    usesInternalCreateRoot: false,
    navigateLocal(nextPath) { return nav.controller.navigateLocal(nextPath); },
    render() { return doRender(nav.controller.getSnapshot()); },
    getSnapshot() { return nav.controller.getSnapshot(); },
    dispose() {
      if (disposed) return false;
      disposed = true;
      if (root && typeof root.unmount === 'function') { root.unmount(); return true; }
      return false;
    },
  };
}

export default mountStudioDevPreviewRouteMenu;
