/**
 * Platform Governance → BOS projection — business vocabulary only.
 * @see Program 3.23
 */
import { summarizePlatformGovernanceEngine } from "./governanceSummarization.js";
import { retrieveLatestGovernance } from "./governanceRetrieval.js";
import { analyzePlatformGovernanceContext } from "./portfolioToGovernanceIngestion.js";
import { explainGovernanceDocument, explainGovernancePolicy, explainGovernanceDecision } from "./governanceExplainability.js";

export function buildPlatformGovernanceBosProjection(groupId, tenantId = "default", options = {}) {
  if (!groupId) {
    return Object.freeze({
      hasPlatformGovernance: false,
      authorized: false,
      summary: "Governança da plataforma requer escopo de grupo autorizado.",
      explainable: true,
    });
  }

  let summary = summarizePlatformGovernanceEngine(groupId);
  if (summary.documentCount === 0) {
    analyzePlatformGovernanceContext(groupId, tenantId, options);
    summary = summarizePlatformGovernanceEngine(groupId);
  }

  const retrieved = retrieveLatestGovernance(groupId);
  const latest = analyzePlatformGovernanceContext(groupId, tenantId, options);

  const controlCenter = latest.authorized
    ? Object.freeze({
        label: latest.controlCenter?.title ?? "Governance Control Center",
        context: latest.summary?.headline ?? summary.headline,
        scopeCount: latest.controlCenter?.scopeCount ?? 0,
        policyCount: latest.controlCenter?.policyCount ?? 0,
        complianceStatus: latest.controlCenter?.complianceStatus ?? "unknown",
        because: "Governança protege isolamento entre empresas — mudanças sensíveis exigem aprovação humana.",
      })
    : null;

  const portfolioControl = latest.authorized
    ? Object.freeze({
        label: latest.portfolioControl?.title ?? "Portfolio Control Center",
        context: latest.portfolioControl?.exposureBecause ?? "",
        portfolioViewAllowed: latest.portfolioControl?.portfolioViewAllowed ?? false,
        comparisonAllowed: latest.portfolioControl?.comparisonAllowed ?? false,
        because: "Controles de portfólio aplicados conforme escopo autorizado.",
      })
    : null;

  const authorizedScopes = retrieved.scopes.slice(0, 5).map((s) =>
    Object.freeze({
      id: s.scopeId,
      label: s.label,
      context: s.summary,
      tenantCount: s.authorizedTenantIds?.length ?? 0,
    })
  );

  const activePolicies = retrieved.policies.slice(0, 5).map((p) => {
    const explained = explainGovernancePolicy(p);
    return Object.freeze({
      id: p.policyId,
      label: p.label,
      context: p.summary,
      because: explained?.because,
    });
  });

  const permissions = retrieved.permissions.slice(0, 6).map((p) =>
    Object.freeze({
      id: p.permissionId,
      label: p.label,
      granted: p.granted,
      requiresHumanApproval: p.requiresHumanApproval ?? false,
    })
  );

  const retentions = retrieved.retentions.slice(0, 3).map((r) =>
    Object.freeze({
      id: r.retentionId,
      label: r.label,
      context: r.summary,
      retentionDays: r.retentionDays,
    })
  );

  const complianceStatus = retrieved.compliances.slice(0, 5).map((c) =>
    Object.freeze({
      id: c.complianceId,
      label: c.label,
      status: c.status,
      context: c.summary,
    })
  );

  const auditHistory = retrieved.audits.slice(0, 5).map((a) =>
    Object.freeze({
      id: a.auditId,
      label: a.label,
      context: a.summary,
    })
  );

  const governanceAlerts = retrieved.alerts.slice(0, 5).map((a) =>
    Object.freeze({
      id: a.alertId,
      label: a.title,
      context: a.summary ?? a.title,
      severity: a.severity,
    })
  );

  const visibilityZones = latest.authorized
    ? Object.freeze({
        authorized: latest.crossTenantGuard?.allowed ?? false,
        blockedReason: latest.crossTenantGuard?.allowed ? null : latest.crossTenantGuard?.reason,
        exposureAllowed: latest.exposureGuard?.exposureAllowed ?? false,
        exposureBecause: latest.exposureGuard?.because ?? "",
      })
    : null;

  const roleMatrix = latest.authorized
    ? (latest.roleMatrix?.matrix ?? []).map((r) =>
        Object.freeze({ role: r.label, permissionCount: r.permissions?.length ?? 0 })
      )
    : [];

  const topDoc = retrieved.documents[0];
  const explained = topDoc ? explainGovernanceDocument(topDoc) : null;
  const exposureDecision = latest.exposureGuard ? explainGovernanceDecision(latest.exposureGuard) : null;

  return Object.freeze({
    hasPlatformGovernance: summary.documentCount > 0 || latest.authorized === true,
    authorized: latest.authorized === true,
    summary: summary.headline,
    governanceSummary: summary,
    governanceControlCenter: controlCenter,
    portfolioControlCenter: portfolioControl,
    authorizedGroupScopes: authorizedScopes,
    activePolicies,
    governancePermissions: permissions,
    retentionPolicies: retentions,
    complianceStatus,
    auditHistory,
    governanceAlerts,
    visibilityZones,
    rolePermissionMatrix: roleMatrix,
    explainability: explained,
    exposureDecision,
    explainable: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    individualProfilingForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    policyChangeRequiresAudit: true,
  });
}

export default buildPlatformGovernanceBosProjection;
