/**
 * Data Lifecycle Engine orchestrator.
 * @see Program 3.25
 */
import { DATA_LIFECYCLE_VERSION, LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";
import { getLifecycleStoreInfo } from "./lifecycleStore.js";
import { summarizeLifecycleEngine } from "./lifecycleSummarization.js";
import { assembleLifecycleContext } from "./lifecycleContextAssembly.js";
import { buildLifecycleBosProjection } from "./lifecycleToBosProjection.js";
import { retrieveLatestLifecycle } from "./lifecycleRetrieval.js";

export function runDataLifecycleEngine(groupId, tenantId = "default", options = {}) {
  const ctx = assembleLifecycleContext(groupId, tenantId, options);
  return Object.freeze({
    engineVersion: DATA_LIFECYCLE_VERSION,
    groupId,
    tenantId,
    authorized: ctx.authorized,
    storeInfo: getLifecycleStoreInfo(),
    summary: summarizeLifecycleEngine(groupId),
    context: ctx,
    bosProjection: buildLifecycleBosProjection(groupId, tenantId, options),
    registry: retrieveLatestLifecycle(groupId),
    lifecycleReady: ctx.authorized,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export default runDataLifecycleEngine;
