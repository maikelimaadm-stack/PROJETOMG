import { DECISION_LIFECYCLE_STATES } from "./decisionEngineContracts.js";
import { upsertDecisionDocument, listDecisionDocuments } from "./decisionEngineStore.js";
import { appendDecisionAuditEntry } from "./decisionAuditTrail.js";

/** Decision approval workflow — human-only, never autonomous */
export function submitDecisionForApproval(tenantId, decisionId) {
  const docs = listDecisionDocuments(tenantId, { limit: 200 });
  const doc = docs.find((d) => d.decisionId === decisionId);
  if (!doc) return null;
  const updated = Object.freeze({
    ...doc,
    lifecycleState: DECISION_LIFECYCLE_STATES[1],
    submittedAt: new Date().toISOString(),
  });
  upsertDecisionDocument(updated);
  appendDecisionAuditEntry({
    tenantId,
    action: "submitted_for_approval",
    entityId: decisionId,
    entityType: "decision",
  });
  return updated;
}

export function approveDecision(tenantId, decisionId, actorId = "human-approver") {
  const docs = listDecisionDocuments(tenantId, { limit: 200 });
  const doc = docs.find((d) => d.decisionId === decisionId);
  if (!doc) return null;
  const updated = Object.freeze({
    ...doc,
    lifecycleState: DECISION_LIFECYCLE_STATES[2],
    approvedAt: new Date().toISOString(),
    approvedBy: actorId,
    autonomousExecutionForbidden: true,
  });
  upsertDecisionDocument(updated);
  appendDecisionAuditEntry({
    tenantId,
    action: "approved_by_human",
    entityId: decisionId,
    entityType: "decision",
  });
  return updated;
}

export function rejectDecision(tenantId, decisionId, actorId = "human-reviewer") {
  const docs = listDecisionDocuments(tenantId, { limit: 200 });
  const doc = docs.find((d) => d.decisionId === decisionId);
  if (!doc) return null;
  const updated = Object.freeze({
    ...doc,
    lifecycleState: DECISION_LIFECYCLE_STATES[3],
    rejectedAt: new Date().toISOString(),
    rejectedBy: actorId,
  });
  upsertDecisionDocument(updated);
  appendDecisionAuditEntry({
    tenantId,
    action: "rejected_by_human",
    entityId: decisionId,
    entityType: "decision",
  });
  return updated;
}

export function deferDecision(tenantId, decisionId, actorId = "human-reviewer") {
  const docs = listDecisionDocuments(tenantId, { limit: 200 });
  const doc = docs.find((d) => d.decisionId === decisionId);
  if (!doc) return null;
  const updated = Object.freeze({
    ...doc,
    lifecycleState: DECISION_LIFECYCLE_STATES[4],
    deferredAt: new Date().toISOString(),
    deferredBy: actorId,
  });
  upsertDecisionDocument(updated);
  appendDecisionAuditEntry({
    tenantId,
    action: "deferred_by_human",
    entityId: decisionId,
    entityType: "decision",
  });
  return updated;
}

export default { submitDecisionForApproval, approveDecision, rejectDecision, deferDecision };
