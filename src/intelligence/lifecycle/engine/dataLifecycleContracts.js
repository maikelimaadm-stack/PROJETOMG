/** Data Lifecycle Engine contracts — Program 3.25, D-091 */

export const DATA_LIFECYCLE_VERSION = "mak-data-lifecycle-v1";
export const ARCHIVE_ENGINE_VERSION = "mak-archive-engine-v1";
export const EXPUNGE_ENGINE_VERSION = "mak-expunge-engine-v1";
export const LEGAL_HOLD_ENGINE_VERSION = "mak-legal-hold-engine-v1";
export const LIFECYCLE_STORE_VERSION = "mak-lifecycle-store-v1";

export const LIFECYCLE_DOCUMENT_TYPES = Object.freeze({
  LIFECYCLE: "lifecycle.document",
  ARCHIVE: "lifecycle.archive",
  EXPUNGE: "lifecycle.expunge",
  HOLD: "lifecycle.hold",
  RULE: "lifecycle.rule",
  SCHEDULE: "lifecycle.schedule",
  EXECUTION: "lifecycle.execution",
  EXCEPTION: "lifecycle.exception",
});

export const LIFECYCLE_DATA_STATES = Object.freeze([
  "active",
  "scheduled_archive",
  "archived",
  "on_hold",
  "scheduled_expunge",
  "expunge_pending_approval",
  "expunged",
  "blocked",
]);

export const LIFECYCLE_OWNERSHIP = Object.freeze({
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
  retentionRequiresExplicitRule: true,
  exceptionRequiresAuditTrail: true,
});

export const LIFECYCLE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "business.lifecycle_persistence", implemented: true, consumes: ["lifecycle.engine"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default DATA_LIFECYCLE_VERSION;
