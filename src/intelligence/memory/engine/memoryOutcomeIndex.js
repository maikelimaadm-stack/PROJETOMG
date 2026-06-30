const outcomeIndex = new Map();

export function indexMemoryOutcome(record) {
  const tenantIndex = outcomeIndex.get(record.tenantId) ?? [];
  const entry = Object.freeze({
    outcomeId: `out-${record.memoryId}`,
    memoryId: record.memoryId,
    tenantId: record.tenantId,
    eventType: record.eventType,
    storeType: record.storeType,
    success: record.outcome?.success ?? record.outcome?.terminal ?? null,
    status: record.outcome?.status ?? null,
    workflowId: record.workflowId,
    intentId: record.intentId,
    assetId: record.assetId,
    occurredAt: record.occurredAt,
  });
  tenantIndex.unshift(entry);
  outcomeIndex.set(record.tenantId, tenantIndex.slice(0, 500));
  return entry;
}

export function queryOutcomes(tenantId = "default", options = {}) {
  const items = outcomeIndex.get(tenantId) ?? [];
  let filtered = items;
  if (options.workflowId) filtered = filtered.filter((o) => o.workflowId === options.workflowId);
  if (options.intentId) filtered = filtered.filter((o) => o.intentId === options.intentId);
  if (options.assetId) filtered = filtered.filter((o) => o.assetId === options.assetId);
  return filtered.slice(0, options.limit ?? 50);
}

export default indexMemoryOutcome;
