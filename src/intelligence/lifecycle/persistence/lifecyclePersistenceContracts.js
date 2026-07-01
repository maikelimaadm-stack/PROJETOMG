/** Lifecycle Persistence & Approval Workflow contracts — Program 3.26, D-092 */

export const LIFECYCLE_PERSISTENCE_VERSION = "mak-lifecycle-persistence-v1";
export const APPROVAL_WORKFLOW_VERSION = "mak-approval-workflow-v1";
export const LIFECYCLE_EXECUTION_QUEUE_VERSION = "mak-lifecycle-execution-queue-v1";
export const DURABLE_AUDIT_STORE_VERSION = "mak-durable-audit-store-v1";

export const PERSISTENCE_DOCUMENT_TYPES = Object.freeze({
  PERSISTENCE: "lifecycle.persistence",
  APPROVAL: "lifecycle.approval",
  EXECUTION: "lifecycle.execution",
  TRANSITION: "lifecycle.transition",
});

export const APPROVAL_STATUSES = Object.freeze([
  "pending",
  "approved",
  "rejected",
  "blocked",
  "queued",
  "executing",
  "executed",
]);

export const EXECUTION_QUEUE_STATUSES = Object.freeze([
  "queued",
  "processing",
  "completed",
  "failed",
  "blocked",
]);

export const PERSISTENCE_OWNERSHIP = Object.freeze({
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
  archiveRequiresPolicyAndAudit: true,
  expungeRequiresPolicyAndAudit: true,
  holdRemovalRequiresAuthorization: true,
  stateChangeRequiresAuditTrail: true,
  persistenceRequiresApprovalWhenRequired: true,
  queueRequiresApprovalWhenRequired: true,
});

export const LIFECYCLE_PERSISTENCE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "business.lifecycle_sync", implemented: true, consumes: ["lifecycle.persistence"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default LIFECYCLE_PERSISTENCE_VERSION;
