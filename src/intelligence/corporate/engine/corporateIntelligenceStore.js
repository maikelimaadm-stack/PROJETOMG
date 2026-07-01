import {
  CORPORATE_INTELLIGENCE_STORE_VERSION,
  CORPORATE_OWNERSHIP,
  CORPORATE_LIFECYCLE_STATES,
} from "./corporateIntelligenceContracts.js";

const STORAGE_KEY = "mak-corporate-intelligence-v1";
const memoryFallback = {
  views: [],
  benchmarks: [],
  patterns: [],
  references: [],
  variances: [],
  opportunities: [],
  healthRecords: [],
};

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      views: [...memoryFallback.views],
      benchmarks: [...memoryFallback.benchmarks],
      patterns: [...memoryFallback.patterns],
      references: [...memoryFallback.references],
      variances: [...memoryFallback.variances],
      opportunities: [...memoryFallback.opportunities],
      healthRecords: [...memoryFallback.healthRecords],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { views: [], benchmarks: [], patterns: [], references: [], variances: [], opportunities: [], healthRecords: [] };
    }
    return JSON.parse(raw);
  } catch {
    return { views: [], benchmarks: [], patterns: [], references: [], variances: [], opportunities: [], healthRecords: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    views: (data.views ?? []).slice(0, 50),
    benchmarks: (data.benchmarks ?? []).slice(0, 100),
    patterns: (data.patterns ?? []).slice(0, 100),
    references: (data.references ?? []).slice(0, 100),
    variances: (data.variances ?? []).slice(0, 100),
    opportunities: (data.opportunities ?? []).slice(0, 100),
    healthRecords: (data.healthRecords ?? []).slice(0, 50),
  };
  if (typeof localStorage === "undefined") {
    Object.assign(memoryFallback, trimmed);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getCorporateIntelligenceStoreInfo() {
  return Object.freeze({
    schemaVersion: CORPORATE_INTELLIGENCE_STORE_VERSION,
    tenantScoped: true,
    groupScopedRequiresAuthorization: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    unauthorizedAggregationForbidden: true,
  });
}

export function upsertCorporateView(view) {
  const store = readStore();
  store.views = [view, ...store.views.filter((v) => v.viewId !== view.viewId)];
  writeStore(store);
  return view;
}

export function upsertCorporateBenchmark(benchmark) {
  const store = readStore();
  store.benchmarks = [benchmark, ...store.benchmarks.filter((b) => b.benchmarkId !== benchmark.benchmarkId)];
  writeStore(store);
  return benchmark;
}

export function upsertCorporatePattern(pattern) {
  const store = readStore();
  store.patterns = [pattern, ...store.patterns.filter((p) => p.patternId !== pattern.patternId)];
  writeStore(store);
  return pattern;
}

export function upsertCorporateReference(reference) {
  const store = readStore();
  store.references = [reference, ...store.references.filter((r) => r.referenceId !== reference.referenceId)];
  writeStore(store);
  return reference;
}

export function upsertCorporateVariance(variance) {
  const store = readStore();
  store.variances = [variance, ...store.variances.filter((v) => v.varianceId !== variance.varianceId)];
  writeStore(store);
  return variance;
}

export function upsertCorporateOpportunity(opportunity) {
  const store = readStore();
  store.opportunities = [opportunity, ...store.opportunities.filter((o) => o.opportunityId !== opportunity.opportunityId)];
  writeStore(store);
  return opportunity;
}

export function upsertCorporateHealthRecord(record) {
  const store = readStore();
  store.healthRecords = [record, ...store.healthRecords.filter((h) => h.healthId !== record.healthId)];
  writeStore(store);
  return record;
}

export function listCorporateViews(groupId, options = {}) {
  return readStore().views.filter((v) => v.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listCorporateBenchmarks(groupId, options = {}) {
  return readStore().benchmarks.filter((b) => b.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listCorporatePatterns(groupId, options = {}) {
  return readStore().patterns.filter((p) => p.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listCorporateReferences(groupId, options = {}) {
  return readStore().references.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listCorporateVariances(groupId, options = {}) {
  return readStore().variances.filter((v) => v.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listCorporateOpportunities(groupId, options = {}) {
  return readStore().opportunities.filter((o) => o.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listCorporateHealthRecords(groupId, options = {}) {
  return readStore().healthRecords.filter((h) => h.groupId === groupId).slice(0, options.limit ?? 10);
}

export function createCorporateView(partial) {
  return Object.freeze({
    viewId: partial.viewId ?? `corp-view-${partial.groupId}-${Date.now()}`,
    groupId: partial.groupId,
    ownerClientId: partial.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze(partial.authorizedTenantIds ?? []),
    title: partial.title ?? "Visão corporativa autorizada",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? CORPORATE_LIFECYCLE_STATES[1],
    ownership: CORPORATE_OWNERSHIP,
    explainable: true,
    createdAt: new Date().toISOString(),
  });
}

export default { upsertCorporateView, getCorporateIntelligenceStoreInfo };
