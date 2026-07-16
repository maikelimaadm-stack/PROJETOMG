import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Describes the failure-containment contract for the dev-only route. A failure in the lazy import,
 * the mount, or the isolated runtime is contained locally by the subtree's own boundaries and never
 * breaks the App, never redirects globally, never mutates, and never changes production state. Pure
 * and deterministic.
 * @returns {Object}
 */
export function createFailureContainment() {
  const core = {
    kind: 'app-integration-failure-containment',
    failClosed: true,
    failureContained: true,
    lazyImportFailureContained: true,
    mountFailureContained: true,
    isolatedRuntimeFailureContained: true,
    localSafeFallback: true,
    breaksApp: false,
    globalRedirect: false,
    mutationOnFailure: false,
    productionStateChangedOnFailure: false,
    boundarySubtree: 'src/studio/blueprint-engine/dev-preview-app-integration/',
  };
  return safeCloneGenericModel({ ...core, failureContainmentDigest: appIntegrationDigest(core) });
}

export default createFailureContainment;
