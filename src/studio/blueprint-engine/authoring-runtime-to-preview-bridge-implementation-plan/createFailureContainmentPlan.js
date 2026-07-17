import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * FAILURE CONTAINMENT PLAN — plans that a failed bridge run leaves no partial target descriptor or bridge
 * decision, mutates neither source nor target, and rolls back purely by non-consumption (no external
 * cleanup / database rollback / filesystem cleanup). Metadata only. @returns {Object}
 */
export function createFailureContainmentPlan() {
  const core = {
    kind: 'bridge-failure-containment-plan',
    failureContainmentPlanned: true,
    failureContainmentImplemented: false,
    partialTargetDescriptorAllowed: false,
    partialBridgeDecisionAllowed: false,
    sourceMutationAllowed: false,
    targetMutationAllowed: false,
    rollbackByNonConsumption: true,
    externalCleanupRequired: false,
    databaseRollbackRequired: false,
    filesystemCleanupRequired: false,
  };
  return safeCloneGenericModel({ ...core, failureContainmentPlanDigest: bridgePlanDigest(core) });
}

export default createFailureContainmentPlan;
