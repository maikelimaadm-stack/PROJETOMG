import { listEnterpriseMemoryRecords } from "./enterpriseMemoryStore.js";

/** Memory seeds registry — feeds Knowledge, Consulting, Decision, Evolution engines */
export function buildMemorySeedsRegistry(tenantId = "default") {
  const records = listEnterpriseMemoryRecords(tenantId, { limit: 50 });
  const seeds = records.map((record) =>
    Object.freeze({
      seedId: `mseed-${record.memoryId}`,
      tenantId,
      memoryId: record.memoryId,
      storeType: record.storeType,
      summary: record.explainability?.businessSummary ?? "",
      whyItHappened: record.whyItHappened,
      lineage: record.lineage,
      occurredAt: record.occurredAt,
      intentId: record.intentId,
      workflowId: record.workflowId,
      assetId: record.assetId,
      tenantOwned: true,
      aiGenerated: false,
      engineReady: false,
    })
  );

  return Object.freeze({
    tenantId,
    seedCount: seeds.length,
    seeds: Object.freeze(seeds),
    registeredAt: new Date().toISOString(),
  });
}

export default buildMemorySeedsRegistry;
