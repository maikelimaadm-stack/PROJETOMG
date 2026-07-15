import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Runtime UI mount adapter contract — metadata only; asserts the Runtime UI is not mounted in the
 * App and no ReactDOM/createRoot/window/document/mount-node/root-factory is created here. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRuntimeUiMountAdapterContract() {
  const core = {
    kind: 'app-integration-runtime-ui-mount-adapter-contract',
    runtimeUiMountedInApp: false,
    mountAdapterCreated: false,
    reactDomUsed: false,
    createRootUsed: false,
    windowUsed: false,
    documentUsed: false,
    mountNodeCreated: false,
    rootFactoryInjected: false,
    futureMountKind: 'explicit_dependency_injected_root_factory_and_mount_node',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, runtimeUiMountAdapterDigest: appIntegrationDigest(core) });
}

export default createRuntimeUiMountAdapterContract;
