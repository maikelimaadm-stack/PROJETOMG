import {
  CONSULTING_STORE_VERSION,
  CONSULTING_DOCUMENT_SCHEMA_VERSION,
  CONSULTING_RECOMMENDATION_SCHEMA_VERSION,
  IMPROVEMENT_PLAN_SCHEMA_VERSION,
  CONSULTING_OWNERSHIP,
  CONSULTING_LIFECYCLE_STATES,
} from "./consultingEngineContracts.js";

const STORAGE_KEY = "mak-enterprise-consulting-engine-v1";
const memoryFallback = { documents: [], recommendations: [], plans: [], signals: [], audit: [] };

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      documents: [...memoryFallback.documents],
      recommendations: [...memoryFallback.recommendations],
      plans: [...memoryFallback.plans],
      signals: [...memoryFallback.signals],
      audit: [...memoryFallback.audit],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { documents: [], recommendations: [], plans: [], signals: [], audit: [] };
    return JSON.parse(raw);
  } catch {
    return { documents: [], recommendations: [], plans: [], signals: [], audit: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    documents: (data.documents ?? []).slice(0, 500),
    recommendations: (data.recommendations ?? []).slice(0, 200),
    plans: (data.plans ?? []).slice(0, 100),
    signals: (data.signals ?? []).slice(0, 300),
    audit: (data.audit ?? []).slice(0, 200),
  };
  if (typeof localStorage === "undefined") {
    memoryFallback.documents.length = 0;
    memoryFallback.documents.push(...trimmed.documents);
    memoryFallback.recommendations.length = 0;
    memoryFallback.recommendations.push(...trimmed.recommendations);
    memoryFallback.plans.length = 0;
    memoryFallback.plans.push(...trimmed.plans);
    memoryFallback.signals.length = 0;
    memoryFallback.signals.push(...trimmed.signals);
    memoryFallback.audit.length = 0;
    memoryFallback.audit.push(...trimmed.audit);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getConsultingEngineStoreInfo() {
  return Object.freeze({
    schemaVersion: CONSULTING_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
    autonomousExecutionForbidden: true,
  });
}

export function upsertConsultingDocument(doc) {
  const store = readStore();
  store.documents = [doc, ...store.documents.filter((d) => d.documentId !== doc.documentId)];
  writeStore(store);
  return doc;
}

export function upsertConsultingRecommendation(rec) {
  const store = readStore();
  store.recommendations = [rec, ...store.recommendations.filter((r) => r.recommendationId !== rec.recommendationId)];
  writeStore(store);
  return rec;
}

export function upsertImprovementPlan(plan) {
  const store = readStore();
  store.plans = [plan, ...store.plans.filter((p) => p.planId !== plan.planId)];
  writeStore(store);
  return plan;
}

export function upsertConsultingSignal(signal) {
  const store = readStore();
  store.signals = [signal, ...store.signals.filter((s) => s.signalId !== signal.signalId)];
  writeStore(store);
  return signal;
}

export function listConsultingDocuments(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  let docs = readStore().documents.filter((d) => d.tenantId === tenantId);
  if (options.documentType) docs = docs.filter((d) => d.documentType === options.documentType);
  return docs.slice(0, limit);
}

export function listConsultingRecommendations(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  let recs = readStore().recommendations.filter((r) => r.tenantId === tenantId);
  if (options.priority) recs = recs.filter((r) => r.priority === options.priority);
  return recs.slice(0, limit);
}

export function listImprovementPlans(tenantId = "default", options = {}) {
  const limit = options.limit ?? 10;
  return readStore().plans.filter((p) => p.tenantId === tenantId).slice(0, limit);
}

export function listEngineConsultingSignals(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  let signals = readStore().signals.filter((s) => s.tenantId === tenantId);
  if (options.signalType) signals = signals.filter((s) => s.signalType === options.signalType);
  return signals.slice(0, limit);
}

export function createConsultingDocument(partial) {
  return Object.freeze({
    schemaVersion: CONSULTING_DOCUMENT_SCHEMA_VERSION,
    documentId: partial.documentId ?? `cdoc-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    documentType: partial.documentType,
    title: partial.title ?? "Análise operacional",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? CONSULTING_LIFECYCLE_STATES[1],
    ownership: CONSULTING_OWNERSHIP,
    lineage: Object.freeze(partial.lineage ?? []),
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    createdAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
  });
}

export function createConsultingRecommendation(partial) {
  return Object.freeze({
    schemaVersion: CONSULTING_RECOMMENDATION_SCHEMA_VERSION,
    recommendationId: partial.recommendationId ?? `crec-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    title: partial.title ?? "Recomendação operacional",
    explanation: partial.explanation ?? "",
    expectedImpact: partial.expectedImpact ?? "",
    priority: partial.priority ?? "medium",
    confidence: partial.confidence ?? "medium",
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    lineage: Object.freeze(partial.lineage ?? []),
    lifecycleState: partial.lifecycleState ?? CONSULTING_LIFECYCLE_STATES[1],
    ownership: CONSULTING_OWNERSHIP,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    createdAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
  });
}

export function createImprovementPlanRecord(partial) {
  return Object.freeze({
    schemaVersion: IMPROVEMENT_PLAN_SCHEMA_VERSION,
    planId: partial.planId ?? `cplan-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    title: partial.title ?? "Plano de melhoria",
    objective: partial.objective ?? "",
    steps: Object.freeze(partial.steps ?? []),
    recommendationIds: Object.freeze(partial.recommendationIds ?? []),
    expectedImpact: partial.expectedImpact ?? "",
    priority: partial.priority ?? "medium",
    lifecycleState: partial.lifecycleState ?? CONSULTING_LIFECYCLE_STATES[1],
    ownership: CONSULTING_OWNERSHIP,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    createdAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
  });
}

export default {
  upsertConsultingDocument,
  upsertConsultingRecommendation,
  upsertImprovementPlan,
  listConsultingDocuments,
  listConsultingRecommendations,
  listImprovementPlans,
};
