import { listEnterpriseMemoryRecords } from "./enterpriseMemoryStore.js";
import { filterRetainedRecords } from "./memoryRetentionPolicies.js";
import { explainMemoryRecord } from "./memoryExplainability.js";

export function retrieveMemoryRecords(tenantId = "default", query = {}) {
  let records = listEnterpriseMemoryRecords(tenantId, {
    limit: query.limit ?? 100,
    storeType: query.storeType ?? null,
  });
  records = filterRetainedRecords(records, tenantId);

  if (query.workflowId) records = records.filter((r) => r.workflowId === query.workflowId);
  if (query.intentId) records = records.filter((r) => r.intentId === query.intentId);
  if (query.assetId) records = records.filter((r) => r.assetId === query.assetId);
  if (query.eventType) records = records.filter((r) => r.eventType === query.eventType);
  if (query.since) {
    records = records.filter((r) => new Date(r.occurredAt) >= new Date(query.since));
  }

  return records.map((r) =>
    Object.freeze({
      ...r,
      explanation: explainMemoryRecord(r),
    })
  );
}

export function retrieveLatestDecisions(tenantId, limit = 5) {
  return retrieveMemoryRecords(tenantId, {
    storeType: "decision.memory.store",
    limit,
  });
}

export function retrieveLatestWorkflows(tenantId, limit = 5) {
  return retrieveMemoryRecords(tenantId, {
    storeType: "workflow.memory.store",
    limit,
  });
}

export default retrieveMemoryRecords;
