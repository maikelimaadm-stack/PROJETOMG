/** Platform Governance Engine contracts — Program 3.23, D-089 */

export const PLATFORM_GOVERNANCE_VERSION = "mak-platform-governance-v1";
export const PLATFORM_GOVERNANCE_STORE_VERSION = "mak-platform-governance-store-v1";

export const GOVERNANCE_DOCUMENT_TYPES = Object.freeze({
  CONTROL_CENTER: "governance.control_center",
  PORTFOLIO_CONTROL: "governance.portfolio_control",
  POLICY: "governance.policy",
  PERMISSION: "governance.permission",
  RETENTION: "governance.retention",
  AUDIT: "governance.audit",
  COMPLIANCE: "governance.compliance",
  SCOPE: "governance.scope",
});

export const GOVERNANCE_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "active",
  "under_review",
  "suspended",
  "archived",
]);

export const GOVERNANCE_POLICY_TYPES = Object.freeze({
  VISIBILITY: "governance.policy.visibility",
  AGGREGATION: "governance.policy.aggregation",
  RETENTION: "governance.policy.retention",
  AUDIT: "governance.policy.audit",
  COMPLIANCE: "governance.policy.compliance",
});

export const GOVERNANCE_OWNERSHIP = Object.freeze({
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
});

export const PLATFORM_GOVERNANCE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "business.compliance_fortress", implemented: true, consumes: ["governance.engine"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default PLATFORM_GOVERNANCE_VERSION;
