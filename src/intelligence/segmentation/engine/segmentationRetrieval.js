import {
  listSegmentationProfiles,
  listSegmentationClassifications,
  listSegmentationRules,
  listMaturityBenchmarks,
  listTemplateMatches,
} from "./segmentationEngineStore.js";
import { explainSegmentationProfile } from "./segmentationExplainability.js";

export function retrieveSegmentationByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const profiles = listSegmentationProfiles(tenantId, { limit });
  const classifications = listSegmentationClassifications(tenantId, { limit });
  const rules = listSegmentationRules(tenantId, { limit: 50 });
  const benchmarks = listMaturityBenchmarks(tenantId, { limit: 30 });
  const templateMatches = listTemplateMatches(tenantId, { limit });

  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    profiles,
    classifications,
    rules,
    benchmarks,
    templateMatches,
    explainable: true,
    individualProfilingForbidden: true,
  });
}

export function retrieveLatestSegmentation(tenantId = "default") {
  const retrieved = retrieveSegmentationByContext(tenantId);
  const profile = retrieved.profiles[0] ?? null;
  const classification = retrieved.classifications[0] ?? null;
  return Object.freeze({
    ...retrieved,
    profile,
    classification,
    explainability: Object.freeze({
      profile: profile ? explainSegmentationProfile(profile) : null,
    }),
  });
}

export default { retrieveSegmentationByContext, retrieveLatestSegmentation };
