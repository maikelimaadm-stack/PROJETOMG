/**
 * Business DNA retrieval — tenant-scoped, explainable reads.
 */
import {
  listDnaProfiles,
  listDnaFingerprints,
  listDnaPatterns,
  listDnaMaturityRecords,
  listDnaMilestones,
  listDnaGrowthSignals,
} from "./businessDnaStore.js";
import { DNA_PATTERN_TYPES } from "./businessDnaContracts.js";
import { explainDnaProfile, explainDnaFingerprint } from "./businessDnaExplainability.js";

export function retrieveBusinessDnaByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const profiles = listDnaProfiles(tenantId, { limit });
  const fingerprints = listDnaFingerprints(tenantId, { limit: 5 });
  const patterns = listDnaPatterns(tenantId, { limit: 50 });
  const maturity = listDnaMaturityRecords(tenantId, { limit: 30 });
  const milestones = listDnaMilestones(tenantId, { limit });
  const growthSignals = listDnaGrowthSignals(tenantId, { limit });

  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    profiles,
    fingerprints,
    patterns,
    operationalPatterns: patterns.filter((p) => p.patternType === DNA_PATTERN_TYPES.OPERATIONAL),
    culturalPatterns: patterns.filter((p) => p.patternType === DNA_PATTERN_TYPES.CULTURAL),
    maturity,
    milestones,
    growthSignals,
    explainable: true,
    individualProfilingForbidden: true,
  });
}

export function retrieveLatestBusinessDna(tenantId = "default") {
  const retrieved = retrieveBusinessDnaByContext(tenantId);
  const profile = retrieved.profiles[0] ?? null;
  const fingerprint = retrieved.fingerprints[0] ?? null;
  return Object.freeze({
    ...retrieved,
    profile,
    fingerprint,
    explainability: Object.freeze({
      profile: profile ? explainDnaProfile(profile) : null,
      fingerprint: fingerprint ? explainDnaFingerprint(fingerprint) : null,
    }),
  });
}

export default { retrieveBusinessDnaByContext, retrieveLatestBusinessDna };
