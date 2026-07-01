/**
 * Portfolio → Platform Governance ingestion — authorized group scope only.
 * @see Program 3.23
 */
import { assembleGovernanceContext } from "./governanceContextAssembly.js";
import { manageAuthorizedGroupScope } from "./authorizedGroupScopeManagement.js";
import { buildTenantVisibilityRules } from "./tenantVisibilityRules.js";
import { buildPermissionRegistry } from "./permissionRegistry.js";
import { buildPolicyRegistry } from "./policyRegistry.js";
import { buildRetentionPolicyEngine } from "./retentionPolicyEngine.js";
import { buildAuditPolicyEngine } from "./auditPolicyEngine.js";
import { buildCompliancePolicyEngine } from "./compliancePolicyEngine.js";
import { buildAdminScopeRegistry } from "./adminScopeRegistry.js";
import { buildRolePermissionMatrix } from "./rolePermissionMatrix.js";
import { buildGroupAuthorizationRegistry } from "./groupAuthorizationRegistry.js";
import { enforceCrossTenantAccessGuard } from "./crossTenantAccessGuard.js";
import { enforceDataExposureGuard } from "./dataExposureGuard.js";
import { buildRetentionEnforcementRegistry } from "./retentionEnforcementRegistry.js";
import { buildPolicyComplianceRegistry } from "./policyComplianceRegistry.js";
import { buildAuditReviewRegistry } from "./auditReviewRegistry.js";
import { buildGovernanceControlCenter } from "./governanceControlCenter.js";
import { buildPortfolioControlCenter } from "./portfolioControlCenter.js";
import { buildGovernanceDocument } from "./governanceDocument.js";
import { upsertGovernanceAlert } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";
import { buildGovernanceSummary } from "./governanceSummaryEngine.js";
import { PLATFORM_GOVERNANCE_VERSION, GOVERNANCE_OWNERSHIP } from "./platformGovernanceContracts.js";
import { ingestGovernanceToFortress } from "../../fortress/engine/governanceToFortressIngestion.js";

export function analyzePlatformGovernanceContext(groupId, tenantId = "default", options = {}) {
  const ctx = assembleGovernanceContext(groupId, tenantId, options);

  if (!ctx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      analyzedAt: new Date().toISOString(),
      authorized: false,
      reason: ctx.reason,
      ...GOVERNANCE_OWNERSHIP,
    });
  }

  const scopes = manageAuthorizedGroupScope(groupId, ctx);
  const visibilityRules = buildTenantVisibilityRules(groupId, ctx);
  const permissions = buildPermissionRegistry(groupId, ctx);
  const policies = buildPolicyRegistry(groupId, ctx);
  const retention = buildRetentionPolicyEngine(groupId, ctx);
  const auditPolicy = buildAuditPolicyEngine(groupId, ctx);
  const compliance = buildCompliancePolicyEngine(groupId, ctx);
  const adminScopes = buildAdminScopeRegistry(groupId, ctx);
  const roleMatrix = buildRolePermissionMatrix(groupId, ctx, permissions);
  const authorizations = buildGroupAuthorizationRegistry(groupId, ctx);
  const crossTenantGuard = enforceCrossTenantAccessGuard(groupId, ctx, ctx.authorizedTenantIds);
  const exposureGuard = enforceDataExposureGuard(groupId, ctx, "portfolio_command");
  const retentionEnforcement = buildRetentionEnforcementRegistry(groupId, ctx, retention);
  const complianceRegistry = buildPolicyComplianceRegistry(groupId, ctx, compliance);
  const auditReview = buildAuditReviewRegistry(groupId, ctx);
  const summary = buildGovernanceSummary(groupId, ctx, scopes, policies, compliance, permissions);

  const controlCenter = buildGovernanceControlCenter(groupId, tenantId, ctx, summary, scopes, policies, compliance);
  const portfolioControl = buildPortfolioControlCenter(groupId, tenantId, ctx, exposureGuard, permissions);
  const document = buildGovernanceDocument(groupId, ctx, summary, controlCenter);

  if (!exposureGuard.exposureAllowed) {
    upsertGovernanceAlert(
      Object.freeze({
        alertId: `galert-${groupId}-exposure`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        title: "Visão de portfólio restrita",
        severity: "warning",
        category: "exposure",
        summary: exposureGuard.because,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    );
  }

  appendGovernanceAuditEntry({
    groupId,
    action: "platform_governance_analyzed",
    entityId: document.document?.documentId ?? null,
    entityType: "governance_document",
  });

  try {
    ingestGovernanceToFortress(groupId, tenantId, { ...options, governanceDocumentId: document.document?.documentId });
  } catch {
    /* non-blocking fortress ingestion */
  }

  return Object.freeze({
    groupId,
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: PLATFORM_GOVERNANCE_VERSION,
    authorized: true,
    summary,
    scopes,
    visibilityRules,
    permissions,
    policies,
    retention,
    auditPolicy,
    compliance,
    adminScopes,
    roleMatrix,
    authorizations,
    crossTenantGuard,
    exposureGuard,
    retentionEnforcement,
    complianceRegistry,
    auditReview,
    controlCenter,
    portfolioControl,
    document,
    ...GOVERNANCE_OWNERSHIP,
    explainable: true,
  });
}

export function ingestPortfolioToGovernance(groupId, tenantId = "default", options = {}) {
  return analyzePlatformGovernanceContext(groupId, tenantId, options);
}

export default { analyzePlatformGovernanceContext, ingestPortfolioToGovernance };
