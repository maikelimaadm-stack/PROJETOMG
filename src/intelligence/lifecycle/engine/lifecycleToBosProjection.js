/**
 * Lifecycle → BOS projection — business vocabulary only.
 * @see Program 3.25
 */
import { summarizeLifecycleEngine } from "./lifecycleSummarization.js";
import { retrieveLatestLifecycle } from "./lifecycleRetrieval.js";
import { analyzeDataLifecycleContext } from "./fortressToLifecycleIngestion.js";
import { explainLifecycleRule, explainLifecycleEvent, explainLifecycleState } from "./lifecycleExplainability.js";

export function buildLifecycleBosProjection(groupId, tenantId = "default", options = {}) {
  if (!groupId) {
    return Object.freeze({
      hasLifecycle: false,
      authorized: false,
      summary: "Ciclo de vida de dados requer escopo autorizado.",
      explainable: true,
    });
  }

  let summary = summarizeLifecycleEngine(groupId);
  if (summary.documentCount === 0) {
    analyzeDataLifecycleContext(groupId, tenantId, options);
    summary = summarizeLifecycleEngine(groupId);
  }

  const retrieved = retrieveLatestLifecycle(groupId);
  const latest = analyzeDataLifecycleContext(groupId, tenantId, options);

  const lifecycleStatus = Object.freeze({
    label: "Status do ciclo de vida",
    context: latest.summary?.headline ?? summary.headline,
    status: latest.summary?.lifecycleStatus ?? "active",
    because: "Políticas protegem retenção, arquivo, hold e expurgo controlado.",
  });

  const lifecycleByType = retrieved.lifecycleRules.slice(0, 5).map((r) => {
    const explained = explainLifecycleRule(r);
    return Object.freeze({
      id: r.ruleId,
      label: r.label,
      context: r.summary,
      because: explained?.because,
      status: r.status,
    });
  });

  const archivedRecords = retrieved.archiveLifecycles.slice(0, 5).map((a) =>
    Object.freeze({ id: a.archiveLifecycleId, label: a.label, context: a.summary, status: a.status })
  );

  const legalHolds = retrieved.holdEnforcements.slice(0, 5).map((h) =>
    Object.freeze({ id: h.enforcementId, label: h.label, context: h.summary, active: h.active })
  );

  const expungeableRecords = retrieved.expungeExecutions.slice(0, 3).map((e) =>
    Object.freeze({
      id: e.executionId,
      label: e.label,
      context: e.summary,
      allowed: e.expungeAllowed ?? false,
      because: "Expurgo exige política, aprovação e trilha.",
    })
  );

  const pendingApprovals = retrieved.expungeApprovals
    .filter((a) => a.status === "pending_approval")
    .slice(0, 5)
    .map((a) => Object.freeze({ id: a.approvalId, label: a.label, context: a.summary, status: a.status }));

  const lifecycleHistory = retrieved.events.slice(0, 5).map((e) => {
    const explained = explainLifecycleEvent(e);
    return Object.freeze({
      id: e.eventId,
      label: e.label,
      context: e.summary,
      sensitive: e.sensitive,
      because: explained?.because,
    });
  });

  const blockReasons = retrieved.expungeExecutions
    .filter((e) => e.status === "blocked")
    .slice(0, 3)
    .map((e) => Object.freeze({ id: e.executionId, label: e.label, context: e.summary }));

  const auditTrailByDocument = retrieved.auditTrail.slice(0, 5).map((a) =>
    Object.freeze({ id: a.auditId, label: a.action, context: a.entityType, approved: a.humanApproved })
  );

  const retentionPolicies = retrieved.schedules.slice(0, 5).map((s) =>
    Object.freeze({
      id: s.scheduleId,
      label: s.label,
      context: s.summary,
      retentionDays: s.retentionDays,
    })
  );

  const expirationAlerts = retrieved.alerts.slice(0, 5).map((a) =>
    Object.freeze({ id: a.alertId, label: a.title, context: a.summary ?? a.title, severity: a.severity })
  );

  const dataStates = retrieved.dataStates.slice(0, 5).map((s) => {
    const explained = explainLifecycleState(s);
    return Object.freeze({
      id: s.stateId,
      label: s.label,
      context: s.summary,
      currentState: s.currentState,
      because: explained?.because,
    });
  });

  const controlCenter = latest.controlCenter
    ? Object.freeze({
        label: "Centro de controle de dados sensíveis",
        context: latest.controlCenter.headline,
        pendingApprovals: latest.controlCenter.pendingApprovals,
        activeHolds: latest.controlCenter.activeHolds,
        because: "Ações sensíveis exigem aprovação humana.",
      })
    : null;

  return Object.freeze({
    hasLifecycle: summary.documentCount > 0 || latest.authorized === true,
    authorized: latest.authorized ?? false,
    summary: summary.headline,
    lifecycleStatus,
    lifecycleByType,
    archivedRecords,
    legalHolds,
    expungeableRecords,
    pendingApprovals,
    lifecycleHistory,
    blockReasons,
    auditTrailByDocument,
    retentionPolicies,
    expirationAlerts,
    dataStates,
    controlCenter,
    expungeAllowed: false,
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildLifecycleBosProjection;
