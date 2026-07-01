/**
 * Fortress → BOS projection — business vocabulary only.
 * @see Program 3.24
 */
import { summarizeFortressEngine } from "./fortressSummarization.js";
import { retrieveLatestFortress } from "./fortressRetrieval.js";
import { analyzeComplianceFortressContext } from "./governanceToFortressIngestion.js";
import { explainComplianceRule } from "./complianceExplainability.js";
import { explainRetentionRule } from "./retentionExplainability.js";
import { explainAuditEvent } from "./auditExplainability.js";

export function buildFortressBosProjection(groupId, tenantId = "default", options = {}) {
  if (!groupId) {
    return Object.freeze({
      hasFortress: false,
      authorized: false,
      summary: "Fortress de compliance, retenção e auditoria requer escopo autorizado.",
      explainable: true,
    });
  }

  let summary = summarizeFortressEngine(groupId);
  if (summary.compliance.documentCount === 0) {
    analyzeComplianceFortressContext(groupId, tenantId, options);
    summary = summarizeFortressEngine(groupId);
  }

  const retrieved = retrieveLatestFortress(groupId);
  const latest = analyzeComplianceFortressContext(groupId, tenantId, options);

  const complianceStatus = Object.freeze({
    label: "Status de compliance",
    context: latest.summary?.headline ?? summary.headline,
    status: latest.summary?.complianceStatus ?? "compliant",
    because: "Regras protegem isolamento, exposição e aprovação humana.",
  });

  const activeRules = retrieved.complianceRules.slice(0, 5).map((r) => {
    const explained = explainComplianceRule(r);
    return Object.freeze({ id: r.ruleId, label: r.label, context: r.summary, because: explained?.because, status: r.status });
  });

  const retentionByType = retrieved.retentionRules.slice(0, 5).map((r) => {
    const explained = explainRetentionRule(r);
    return Object.freeze({
      id: r.ruleId,
      label: r.label,
      context: r.summary,
      retentionDays: r.retentionDays,
      dataCategory: r.dataCategory,
      because: explained?.because,
    });
  });

  const archivedData = retrieved.archives.slice(0, 3).map((a) =>
    Object.freeze({ id: a.archiveId, label: a.label, context: a.summary, status: a.status })
  );

  const legalHolds = retrieved.holds.slice(0, 3).map((h) =>
    Object.freeze({ id: h.holdId, label: h.label, context: h.summary, active: h.active })
  );

  const auditedEvents = retrieved.auditEvents.slice(0, 5).map((e) => {
    const explained = explainAuditEvent(e);
    return Object.freeze({
      id: e.eventId,
      label: e.label,
      context: e.summary,
      sensitive: e.sensitive,
      because: explained?.because,
    });
  });

  const exceptions = retrieved.exceptions.slice(0, 3).map((e) =>
    Object.freeze({ id: e.exceptionId, label: e.label, context: e.summary, status: e.status })
  );

  const exposureBlocks = latest.exposureRules?.rules?.slice(0, 3).map((r) =>
    Object.freeze({ id: r.ruleId, label: r.label, context: r.summary })
  ) ?? [];

  const purgeSummary = Object.freeze({
    label: "Expurgo controlado",
    context: latest.expunges?.expunges?.[0]?.summary ?? "Nenhum expurgo automático.",
    purgeAllowed: latest.expunges?.purgeAllowed ?? false,
    because: "Expurgo exige política e trilha de auditoria.",
  });

  const fortressAlerts = retrieved.alerts.slice(0, 5).map((a) =>
    Object.freeze({ id: a.alertId, label: a.title, context: a.summary ?? a.title, severity: a.severity })
  );

  const tenantCompliance = latest.authorized
    ? (latest.complianceRules?.rules ?? []).slice(0, 3).map((r) =>
        Object.freeze({ label: r.label, status: r.status })
      )
    : [];

  return Object.freeze({
    hasFortress: summary.compliance.documentCount > 0 || latest.authorized === true,
    authorized: latest.authorized === true,
    summary: summary.headline,
    fortressSummary: summary,
    complianceStatus,
    activeComplianceRules: activeRules,
    retentionByType,
    archivedData,
    legalHolds,
    auditedEvents,
    registeredExceptions: exceptions,
    exposureBlocks,
    purgeSummary,
    fortressAlerts,
    tenantComplianceView: tenantCompliance,
    explainable: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    individualProfilingForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    purgeRequiresPolicyAndAudit: true,
    retentionRequiresExplicitRule: true,
  });
}

export default buildFortressBosProjection;
