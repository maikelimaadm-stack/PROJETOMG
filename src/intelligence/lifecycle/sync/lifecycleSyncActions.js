import { runFrontendBackendSyncPipeline } from "./frontendBackendSyncPipeline.js";

export async function triggerLifecycleSyncRefresh(groupId, tenantId = "default", options = {}) {
  return runFrontendBackendSyncPipeline(groupId, tenantId, { ...options, push: true });
}

export default { triggerLifecycleSyncRefresh };
