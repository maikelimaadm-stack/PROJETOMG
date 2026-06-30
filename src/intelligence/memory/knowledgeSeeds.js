import { listBusinessMemoryRecords } from "../memory/businessMemoryStore.js";

/** Tenant-scoped knowledge seeds — assembled from memory, not AI weights */
export function buildTenantKnowledgeSeeds(tenantId = "default") {
  const memories = listBusinessMemoryRecords(tenantId, { limit: 30 });
  const seeds = memories.map((memory) =>
    Object.freeze({
      seedId: `seed-${memory.memoryId}`,
      tenantId,
      memoryType: memory.memoryType,
      sourceEventId: memory.eventId,
      summary: memory.explainability?.businessSummary ?? "",
      lineage: memory.lineage,
      recordedAt: memory.recordedAt,
      aiGenerated: false,
      tenantOwned: true,
    })
  );

  return Object.freeze({
    tenantId,
    seedCount: seeds.length,
    seeds: Object.freeze(seeds),
    assembledAt: new Date().toISOString(),
  });
}

export default buildTenantKnowledgeSeeds;
