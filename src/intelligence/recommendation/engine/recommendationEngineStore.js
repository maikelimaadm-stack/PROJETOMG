import {
  RECOMMENDATION_STORE_VERSION,
  RECOMMENDATION_OWNERSHIP,
  RECOMMENDATION_LIFECYCLE_STATES,
} from "./recommendationEngineContracts.js";

const STORAGE_KEY = "mak-recommendation-engine-v1";
const memoryFallback = {
  recommendations: [],
  signals: [],
  candidates: [],
  plans: [],
  replications: [],
  replicationTargets: [],
  replicationPlans: [],
};

function readStore() {
  if (typeof localStorage === "undefined") {
    return { ...memoryFallback, recommendations: [...memoryFallback.recommendations] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { recommendations: [], signals: [], candidates: [], plans: [], replications: [], replicationTargets: [], replicationPlans: [] };
    return JSON.parse(raw);
  } catch {
    return { recommendations: [], signals: [], candidates: [], plans: [], replications: [], replicationTargets: [], replicationPlans: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    recommendations: (data.recommendations ?? []).slice(0, 200),
    signals: (data.signals ?? []).slice(0, 300),
    candidates: (data.candidates ?? []).slice(0, 200),
    plans: (data.plans ?? []).slice(0, 100),
    replications: (data.replications ?? []).slice(0, 100),
    replicationTargets: (data.replicationTargets ?? []).slice(0, 100),
    replicationPlans: (data.replicationPlans ?? []).slice(0, 100),
  };
  if (typeof localStorage === "undefined") {
    Object.assign(memoryFallback, trimmed);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getRecommendationEngineStoreInfo() {
  return Object.freeze({
    schemaVersion: RECOMMENDATION_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export function upsertRecommendation(record) {
  const store = readStore();
  store.recommendations = [record, ...store.recommendations.filter((r) => r.recommendationId !== record.recommendationId)];
  writeStore(store);
  return record;
}

export function upsertRecommendationSignal(signal) {
  const store = readStore();
  store.signals = [signal, ...store.signals.filter((s) => s.signalId !== signal.signalId)];
  writeStore(store);
  return signal;
}

export function upsertRecommendationCandidate(candidate) {
  const store = readStore();
  store.candidates = [candidate, ...store.candidates.filter((c) => c.candidateId !== candidate.candidateId)];
  writeStore(store);
  return candidate;
}

export function upsertRecommendationPlan(plan) {
  const store = readStore();
  store.plans = [plan, ...store.plans.filter((p) => p.planId !== plan.planId)];
  writeStore(store);
  return plan;
}

export function upsertReplicationDocument(doc) {
  const store = readStore();
  store.replications = [doc, ...store.replications.filter((r) => r.replicationId !== doc.replicationId)];
  writeStore(store);
  return doc;
}

export function upsertReplicationTarget(target) {
  const store = readStore();
  store.replicationTargets = [target, ...store.replicationTargets.filter((t) => t.targetId !== target.targetId)];
  writeStore(store);
  return target;
}

export function upsertReplicationPlan(plan) {
  const store = readStore();
  store.replicationPlans = [plan, ...store.replicationPlans.filter((p) => p.planId !== plan.planId)];
  writeStore(store);
  return plan;
}

export function listRecommendations(tenantId = "default", options = {}) {
  return readStore().recommendations.filter((r) => r.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listRecommendationSignals(tenantId = "default", options = {}) {
  return readStore().signals.filter((s) => s.tenantId === tenantId).slice(0, options.limit ?? 50);
}

export function listRecommendationCandidates(tenantId = "default", options = {}) {
  return readStore().candidates.filter((c) => c.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listRecommendationPlans(tenantId = "default", options = {}) {
  return readStore().plans.filter((p) => p.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listReplications(tenantId = "default", options = {}) {
  return readStore().replications.filter((r) => r.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listReplicationTargets(tenantId = "default", options = {}) {
  return readStore().replicationTargets.filter((t) => t.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listReplicationPlans(tenantId = "default", options = {}) {
  return readStore().replicationPlans.filter((p) => p.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function createRecommendation(partial) {
  return Object.freeze({
    recommendationId: partial.recommendationId ?? `rec-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    title: partial.title ?? "Recomendação de melhoria",
    summary: partial.summary ?? "",
    expectedImpact: partial.expectedImpact ?? "",
    confidence: partial.confidence ?? "medium",
    priority: partial.priority ?? "medium",
    lifecycleState: partial.lifecycleState ?? RECOMMENDATION_LIFECYCLE_STATES[1],
    requiresHumanApproval: true,
    ownership: RECOMMENDATION_OWNERSHIP,
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    lineage: Object.freeze(partial.lineage ?? []),
    explainable: true,
    autonomousExecutionForbidden: true,
    createdAt: new Date().toISOString(),
  });
}

export default { upsertRecommendation, getRecommendationEngineStoreInfo };
