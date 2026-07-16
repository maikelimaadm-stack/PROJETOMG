import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Describes the explicit, isolated Runtime UI mount request. Metadata only. The mount is authorized
 * only when the preflight passes; it mounts EXCLUSIVELY the isolated host from the route-menu subtree
 * through explicit dependency injection (rootFactory + mountNode), never a global root/singleton/
 * service-locator, never `window`/`document`, never `ReactDOM`/`createRoot`, never storage/network/
 * real data. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.preflight]
 * @returns {Object}
 */
export function createRuntimeUiMountRequest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const preflight = isGenericModelPlainObject(o.preflight) ? o.preflight : {};
  const mountAuthorized = preflight.ok === true;

  const core = {
    kind: 'app-integration-runtime-ui-mount-request',
    mountAuthorized,
    reason: mountAuthorized ? 'authorized_dev_only_isolated_mount' : 'blocked_not_authorized',
    explicitRequest: true,
    explicitMount: true,
    mountsIsolatedHostOnly: true,
    dependencyInjected: true,
    requiresRootFactory: true,
    requiresMountNode: true,
    runtimeUiMountedByDefault: false,
    globalRootUsed: false,
    globalSingletonUsed: false,
    serviceLocatorUsed: false,
    windowUsed: false,
    documentUsed: false,
    reactDomUsed: false,
    createRootUsed: false,
    usesStorage: false,
    usesNetwork: false,
    realDataRead: false,
    realDataWrite: false,
    syntheticDataOnly: true,
  };
  return safeCloneGenericModel({ ...core, mountRequestDigest: appIntegrationDigest(core) });
}

export default createRuntimeUiMountRequest;
