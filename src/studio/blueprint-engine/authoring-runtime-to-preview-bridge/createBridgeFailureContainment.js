import { deepFreeze } from './deepFreeze.js';

/** FAILURE CONTAINMENT contract — execution is atomic; any error yields null target, no partial state. */
export function createBridgeFailureContainment() {
  return deepFreeze({
    kind: 'bridge-failure-containment',
    atomic: true,
    partialTargetAllowed: false,
    partialDecisionAllowed: false,
    sourceMutationAllowed: false,
    targetMutationAllowed: false,
    cacheGlobal: false,
    storageUsed: false,
    retryWithFallbackAllowed: false,
    silenceBlockerAllowed: false,
    rollbackByNonConsumption: true,
    externalCleanupRequired: false,
    databaseRollbackRequired: false,
    filesystemCleanupRequired: false,
  });
}

export default createBridgeFailureContainment;
