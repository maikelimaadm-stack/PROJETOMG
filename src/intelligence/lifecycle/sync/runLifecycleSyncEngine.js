import { runFrontendBackendSyncPipeline } from "./frontendBackendSyncPipeline.js";
import { runLifecycleSyncEngineSync } from "./lifecycleSyncEngine.js";
import { buildLifecycleSyncBosProjection } from "./lifecycleSyncToBosProjection.js";
import { retrieveSyncState } from "./lifecycleRetrievalSync.js";
import { summarizeLifecycleSync } from "./lifecycleSummariesSync.js";
import { LIFECYCLE_SYNC_VERSION, SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function runLifecycleSyncOrchestratorSync(groupId, tenantId = "default", options = {}) {
  const syncResult = runLifecycleSyncEngineSync(groupId, tenantId, options);
  const bosProjection = buildLifecycleSyncBosProjection(groupId, tenantId, options);
  const state = retrieveSyncState(groupId);
  const summary = summarizeLifecycleSync(groupId);

  return Object.freeze({
    groupId,
    tenantId,
    engineVersion: LIFECYCLE_SYNC_VERSION,
    syncResult,
    bosProjection,
    state,
    summary,
    durable: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export async function runLifecycleSyncOrchestrator(groupId, tenantId = "default", options = {}) {
  const pipeline = await runFrontendBackendSyncPipeline(groupId, tenantId, options);
  const bosProjection = buildLifecycleSyncBosProjection(groupId, tenantId, options);
  const state = retrieveSyncState(groupId);
  const summary = summarizeLifecycleSync(groupId);

  return Object.freeze({
    groupId,
    tenantId,
    engineVersion: LIFECYCLE_SYNC_VERSION,
    pipeline,
    bosProjection,
    state,
    summary,
    durable: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default runLifecycleSyncOrchestratorSync;
