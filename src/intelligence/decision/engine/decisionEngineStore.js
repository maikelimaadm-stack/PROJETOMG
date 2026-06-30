import {
  DECISION_STORE_VERSION,
  DECISION_DOCUMENT_SCHEMA_VERSION,
  DECISION_OPTION_SCHEMA_VERSION,
  DECISION_SCENARIO_SCHEMA_VERSION,
  DECISION_OWNERSHIP,
  DECISION_LIFECYCLE_STATES,
} from "./decisionEngineContracts.js";

const STORAGE_KEY = "mak-enterprise-decision-engine-v1";
const memoryFallback = { documents: [], options: [], scenarios: [], evidence: [], audit: [] };

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      documents: [...memoryFallback.documents],
      options: [...memoryFallback.options],
      scenarios: [...memoryFallback.scenarios],
      evidence: [...memoryFallback.evidence],
      audit: [...memoryFallback.audit],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { documents: [], options: [], scenarios: [], evidence: [], audit: [] };
    return JSON.parse(raw);
  } catch {
    return { documents: [], options: [], scenarios: [], evidence: [], audit: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    documents: (data.documents ?? []).slice(0, 300),
    options: (data.options ?? []).slice(0, 600),
    scenarios: (data.scenarios ?? []).slice(0, 200),
    evidence: (data.evidence ?? []).slice(0, 400),
    audit: (data.audit ?? []).slice(0, 200),
  };
  if (typeof localStorage === "undefined") {
    memoryFallback.documents.length = 0;
    memoryFallback.documents.push(...trimmed.documents);
    memoryFallback.options.length = 0;
    memoryFallback.options.push(...trimmed.options);
    memoryFallback.scenarios.length = 0;
    memoryFallback.scenarios.push(...trimmed.scenarios);
    memoryFallback.evidence.length = 0;
    memoryFallback.evidence.push(...trimmed.evidence);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getDecisionEngineStoreInfo() {
  return Object.freeze({
    schemaVersion: DECISION_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
    autonomousExecutionForbidden: true,
  });
}

export function upsertDecisionDocument(doc) {
  const store = readStore();
  store.documents = [doc, ...store.documents.filter((d) => d.decisionId !== doc.decisionId)];
  writeStore(store);
  return doc;
}

export function upsertDecisionOption(option) {
  const store = readStore();
  store.options = [option, ...store.options.filter((o) => o.optionId !== option.optionId)];
  writeStore(store);
  return option;
}

export function upsertDecisionScenario(scenario) {
  const store = readStore();
  store.scenarios = [scenario, ...store.scenarios.filter((s) => s.scenarioId !== scenario.scenarioId)];
  writeStore(store);
  return scenario;
}

export function upsertDecisionEvidence(evidence) {
  const store = readStore();
  store.evidence = [evidence, ...store.evidence.filter((e) => e.evidenceId !== evidence.evidenceId)];
  writeStore(store);
  return evidence;
}

export function listDecisionDocuments(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  let docs = readStore().documents.filter((d) => d.tenantId === tenantId);
  if (options.lifecycleState) docs = docs.filter((d) => d.lifecycleState === options.lifecycleState);
  return docs.slice(0, limit);
}

export function listDecisionOptions(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  let opts = readStore().options.filter((o) => o.tenantId === tenantId);
  if (options.decisionId) opts = opts.filter((o) => o.decisionId === options.decisionId);
  return opts.slice(0, limit);
}

export function listDecisionScenarios(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  let scenarios = readStore().scenarios.filter((s) => s.tenantId === tenantId);
  if (options.decisionId) scenarios = scenarios.filter((s) => s.decisionId === options.decisionId);
  return scenarios.slice(0, limit);
}

export function listDecisionEvidence(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  let evidence = readStore().evidence.filter((e) => e.tenantId === tenantId);
  if (options.decisionId) evidence = evidence.filter((e) => e.decisionId === options.decisionId);
  return evidence.slice(0, limit);
}

export function createDecisionDocument(partial) {
  return Object.freeze({
    schemaVersion: DECISION_DOCUMENT_SCHEMA_VERSION,
    decisionId: partial.decisionId ?? `ddec-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    documentType: partial.documentType,
    title: partial.title ?? "Decisão de negócio",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? DECISION_LIFECYCLE_STATES[1],
    confidence: partial.confidence ?? "medium",
    ownership: DECISION_OWNERSHIP,
    lineage: Object.freeze(partial.lineage ?? []),
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    consultingRefId: partial.consultingRefId ?? null,
    createdAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
    autonomousExecutionForbidden: true,
  });
}

export function createDecisionOption(partial) {
  return Object.freeze({
    schemaVersion: DECISION_OPTION_SCHEMA_VERSION,
    optionId: partial.optionId ?? `dopt-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    decisionId: partial.decisionId,
    optionType: partial.optionType,
    label: partial.label ?? "Alternativa",
    description: partial.description ?? "",
    expectedImpact: partial.expectedImpact ?? "",
    riskLevel: partial.riskLevel ?? "medium",
    confidence: partial.confidence ?? "medium",
    explainable: true,
    aiGenerated: false,
  });
}

export function createDecisionScenario(partial) {
  return Object.freeze({
    schemaVersion: DECISION_SCENARIO_SCHEMA_VERSION,
    scenarioId: partial.scenarioId ?? `dscn-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    decisionId: partial.decisionId,
    label: partial.label ?? "Cenário",
    description: partial.description ?? "",
    probability: partial.probability ?? "medium",
    expectedOutcome: partial.expectedOutcome ?? "",
    optionId: partial.optionId ?? null,
    explainable: true,
    aiGenerated: false,
  });
}

export default {
  upsertDecisionDocument,
  upsertDecisionOption,
  upsertDecisionScenario,
  listDecisionDocuments,
  listDecisionOptions,
};
