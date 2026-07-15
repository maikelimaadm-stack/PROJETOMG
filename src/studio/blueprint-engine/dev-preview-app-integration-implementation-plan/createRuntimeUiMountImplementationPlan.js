import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Runtime UI mount implementation PLAN — metadata only; asserts the Runtime UI is not mounted in the
 * App and no browser mount primitive is used. Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiMountImplementationPlan() {
  const core = {
    kind: 'app-integration-runtime-ui-mount-implementation-plan',
    runtimeUiMountedInApp: false,
    mountImplemented: false,
    reactDomUsed: false,
    createRootUsed: false,
    windowApiUsed: false,
    documentApiUsed: false,
    mountNodeCreated: false,
    rootFactoryInjected: false,
    futureMountKind: 'explicit_dependency_injected_root_factory_and_mount_node',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, runtimeUiMountImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createRuntimeUiMountImplementationPlan;
