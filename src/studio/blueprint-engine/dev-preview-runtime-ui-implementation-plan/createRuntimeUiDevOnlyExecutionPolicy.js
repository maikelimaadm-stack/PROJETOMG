import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans the dev-only UI execution policy for a future UI runtime. Metadata only; authorizes
 * nothing now. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiDevOnlyExecutionPolicy() {
  const core = {
    kind: 'runtime-ui-dev-only-execution-policy',
    devOnly: true,
    productionAllowed: false,
    stagingAllowed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    requiresRuntimeUiContract: true,
    requiresIsolatedRuntime: true,
    requiresVirtualFrame: true,
    policyImplemented: false,
  };
  return safeCloneGenericModel({ ...core, devOnlyPolicyDigest: uiPlanDigest(core) });
}

export default createRuntimeUiDevOnlyExecutionPolicy;
