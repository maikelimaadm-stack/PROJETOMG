/**
 * Lifecycle Persistence → BOS projection — business vocabulary only.
 * @see Program 3.26
 */
import { summarizeLifecyclePersistence } from "./lifecyclePersistenceSummaries.js";
import { retrievePersistentLifecycle } from "./lifecyclePersistenceRetrieval.js";
import { analyzeLifecyclePersistenceContext } from "./lifecycleToPersistenceIngestion.js";
import { explainPersistentApproval } from "./lifecyclePersistenceExplainability.js";

export function buildLifecyclePersistenceBosProjection(groupId, tenantId = "default", options = {}) {
  if (!groupId) {
    return Object.freeze({
      hasPersistence: false,
      authorized: false,
      summary: "Persistência de ciclo de vida requer escopo autorizado.",
      explainable: true,
    });
  }

  analyzeLifecyclePersistenceContext(groupId, tenantId, options);
  const summary = summarizeLifecyclePersistence(groupId);
  const retrieved = retrievePersistentLifecycle(groupId);
  const latest = analyzeLifecyclePersistenceContext(groupId, tenantId, options);

  const pendingApprovals = retrieved.approvalRequests
    .filter((r) => r.status === "pending")
    .slice(0, 8)
    .map((r) => {
      const explained = explainPersistentApproval(r);
      return Object.freeze({
        id: r.requestId,
        label: r.label,
        context: r.summary,
        actionType: r.actionType,
        because: explained?.because,
        status: r.status,
      });
    });

  const approvedActions = retrieved.approvalRequests
    .filter((r) => r.status === "approved" || r.status === "executed")
    .slice(0, 5)
    .map((r) => Object.freeze({ id: r.requestId, label: r.label, context: r.summary, status: r.status }));

  const rejectedActions = retrieved.approvalRequests
    .filter((r) => r.status === "rejected")
    .slice(0, 5)
    .map((r) => Object.freeze({ id: r.requestId, label: r.label, context: r.rejectionReason ?? r.summary, status: r.status }));

  const archiveRequests = retrieved.approvalRequests
    .filter((r) => r.actionType === "archive")
    .slice(0, 5)
    .map((r) => Object.freeze({ id: r.requestId, label: r.label, context: r.summary, status: r.status }));

  const expungeRequests = retrieved.approvalRequests
    .filter((r) => r.actionType === "expunge")
    .slice(0, 5)
    .map((r) => Object.freeze({ id: r.requestId, label: r.label, context: r.summary, status: r.status }));

  const activeHolds = retrieved.approvalRequests
    .filter((r) => r.actionType === "legal_hold" && (r.status === "approved" || r.status === "executed"))
    .slice(0, 5)
    .map((r) => Object.freeze({ id: r.requestId, label: r.label, context: r.summary, active: true }));

  const executionQueue = retrieved.executionJobs.slice(0, 8).map((j) =>
    Object.freeze({ id: j.jobId, label: j.label, context: j.summary, status: j.status })
  );

  const durableAuditTrail = retrieved.auditEntries.slice(0, 8).map((a) =>
    Object.freeze({ id: a.auditId, label: a.action, context: a.summary || a.entityType, approved: a.humanApproved })
  );

  const storageIntegration = retrieved.storageEvents.slice(0, 5).map((e) =>
    Object.freeze({ id: e.eventId, label: e.label, context: e.summary, status: e.status })
  );

  const backupIntegration = retrieved.backupEvents.slice(0, 5).map((e) =>
    Object.freeze({ id: e.eventId, label: e.label, context: e.summary, status: e.status })
  );

  const blockReasons = retrieved.approvalRequests
    .filter((r) => r.status === "rejected" || r.status === "blocked")
    .slice(0, 5)
    .map((r) => Object.freeze({ id: r.requestId, label: r.label, context: r.rejectionReason ?? r.summary }));

  const controlCenter = latest.controlCenter?.available
    ? Object.freeze({
        label: "Centro de controle persistente",
        context: latest.controlCenter.headline,
        pendingApprovals: latest.controlCenter.pendingApprovals,
        queueCount: latest.controlCenter.queueCount,
        because: "Persistência durável protege histórico e exige aprovação humana.",
      })
    : null;

  return Object.freeze({
    hasPersistence: summary.pendingApprovals >= 0 || latest.authorized === true,
    authorized: latest.authorized ?? false,
    summary: summary.headline,
    durable: true,
    pendingApprovals,
    approvedActions,
    rejectedActions,
    archiveRequests,
    expungeRequests,
    activeHolds,
    executionQueue,
    durableAuditTrail,
    storageIntegration,
    backupIntegration,
    blockReasons,
    controlCenter,
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildLifecyclePersistenceBosProjection;
