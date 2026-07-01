/**
 * Data Lifecycle Execution Queue — processes approved actions only.
 * @see Program 3.26
 */
import { LIFECYCLE_EXECUTION_QUEUE_VERSION, PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";
import { upsertExecutionJob, appendDurableAuditEntry, listExecutionJobs } from "./durableLifecycleStore.js";
import { finalizeExecutedRequest } from "./approvalWorkflowEngine.js";

export function enqueueLifecycleExecution(groupId, tenantId, approvedRequest, options = {}) {
  const job = upsertExecutionJob(
    Object.freeze({
      jobId: `ljob-${approvedRequest.requestId}`,
      groupId,
      tenantId,
      requestId: approvedRequest.requestId,
      actionType: approvedRequest.actionType,
      label: `Execução: ${approvedRequest.label}`,
      summary: "Na fila — aguardando processamento controlado.",
      status: "queued",
      humanApprovalRequired: true,
      approvedBy: options.actorId ?? approvedRequest.approvedBy ?? "administrador",
      explainable: true,
      queuedAt: new Date().toISOString(),
    })
  );

  appendDurableAuditEntry({
    groupId,
    tenantId,
    action: "execution_queued",
    entityId: job.jobId,
    entityType: "execution_job",
    humanApproved: true,
  });

  return job;
}

export function processExecutionQueue(groupId, options = {}) {
  const limit = options.limit ?? 10;
  const jobs = [];
  for (let i = 0; i < limit; i++) {
    const result = processNextQueuedJob(groupId);
    if (!result.processed) break;
    jobs.push(result.job);
  }
  return Object.freeze({ groupId, processedCount: jobs.length, jobs: Object.freeze(jobs), explainable: true });
}

export function processNextQueuedJob(groupId) {
  const store = readQueuedJobs(groupId);
  const next = store.find((j) => j.status === "queued");
  if (!next) {
    return Object.freeze({ processed: false, reason: "Fila vazia." });
  }

  const processing = upsertExecutionJob(
    Object.freeze({ ...next, status: "processing", startedAt: new Date().toISOString() })
  );

  appendDurableAuditEntry({
    groupId,
    action: "execution_processing",
    entityId: processing.jobId,
    entityType: "execution_job",
    humanApproved: true,
  });

  const nextState =
    processing.actionType === "archive"
      ? "archived"
      : processing.actionType === "expunge"
        ? "expunged"
        : processing.actionType === "legal_hold"
          ? "on_hold"
          : "executed";

  finalizeExecutedRequest(processing.requestId, {
    nextState,
    summary: `Ação ${processing.actionType} persistida.`,
  });

  const completed = upsertExecutionJob(
    Object.freeze({
      ...processing,
      status: "completed",
      completedAt: new Date().toISOString(),
      resultState: nextState,
    })
  );

  appendDurableAuditEntry({
    groupId,
    action: "execution_completed",
    entityId: completed.jobId,
    entityType: "execution_job",
    humanApproved: true,
    summary: completed.summary,
  });

  return Object.freeze({
    processed: true,
    engineVersion: LIFECYCLE_EXECUTION_QUEUE_VERSION,
    job: completed,
    ...PERSISTENCE_OWNERSHIP,
    explainable: true,
  });
}

function readQueuedJobs(groupId) {
  return listExecutionJobs(groupId, { limit: 50 });
}

export default { enqueueLifecycleExecution, processExecutionQueue, processNextQueuedJob };
