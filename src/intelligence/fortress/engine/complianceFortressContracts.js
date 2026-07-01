/** Compliance, Retention & Audit Fortress contracts — Program 3.24, D-090 */

export const COMPLIANCE_FORTRESS_VERSION = "mak-compliance-fortress-v1";
export const RETENTION_FORTRESS_VERSION = "mak-retention-fortress-v1";
export const AUDIT_FORTRESS_VERSION = "mak-audit-fortress-v1";
export const FORTRESS_STORE_VERSION = "mak-fortress-store-v1";

export const FORTRESS_DOCUMENT_TYPES = Object.freeze({
  COMPLIANCE: "fortress.compliance",
  RETENTION: "fortress.retention",
  AUDIT: "fortress.audit",
  RULE: "fortress.rule",
  SCHEDULE: "fortress.schedule",
  HOLD: "fortress.hold",
  ARCHIVE: "fortress.archive",
  EXCEPTION: "fortress.exception",
});

export const FORTRESS_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "active",
  "under_review",
  "held",
  "archived",
  "expunged",
]);

export const FORTRESS_OWNERSHIP = Object.freeze({
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
  policyChangeRequiresAudit: true,
  purgeRequiresPolicyAndAudit: true,
  retentionRequiresExplicitRule: true,
  exceptionRequiresAuditTrail: true,
});

export const FORTRESS_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default COMPLIANCE_FORTRESS_VERSION;
