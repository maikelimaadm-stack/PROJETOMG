import { summarizeSegmentationEngine } from "./segmentationSummarization.js";
import { listSegmentationProfiles } from "./segmentationEngineStore.js";

const seedLog = [];

export function registerSegmentSeed(tenantId, seed = {}) {
  const record = Object.freeze({
    seedId: seed.seedId ?? `sseed-${tenantId}-${Date.now()}`,
    tenantId,
    segmentId: seed.segmentId ?? null,
    source: seed.source ?? "dna_to_segmentation_ingestion",
    registeredAt: new Date().toISOString(),
  });
  seedLog.unshift(record);
  return record;
}

export function buildSegmentSeedsRegistry(tenantId = "default") {
  const summary = summarizeSegmentationEngine(tenantId);
  const profiles = listSegmentationProfiles(tenantId, { limit: 10 });

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    seedCount: profiles.length,
    segmentSeeds: profiles.map((p) =>
      Object.freeze({ id: p.profileId, segment: p.segmentLabel })
    ),
    summary,
  });
}

export default { registerSegmentSeed, buildSegmentSeedsRegistry };
