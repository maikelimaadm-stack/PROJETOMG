import { LIFECYCLE_PERSISTENCE_VERSION, PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";
import { getDurableStoreInfo } from "./durableLifecycleStore.js";
import { summarizeLifecyclePersistence } from "./lifecyclePersistenceSummaries.js";
import { assembleLifecycleExecutionContext } from "./lifecycleExecutionContextAssembly.js";
import { buildLifecyclePersistenceBosProjection } from "./lifecyclePersistenceToBosProjection.js";
import { retrievePersistentLifecycle } from "./lifecyclePersistenceRetrieval.js";

export function runLifecyclePersistenceEngine(groupId, tenantId = "default", options = {}) {
  const ctx = assembleLifecycleExecutionContext(groupId, tenantId, options);
  return Object.freeze({
    engineVersion: LIFECYCLE_PERSISTENCE_VERSION,
    groupId,
    tenantId,
    authorized: ctx.authorized,
    storeInfo: getDurableStoreInfo(),
    summary: summarizeLifecyclePersistence(groupId),
    context: ctx,
    bosProjection: buildLifecyclePersistenceBosProjection(groupId, tenantId, options),
    registry: retrievePersistentLifecycle(groupId),
    persistenceReady: ctx.authorized,
    durable: true,
    ...PERSISTENCE_OWNERSHIP,
    explainable: true,
  });
}

export default runLifecyclePersistenceEngine;
