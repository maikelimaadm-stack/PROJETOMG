import {
  SEGMENTATION_STORE_VERSION,
  SEGMENTATION_OWNERSHIP,
  SEGMENTATION_LIFECYCLE_STATES,
} from "./segmentationEngineContracts.js";

const STORAGE_KEY = "mak-segmentation-engine-v1";
const memoryFallback = { profiles: [], classifications: [], rules: [], benchmarks: [], matches: [] };

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      profiles: [...memoryFallback.profiles],
      classifications: [...memoryFallback.classifications],
      rules: [...memoryFallback.rules],
      benchmarks: [...memoryFallback.benchmarks],
      matches: [...memoryFallback.matches],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profiles: [], classifications: [], rules: [], benchmarks: [], matches: [] };
    return JSON.parse(raw);
  } catch {
    return { profiles: [], classifications: [], rules: [], benchmarks: [], matches: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    profiles: (data.profiles ?? []).slice(0, 200),
    classifications: (data.classifications ?? []).slice(0, 200),
    rules: (data.rules ?? []).slice(0, 100),
    benchmarks: (data.benchmarks ?? []).slice(0, 100),
    matches: (data.matches ?? []).slice(0, 200),
  };
  if (typeof localStorage === "undefined") {
    Object.assign(memoryFallback, trimmed);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getSegmentationEngineStoreInfo() {
  return Object.freeze({
    schemaVersion: SEGMENTATION_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    portfolioRequiresAuthorization: true,
  });
}

export function upsertSegmentationProfile(profile) {
  const store = readStore();
  store.profiles = [profile, ...store.profiles.filter((p) => p.profileId !== profile.profileId)];
  writeStore(store);
  return profile;
}

export function upsertSegmentationClassification(classification) {
  const store = readStore();
  store.classifications = [
    classification,
    ...store.classifications.filter((c) => c.classificationId !== classification.classificationId),
  ];
  writeStore(store);
  return classification;
}

export function upsertSegmentationRule(rule) {
  const store = readStore();
  store.rules = [rule, ...store.rules.filter((r) => r.ruleId !== rule.ruleId)];
  writeStore(store);
  return rule;
}

export function upsertMaturityBenchmark(benchmark) {
  const store = readStore();
  store.benchmarks = [benchmark, ...store.benchmarks.filter((b) => b.benchmarkId !== benchmark.benchmarkId)];
  writeStore(store);
  return benchmark;
}

export function upsertTemplateMatch(match) {
  const store = readStore();
  store.matches = [match, ...store.matches.filter((m) => m.matchId !== match.matchId)];
  writeStore(store);
  return match;
}

export function listSegmentationProfiles(tenantId = "default", options = {}) {
  return readStore().profiles.filter((p) => p.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listSegmentationClassifications(tenantId = "default", options = {}) {
  return readStore().classifications.filter((c) => c.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listSegmentationRules(tenantId = "default", options = {}) {
  return readStore().rules.filter((r) => r.tenantId === tenantId).slice(0, options.limit ?? 50);
}

export function listMaturityBenchmarks(tenantId = "default", options = {}) {
  return readStore().benchmarks.filter((b) => b.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listTemplateMatches(tenantId = "default", options = {}) {
  return readStore().matches.filter((m) => m.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function createSegmentationProfile(partial) {
  return Object.freeze({
    profileId: partial.profileId ?? `sprof-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    segmentId: partial.segmentId,
    segmentLabel: partial.segmentLabel ?? "",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? SEGMENTATION_LIFECYCLE_STATES[1],
    ownership: SEGMENTATION_OWNERSHIP,
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    lineage: Object.freeze(partial.lineage ?? []),
    explainable: true,
    individualProfilingForbidden: true,
    createdAt: new Date().toISOString(),
  });
}

export default {
  upsertSegmentationProfile,
  upsertSegmentationClassification,
  getSegmentationEngineStoreInfo,
};
