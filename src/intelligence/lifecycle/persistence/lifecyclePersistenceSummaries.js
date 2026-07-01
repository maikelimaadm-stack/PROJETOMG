import { retrievePersistentLifecycle } from "./lifecyclePersistenceRetrieval.js";
import { PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";

export function summarizeLifecyclePersistence(groupId) {
  const r = retrievePersistentLifecycle(groupId);
  const pending = r.approvalRequests.filter((x) => x.status === "pending").length;
  const approved = r.approvalRequests.filter((x) => x.status === "approved" || x.status === "executed").length;
  const rejected = r.approvalRequests.filter((x) => x.status === "rejected").length;
  const queued = r.executionJobs.filter((x) => x.status === "queued" || x.status === "processing").length;

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    headline: `${pending} pendentes · ${approved} aprovadas · ${queued} na fila · ${r.auditEntries.length} eventos auditados`,
    pendingApprovals: pending,
    approvedCount: approved,
    rejectedCount: rejected,
    queueCount: queued,
    auditCount: r.auditEntries.length,
    durable: true,
    explainable: true,
    ...PERSISTENCE_OWNERSHIP,
  });
}

export default summarizeLifecyclePersistence;
