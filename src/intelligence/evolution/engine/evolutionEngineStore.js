import {
  EVOLUTION_STORE_VERSION,
  EVOLUTION_DOCUMENT_SCHEMA_VERSION,
  EVOLUTION_PLAN_SCHEMA_VERSION,
  EVOLUTION_ROADMAP_SCHEMA_VERSION,
  EVOLUTION_OWNERSHIP,
  EVOLUTION_LIFECYCLE_STATES,
  MATURITY_LEVELS,
} from "./evolutionEngineContracts.js";

const STORAGE_KEY = "mak-enterprise-evolution-engine-v1";
const memoryFallback = { documents: [], plans: [], roadmaps: [], signals: [], milestones: [], progress: [] };

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      documents: [...memoryFallback.documents],
      plans: [...memoryFallback.plans],
      roadmaps: [...memoryFallback.roadmaps],
      signals: [...memoryFallback.signals],
      milestones: [...memoryFallback.milestones],
      progress: [...memoryFallback.progress],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { documents: [], plans: [], roadmaps: [], signals: [], milestones: [], progress: [] };
    return JSON.parse(raw);
  } catch {
    return { documents: [], plans: [], roadmaps: [], signals: [], milestones: [], progress: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    documents: (data.documents ?? []).slice(0, 300),
    plans: (data.plans ?? []).slice(0, 100),
    roadmaps: (data.roadmaps ?? []).slice(0, 50),
    signals: (data.signals ?? []).slice(0, 300),
    milestones: (data.milestones ?? []).slice(0, 100),
    progress: (data.progress ?? []).slice(0, 200),
  };
  if (typeof localStorage === "undefined") {
    memoryFallback.documents.length = 0;
    memoryFallback.documents.push(...trimmed.documents);
    memoryFallback.plans.length = 0;
    memoryFallback.plans.push(...trimmed.plans);
    memoryFallback.roadmaps.length = 0;
    memoryFallback.roadmaps.push(...trimmed.roadmaps);
    memoryFallback.signals.length = 0;
    memoryFallback.signals.push(...trimmed.signals);
    memoryFallback.milestones.length = 0;
    memoryFallback.milestones.push(...trimmed.milestones);
    memoryFallback.progress.length = 0;
    memoryFallback.progress.push(...trimmed.progress);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getEvolutionEngineStoreInfo() {
  return Object.freeze({
    schemaVersion: EVOLUTION_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
    autonomousExecutionForbidden: true,
  });
}

export function upsertEvolutionDocument(doc) {
  const store = readStore();
  store.documents = [doc, ...store.documents.filter((d) => d.evolutionId !== doc.evolutionId)];
  writeStore(store);
  return doc;
}

export function upsertEvolutionPlan(plan) {
  const store = readStore();
  store.plans = [plan, ...store.plans.filter((p) => p.planId !== plan.planId)];
  writeStore(store);
  return plan;
}

export function upsertEvolutionRoadmap(roadmap) {
  const store = readStore();
  store.roadmaps = [roadmap, ...store.roadmaps.filter((r) => r.roadmapId !== roadmap.roadmapId)];
  writeStore(store);
  return roadmap;
}

export function upsertEvolutionSignal(signal) {
  const store = readStore();
  store.signals = [signal, ...store.signals.filter((s) => s.signalId !== signal.signalId)];
  writeStore(store);
  return signal;
}

export function upsertEvolutionMilestone(milestone) {
  const store = readStore();
  store.milestones = [milestone, ...store.milestones.filter((m) => m.milestoneId !== milestone.milestoneId)];
  writeStore(store);
  return milestone;
}

export function upsertEvolutionProgress(entry) {
  const store = readStore();
  store.progress = [entry, ...store.progress.filter((p) => p.progressId !== entry.progressId)];
  writeStore(store);
  return entry;
}

export function listEvolutionDocuments(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  return readStore().documents.filter((d) => d.tenantId === tenantId).slice(0, limit);
}

export function listEvolutionPlans(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  return readStore().plans.filter((p) => p.tenantId === tenantId).slice(0, limit);
}

export function listEvolutionRoadmaps(tenantId = "default", options = {}) {
  const limit = options.limit ?? 10;
  return readStore().roadmaps.filter((r) => r.tenantId === tenantId).slice(0, limit);
}

export function listEvolutionSignals(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  return readStore().signals.filter((s) => s.tenantId === tenantId).slice(0, limit);
}

export function listEvolutionMilestones(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  return readStore().milestones.filter((m) => m.tenantId === tenantId).slice(0, limit);
}

export function listEvolutionProgress(tenantId = "default", options = {}) {
  const limit = options.limit ?? 30;
  return readStore().progress.filter((p) => p.tenantId === tenantId).slice(0, limit);
}

export function createEvolutionDocument(partial) {
  return Object.freeze({
    schemaVersion: EVOLUTION_DOCUMENT_SCHEMA_VERSION,
    evolutionId: partial.evolutionId ?? `evol-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    documentType: partial.documentType,
    title: partial.title ?? "Evolução organizacional",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? EVOLUTION_LIFECYCLE_STATES[1],
    maturityLevel: partial.maturityLevel ?? MATURITY_LEVELS[0],
    ownership: EVOLUTION_OWNERSHIP,
    lineage: Object.freeze(partial.lineage ?? []),
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    createdAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
    autonomousExecutionForbidden: true,
  });
}

export function createEvolutionPlan(partial) {
  return Object.freeze({
    schemaVersion: EVOLUTION_PLAN_SCHEMA_VERSION,
    planId: partial.planId ?? `eplan-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    title: partial.title ?? "Plano de evolução",
    objective: partial.objective ?? "",
    steps: Object.freeze(partial.steps ?? []),
    expectedImpact: partial.expectedImpact ?? "",
    confidence: partial.confidence ?? "medium",
    lifecycleState: partial.lifecycleState ?? EVOLUTION_LIFECYCLE_STATES[1],
    ownership: EVOLUTION_OWNERSHIP,
    explainable: true,
    aiGenerated: false,
    autonomousExecutionForbidden: true,
    createdAt: new Date().toISOString(),
  });
}

export function createEvolutionRoadmap(partial) {
  return Object.freeze({
    schemaVersion: EVOLUTION_ROADMAP_SCHEMA_VERSION,
    roadmapId: partial.roadmapId ?? `ermap-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    title: partial.title ?? "Roteiro de evolução",
    phases: Object.freeze(partial.phases ?? []),
    milestones: Object.freeze(partial.milestones ?? []),
    lifecycleState: partial.lifecycleState ?? EVOLUTION_LIFECYCLE_STATES[2],
    ownership: EVOLUTION_OWNERSHIP,
    explainable: true,
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  });
}

export default {
  upsertEvolutionDocument,
  upsertEvolutionPlan,
  upsertEvolutionRoadmap,
  listEvolutionDocuments,
  listEvolutionPlans,
};
