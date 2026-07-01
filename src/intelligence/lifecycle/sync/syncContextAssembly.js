import { assembleLifecycleExecutionContext } from "../persistence/lifecycleExecutionContextAssembly.js";
import { retrievePersistentLifecycle } from "../persistence/lifecyclePersistenceRetrieval.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function assembleSyncContext(groupId, tenantId = "default", options = {}) {
  const execCtx = assembleLifecycleExecutionContext(groupId, tenantId, options);
  if (!execCtx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      authorized: false,
      reason: execCtx.reason,
      ...SYNC_OWNERSHIP,
    });
  }

  const persistence = retrievePersistentLifecycle(groupId);

  return Object.freeze({
    groupId,
    tenantId,
    authorized: true,
    clienteId: options.clienteId ?? execCtx.clienteId ?? null,
    persistenceSnapshot: persistence,
    approvalCount: persistence.approvalRequests.length,
    executionCount: persistence.executionJobs.length,
    auditCount: persistence.auditEntries.length,
    storageCount: persistence.storageEvents.length,
    backupCount: persistence.backupEvents.length,
    assembledAt: new Date().toISOString(),
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default assembleSyncContext;
