import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the ROLLOUT / ROLLBACK plan. Pure, metadata-only. Rollout is blocked: no production
 * rollout, no staging rollout, manual enablement required, rollback by non-consumption.
 *
 * @param {Object} [options]
 * @returns {Object} rollout/rollback plan
 */
export function createIsolatedRuntimeRolloutRollbackPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'isolated-runtime-rollout-rollback-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    rolloutAllowed: false,
    productionRollout: false,
    stagingRollout: false,
    manualEnablementRequired: true,
    rollbackByNonConsumption: true,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, rolloutRollbackDigest: planDigest(core) });
}

export default createIsolatedRuntimeRolloutRollbackPlan;
