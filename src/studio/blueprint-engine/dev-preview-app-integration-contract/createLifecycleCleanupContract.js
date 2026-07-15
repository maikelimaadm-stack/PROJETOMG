import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Lifecycle/cleanup contract — metadata only; asserts no lifecycle/cleanup is integrated and no
 * auto-start/auto-stop/unmount is performed. Pure and deterministic.
 * @returns {Object}
 */
export function createLifecycleCleanupContract() {
  const core = {
    kind: 'app-integration-lifecycle-cleanup-contract',
    lifecycleIntegrated: false,
    cleanupIntegrated: false,
    autoStartAllowed: false,
    autoStopAllowed: false,
    unmountIntegrated: false,
    futureCleanup: 'dev_only_contract',
  };
  return safeCloneGenericModel({ ...core, lifecycleCleanupDigest: appIntegrationDigest(core) });
}

export default createLifecycleCleanupContract;
