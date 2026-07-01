/** Lifecycle Sync, Storage Integration & Audit Operations contracts — Program 3.27, D-093 */

export const LIFECYCLE_SYNC_VERSION = "mak-lifecycle-sync-v1";
export const AUDIT_OPERATIONS_VERSION = "mak-audit-operations-v1";
export const STORAGE_SYNC_VERSION = "mak-storage-sync-v1";
export const BACKUP_SYNC_VERSION = "mak-backup-sync-v1";

export const SYNC_DOCUMENT_TYPES = Object.freeze({
  SYNC: "lifecycle.sync",
  STORAGE: "lifecycle.storage_integration",
  AUDIT_OPS: "lifecycle.audit_operations",
});

export const SYNC_STATUSES = Object.freeze([
  "pending",
  "syncing",
  "synced",
  "diverged",
  "failed",
  "retrying",
]);

export const SYNC_OWNERSHIP = Object.freeze({
  belongsToPlatform: true,
  belongsToAuthorizedClient: true,
  belongsToAi: false,
  tenantScoped: true,
  groupScopedRequiresAuthorization: true,
  individualProfilingForbidden: true,
  surveillanceForbidden: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: true,
  crossTenantMixingForbidden: true,
  unauthorizedAggregationForbidden: true,
  syncRequiresAuditTrail: true,
  storageRequiresPolicyAndAudit: true,
  backupRequiresPolicyAndAudit: true,
  divergenceMustBeVisible: true,
  retryRequiresTraceability: true,
  notificationRequiresAuthorizedScope: true,
  hiddenDivergenceForbidden: true,
  lostSensitiveEventForbidden: true,
});

export const LIFECYCLE_SYNC_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default LIFECYCLE_SYNC_VERSION;
