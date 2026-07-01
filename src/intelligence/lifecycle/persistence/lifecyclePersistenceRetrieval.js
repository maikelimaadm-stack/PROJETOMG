import {
  listApprovalRequests,
  listExecutionJobs,
  listDurableAuditEntries,
  listStateRecords,
  listTransitions,
  listStorageEvents,
  listBackupEvents,
} from "./durableLifecycleStore.js";

export function retrievePersistentLifecycle(groupId, options = {}) {
  return Object.freeze({
    groupId,
    retrievedAt: new Date().toISOString(),
    approvalRequests: listApprovalRequests(groupId, options),
    executionJobs: listExecutionJobs(groupId, options),
    auditEntries: listDurableAuditEntries(groupId, options),
    stateRecords: listStateRecords(groupId, options),
    transitions: listTransitions(groupId, options),
    storageEvents: listStorageEvents(groupId, options),
    backupEvents: listBackupEvents(groupId, options),
    durable: true,
    explainable: true,
    expungeRequiresPolicyAndAudit: true,
    archiveRequiresPolicyAndAudit: true,
  });
}

export default retrievePersistentLifecycle;
