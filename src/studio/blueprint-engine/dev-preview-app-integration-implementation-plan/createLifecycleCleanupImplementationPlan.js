import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Lifecycle/cleanup implementation PLAN — metadata only; asserts no lifecycle/cleanup is integrated
 * and no auto-start/auto-stop/unmount is performed. Pure and deterministic.
 * @returns {Object}
 */
export function createLifecycleCleanupImplementationPlan() {
  const core = {
    kind: 'app-integration-lifecycle-cleanup-implementation-plan',
    lifecycleIntegrated: false,
    cleanupIntegrated: false,
    autoStartAllowed: false,
    autoStopAllowed: false,
    unmountIntegrated: false,
    futureCleanup: 'dev_only_plan',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, lifecycleCleanupImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createLifecycleCleanupImplementationPlan;
