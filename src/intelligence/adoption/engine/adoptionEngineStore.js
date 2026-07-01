import {
  ADOPTION_STORE_VERSION,
  ADOPTION_OWNERSHIP,
  ADOPTION_LIFECYCLE_STATES,
  ADOPTION_STATUS_TYPES,
} from "./adoptionEngineContracts.js";

const STORAGE_KEY = "mak-adoption-engine-v1";
const memoryFallback = {
  adoptions: [],
  plans: [],
  milestones: [],
  evidence: [],
  outcomes: [],
  events: [],
};

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      adoptions: [...memoryFallback.adoptions],
      plans: [...memoryFallback.plans],
      milestones: [...memoryFallback.milestones],
      evidence: [...memoryFallback.evidence],
      outcomes: [...memoryFallback.outcomes],
      events: [...memoryFallback.events],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { adoptions: [], plans: [], milestones: [], evidence: [], outcomes: [], events: [] };
    return JSON.parse(raw);
  } catch {
    return { adoptions: [], plans: [], milestones: [], evidence: [], outcomes: [], events: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    adoptions: (data.adoptions ?? []).slice(0, 200),
    plans: (data.plans ?? []).slice(0, 100),
    milestones: (data.milestones ?? []).slice(0, 200),
    evidence: (data.evidence ?? []).slice(0, 200),
    outcomes: (data.outcomes ?? []).slice(0, 100),
    events: (data.events ?? []).slice(0, 300),
  };
  if (typeof localStorage === "undefined") {
    Object.assign(memoryFallback, trimmed);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getAdoptionEngineStoreInfo() {
  return Object.freeze({
    schemaVersion: ADOPTION_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export function upsertAdoption(record) {
  const store = readStore();
  store.adoptions = [record, ...store.adoptions.filter((a) => a.adoptionId !== record.adoptionId)];
  writeStore(store);
  return record;
}

export function upsertAdoptionPlan(plan) {
  const store = readStore();
  store.plans = [plan, ...store.plans.filter((p) => p.planId !== plan.planId)];
  writeStore(store);
  return plan;
}

export function upsertAdoptionMilestone(milestone) {
  const store = readStore();
  store.milestones = [milestone, ...store.milestones.filter((m) => m.milestoneId !== milestone.milestoneId)];
  writeStore(store);
  return milestone;
}

export function upsertAdoptionEvidence(evidence) {
  const store = readStore();
  store.evidence = [evidence, ...store.evidence.filter((e) => e.evidenceId !== evidence.evidenceId)];
  writeStore(store);
  return evidence;
}

export function upsertAdoptionOutcome(outcome) {
  const store = readStore();
  store.outcomes = [outcome, ...store.outcomes.filter((o) => o.outcomeId !== outcome.outcomeId)];
  writeStore(store);
  return outcome;
}

export function upsertAdoptionEvent(event) {
  const store = readStore();
  store.events = [event, ...store.events.filter((e) => e.eventId !== event.eventId)];
  writeStore(store);
  return event;
}

export function listAdoptions(tenantId = "default", options = {}) {
  return readStore().adoptions.filter((a) => a.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listAdoptionPlans(tenantId = "default", options = {}) {
  return readStore().plans.filter((p) => p.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listAdoptionMilestones(tenantId = "default", options = {}) {
  return readStore().milestones.filter((m) => m.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listAdoptionEvidence(tenantId = "default", options = {}) {
  return readStore().evidence.filter((e) => e.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listAdoptionOutcomes(tenantId = "default", options = {}) {
  return readStore().outcomes.filter((o) => o.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listAdoptionEvents(tenantId = "default", options = {}) {
  return readStore().events.filter((e) => e.tenantId === tenantId).slice(0, options.limit ?? 50);
}

export function createAdoptionRecord(partial) {
  return Object.freeze({
    adoptionId: partial.adoptionId ?? `adopt-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    recommendationId: partial.recommendationId ?? null,
    replicationId: partial.replicationId ?? null,
    title: partial.title ?? "Acompanhamento de adoção",
    summary: partial.summary ?? "",
    status: partial.status ?? ADOPTION_STATUS_TYPES.PROPOSED,
    lifecycleState: partial.lifecycleState ?? ADOPTION_LIFECYCLE_STATES[1],
    progressPercent: partial.progressPercent ?? 0,
    requiresHumanApproval: true,
    ownership: ADOPTION_OWNERSHIP,
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    lineage: Object.freeze(partial.lineage ?? []),
    explainable: true,
    autonomousExecutionForbidden: true,
    createdAt: new Date().toISOString(),
  });
}

export default { upsertAdoption, getAdoptionEngineStoreInfo, createAdoptionRecord };
