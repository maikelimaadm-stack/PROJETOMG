import {
  OPTIMIZATION_STORE_VERSION,
  OPTIMIZATION_OWNERSHIP,
  OPTIMIZATION_LIFECYCLE_STATES,
} from "./optimizationEngineContracts.js";

const STORAGE_KEY = "mak-optimization-engine-v1";
const memoryFallback = { loops: [], signals: [], opportunities: [], plans: [], milestones: [], benchmarks: [], events: [] };

function readStore() {
  if (typeof localStorage === "undefined") {
    return { loops: [], signals: [], opportunities: [], plans: [], milestones: [], benchmarks: [], events: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { loops: [], signals: [], opportunities: [], plans: [], milestones: [], benchmarks: [], events: [] };
    return JSON.parse(raw);
  } catch {
    return { loops: [], signals: [], opportunities: [], plans: [], milestones: [], benchmarks: [], events: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    loops: (data.loops ?? []).slice(0, 100),
    signals: (data.signals ?? []).slice(0, 200),
    opportunities: (data.opportunities ?? []).slice(0, 100),
    plans: (data.plans ?? []).slice(0, 100),
    milestones: (data.milestones ?? []).slice(0, 200),
    benchmarks: (data.benchmarks ?? []).slice(0, 50),
    events: (data.events ?? []).slice(0, 300),
  };
  if (typeof localStorage === "undefined") {
    Object.assign(memoryFallback, trimmed);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getOptimizationEngineStoreInfo() {
  return Object.freeze({
    schemaVersion: OPTIMIZATION_STORE_VERSION,
    tenantScoped: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export function upsertOptimizationLoop(record) {
  const store = readStore();
  store.loops = [record, ...store.loops.filter((l) => l.loopId !== record.loopId)];
  writeStore(store);
  return record;
}

export function upsertOptimizationSignal(signal) {
  const store = readStore();
  store.signals = [signal, ...store.signals.filter((s) => s.signalId !== signal.signalId)];
  writeStore(store);
  return signal;
}

export function upsertOptimizationOpportunity(opp) {
  const store = readStore();
  store.opportunities = [opp, ...store.opportunities.filter((o) => o.opportunityId !== opp.opportunityId)];
  writeStore(store);
  return opp;
}

export function upsertOptimizationPlan(plan) {
  const store = readStore();
  store.plans = [plan, ...store.plans.filter((p) => p.planId !== plan.planId)];
  writeStore(store);
  return plan;
}

export function upsertOptimizationMilestone(milestone) {
  const store = readStore();
  store.milestones = [milestone, ...store.milestones.filter((m) => m.milestoneId !== milestone.milestoneId)];
  writeStore(store);
  return milestone;
}

export function upsertOptimizationBenchmark(benchmark) {
  const store = readStore();
  store.benchmarks = [benchmark, ...store.benchmarks.filter((b) => b.benchmarkId !== benchmark.benchmarkId)];
  writeStore(store);
  return benchmark;
}

export function upsertOptimizationEvent(event) {
  const store = readStore();
  store.events = [event, ...store.events.filter((e) => e.eventId !== event.eventId)];
  writeStore(store);
  return event;
}

export function listOptimizationLoops(tenantId = "default", options = {}) {
  return readStore().loops.filter((l) => l.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listOptimizationSignals(tenantId = "default", options = {}) {
  return readStore().signals.filter((s) => s.tenantId === tenantId).slice(0, options.limit ?? 50);
}

export function listOptimizationOpportunities(tenantId = "default", options = {}) {
  return readStore().opportunities.filter((o) => o.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listOptimizationPlans(tenantId = "default", options = {}) {
  return readStore().plans.filter((p) => p.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listOptimizationMilestones(tenantId = "default", options = {}) {
  return readStore().milestones.filter((m) => m.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listOptimizationBenchmarks(tenantId = "default", options = {}) {
  return readStore().benchmarks.filter((b) => b.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function createOptimizationLoop(partial) {
  return Object.freeze({
    loopId: partial.loopId ?? `oloop-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    title: partial.title ?? "Loop de otimização operacional",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? OPTIMIZATION_LIFECYCLE_STATES[1],
    frictionScore: partial.frictionScore ?? 0,
    requiresHumanApproval: true,
    ownership: OPTIMIZATION_OWNERSHIP,
    lineage: Object.freeze(partial.lineage ?? []),
    explainable: true,
    autonomousExecutionForbidden: true,
    createdAt: new Date().toISOString(),
  });
}

export default { upsertOptimizationLoop, getOptimizationEngineStoreInfo };
