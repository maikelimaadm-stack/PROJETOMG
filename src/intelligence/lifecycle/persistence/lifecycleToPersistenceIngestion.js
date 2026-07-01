/**
 * Lifecycle → Persistence ingestion.
 * @see Program 3.26
 */
import { assembleLifecycleExecutionContext } from "./lifecycleExecutionContextAssembly.js";
import { buildLifecycleApprovalRegistry } from "./lifecycleApprovalRegistry.js";
import { buildPersistenceDocument } from "./persistenceDocument.js";
import { buildApprovalDocument } from "./approvalDocument.js";
import { summarizeLifecyclePersistence } from "./lifecyclePersistenceSummaries.js";
import { buildLifecyclePersistenceControlCenter } from "./lifecyclePersistenceControlCenter.js";
import { buildLifecycleAuditReview } from "./lifecycleAuditReview.js";
import { processExecutionQueue } from "./lifecycleExecutionQueue.js";
import {
  LIFECYCLE_PERSISTENCE_VERSION,
  APPROVAL_WORKFLOW_VERSION,
  LIFECYCLE_EXECUTION_QUEUE_VERSION,
  PERSISTENCE_OWNERSHIP,
} from "./lifecyclePersistenceContracts.js";
import { appendDurableAuditEntry } from "./durableAuditTrailStore.js";

export function analyzeLifecyclePersistenceContext(groupId, tenantId = "default", options = {}) {
  const ctx = assembleLifecycleExecutionContext(groupId, tenantId, options);
  if (!ctx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      authorized: false,
      reason: ctx.reason,
      ...PERSISTENCE_OWNERSHIP,
    });
  }

  const approvalRegistry = buildLifecycleApprovalRegistry(groupId, ctx);
  const summary = summarizeLifecyclePersistence(groupId);
  const persistenceDoc = buildPersistenceDocument(groupId, ctx, summary);
  const approvalDoc = buildApprovalDocument(groupId, ctx, approvalRegistry.requests);
  const controlCenter = buildLifecyclePersistenceControlCenter(groupId, ctx);
  const auditReview = buildLifecycleAuditReview(groupId);

  const queueResult = processExecutionQueue(groupId, { limit: 0 });

  appendDurableAuditEntry({
    groupId,
    tenantId,
    action: "persistence_analyzed",
    entityId: persistenceDoc.document?.documentId ?? null,
    entityType: "lifecycle_persistence",
  });

  return Object.freeze({
    groupId,
    tenantId,
    analyzedAt: new Date().toISOString(),
    authorized: true,
    engineVersion: LIFECYCLE_PERSISTENCE_VERSION,
    approvalWorkflowVersion: APPROVAL_WORKFLOW_VERSION,
    executionQueueVersion: LIFECYCLE_EXECUTION_QUEUE_VERSION,
    summary,
    approvalRegistry,
    persistenceDoc,
    approvalDoc,
    controlCenter,
    auditReview,
    queueResult,
    durable: true,
    ...PERSISTENCE_OWNERSHIP,
    explainable: true,
  });
}

export function ingestLifecycleToPersistence(groupId, tenantId = "default", options = {}) {
  return analyzeLifecyclePersistenceContext(groupId, tenantId, options);
}

export default { analyzeLifecyclePersistenceContext, ingestLifecycleToPersistence };
