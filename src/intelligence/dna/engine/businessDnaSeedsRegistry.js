/**
 * Business DNA seeds registry — tenant-scoped ingestion lineage.
 */
import { summarizeBusinessDnaEngine } from "./businessDnaSummarization.js";
import { listDnaProfiles, listDnaMaturityRecords } from "./businessDnaStore.js";

const seedLog = [];

export function registerBusinessDnaSeed(tenantId, seed = {}) {
  const record = Object.freeze({
    seedId: seed.seedId ?? `bseed-${tenantId}-${Date.now()}`,
    tenantId,
    profileId: seed.profileId ?? null,
    source: seed.source ?? "evolution_to_dna_ingestion",
    registeredAt: new Date().toISOString(),
  });
  seedLog.unshift(record);
  return record;
}

export function buildBusinessDnaSeedsRegistry(tenantId = "default") {
  const summary = summarizeBusinessDnaEngine(tenantId);
  const profiles = listDnaProfiles(tenantId, { limit: 10 });
  const maturity = listDnaMaturityRecords(tenantId, { limit: 10 });

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    seedCount: profiles.length + maturity.length,
    profileSeeds: profiles.map((p) => Object.freeze({ id: p.profileId, title: p.title })),
    maturitySeeds: maturity.map((m) =>
      Object.freeze({ id: m.recordId, label: m.label, level: m.level })
    ),
    summary,
  });
}

export default { registerBusinessDnaSeed, buildBusinessDnaSeedsRegistry };
