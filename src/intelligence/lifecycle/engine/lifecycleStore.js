import {
  LIFECYCLE_STORE_VERSION,
  LIFECYCLE_OWNERSHIP,
  LIFECYCLE_DATA_STATES,
  LIFECYCLE_DOCUMENT_TYPES,
} from "./dataLifecycleContracts.js";

const STORAGE_KEY = "mak-lifecycle-v1";
const memoryFallback = {};

function emptyStore() {
  return {
    lifecycleDocs: [],
    lifecycleRules: [],
    archiveRules: [],
    expungeRules: [],
    holdRules: [],
    schedules: [],
    lifecycleEvents: [],
    archiveLifecycles: [],
    expungeApprovals: [],
    holdEnforcements: [],
    dataStates: [],
    classifications: [],
    retentionExecutions: [],
    archiveExecutions: [],
    expungeExecutions: [],
    complianceRecords: [],
    exceptions: [],
    reviews: [],
    alerts: [],
    auditTrail: [],
  };
}

function readStore() {
  if (typeof localStorage === "undefined") {
    return memoryFallback._data ?? emptyStore();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    return JSON.parse(raw);
  } catch {
    return emptyStore();
  }
}

function writeStore(data) {
  const trimmed = {
    lifecycleDocs: (data.lifecycleDocs ?? []).slice(0, 50),
    lifecycleRules: (data.lifecycleRules ?? []).slice(0, 100),
    archiveRules: (data.archiveRules ?? []).slice(0, 100),
    expungeRules: (data.expungeRules ?? []).slice(0, 100),
    holdRules: (data.holdRules ?? []).slice(0, 100),
    schedules: (data.schedules ?? []).slice(0, 50),
    lifecycleEvents: (data.lifecycleEvents ?? []).slice(0, 200),
    archiveLifecycles: (data.archiveLifecycles ?? []).slice(0, 100),
    expungeApprovals: (data.expungeApprovals ?? []).slice(0, 100),
    holdEnforcements: (data.holdEnforcements ?? []).slice(0, 100),
    dataStates: (data.dataStates ?? []).slice(0, 200),
    classifications: (data.classifications ?? []).slice(0, 100),
    retentionExecutions: (data.retentionExecutions ?? []).slice(0, 100),
    archiveExecutions: (data.archiveExecutions ?? []).slice(0, 100),
    expungeExecutions: (data.expungeExecutions ?? []).slice(0, 100),
    complianceRecords: (data.complianceRecords ?? []).slice(0, 100),
    exceptions: (data.exceptions ?? []).slice(0, 50),
    reviews: (data.reviews ?? []).slice(0, 100),
    alerts: (data.alerts ?? []).slice(0, 50),
    auditTrail: (data.auditTrail ?? []).slice(0, 500),
  };
  if (typeof localStorage === "undefined") {
    memoryFallback._data = trimmed;
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

function upsert(collection, key, item, store) {
  store[collection] = [item, ...store[collection].filter((i) => i[key] !== item[key])];
  writeStore(store);
  return item;
}

export function getLifecycleStoreInfo() {
  return Object.freeze({
    schemaVersion: LIFECYCLE_STORE_VERSION,
    durable: true,
    groupScopedRequiresAuthorization: true,
    belongsToPlatform: true,
    archiveRequiresPolicyAndAudit: true,
    expungeRequiresPolicyAndAudit: true,
    stateChangeRequiresAuditTrail: true,
  });
}

export function upsertLifecycleDoc(doc) {
  const store = readStore();
  return upsert("lifecycleDocs", "documentId", doc, store);
}

export function upsertLifecycleRule(rule) {
  const store = readStore();
  return upsert("lifecycleRules", "ruleId", rule, store);
}

export function upsertArchiveRule(rule) {
  const store = readStore();
  return upsert("archiveRules", "ruleId", rule, store);
}

export function upsertExpungeRule(rule) {
  const store = readStore();
  return upsert("expungeRules", "ruleId", rule, store);
}

export function upsertHoldRule(rule) {
  const store = readStore();
  return upsert("holdRules", "ruleId", rule, store);
}

export function upsertLifecycleSchedule(schedule) {
  const store = readStore();
  return upsert("schedules", "scheduleId", schedule, store);
}

export function upsertLifecycleEvent(event) {
  const store = readStore();
  return upsert("lifecycleEvents", "eventId", event, store);
}

export function upsertArchiveLifecycle(record) {
  const store = readStore();
  return upsert("archiveLifecycles", "archiveLifecycleId", record, store);
}

export function upsertExpungeApproval(approval) {
  const store = readStore();
  return upsert("expungeApprovals", "approvalId", approval, store);
}

export function upsertHoldEnforcement(enforcement) {
  const store = readStore();
  return upsert("holdEnforcements", "enforcementId", enforcement, store);
}

export function upsertDataState(state) {
  const store = readStore();
  return upsert("dataStates", "stateId", state, store);
}

export function upsertDataClassification(classification) {
  const store = readStore();
  return upsert("classifications", "classificationId", classification, store);
}

export function upsertRetentionExecution(execution) {
  const store = readStore();
  return upsert("retentionExecutions", "executionId", execution, store);
}

export function upsertArchiveExecution(execution) {
  const store = readStore();
  return upsert("archiveExecutions", "executionId", execution, store);
}

export function upsertExpungeExecution(execution) {
  const store = readStore();
  return upsert("expungeExecutions", "executionId", execution, store);
}

export function upsertLifecycleComplianceRecord(record) {
  const store = readStore();
  return upsert("complianceRecords", "recordId", record, store);
}

export function upsertLifecycleException(exception) {
  const store = readStore();
  return upsert("exceptions", "exceptionId", exception, store);
}

export function upsertLifecycleReview(review) {
  const store = readStore();
  return upsert("reviews", "reviewId", review, store);
}

export function upsertLifecycleAlert(alert) {
  const store = readStore();
  return upsert("alerts", "alertId", alert, store);
}

export function appendLifecycleAuditEntry(entry) {
  const store = readStore();
  const record = Object.freeze({
    auditId: `lcaudit-${entry.groupId}-${Date.now()}`,
    groupId: entry.groupId,
    action: entry.action,
    entityId: entry.entityId ?? null,
    entityType: entry.entityType ?? "lifecycle",
    actorId: entry.actorId ?? "system",
    humanApproved: entry.humanApproved ?? false,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.auditTrail = [record, ...store.auditTrail].slice(0, 500);
  writeStore(store);
  return record;
}

export function listLifecycleDocs(groupId, options = {}) {
  return readStore().lifecycleDocs.filter((d) => d.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listLifecycleRules(groupId, options = {}) {
  return readStore().lifecycleRules.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listArchiveRules(groupId, options = {}) {
  return readStore().archiveRules.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listExpungeRules(groupId, options = {}) {
  return readStore().expungeRules.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listHoldRules(groupId, options = {}) {
  return readStore().holdRules.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listLifecycleSchedules(groupId, options = {}) {
  return readStore().schedules.filter((s) => s.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listLifecycleEvents(groupId, options = {}) {
  return readStore().lifecycleEvents.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listArchiveLifecycles(groupId, options = {}) {
  return readStore().archiveLifecycles.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listExpungeApprovals(groupId, options = {}) {
  return readStore().expungeApprovals.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listHoldEnforcements(groupId, options = {}) {
  return readStore().holdEnforcements.filter((h) => h.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listDataStates(groupId, options = {}) {
  return readStore().dataStates.filter((s) => s.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listDataClassifications(groupId, options = {}) {
  return readStore().classifications.filter((c) => c.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listRetentionExecutions(groupId, options = {}) {
  return readStore().retentionExecutions.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listArchiveExecutions(groupId, options = {}) {
  return readStore().archiveExecutions.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listExpungeExecutions(groupId, options = {}) {
  return readStore().expungeExecutions.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listLifecycleComplianceRecords(groupId, options = {}) {
  return readStore().complianceRecords.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listLifecycleExceptions(groupId, options = {}) {
  return readStore().exceptions.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listLifecycleReviews(groupId, options = {}) {
  return readStore().reviews.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listLifecycleAlerts(groupId, options = {}) {
  return readStore().alerts.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listLifecycleAuditTrail(groupId, options = {}) {
  return readStore().auditTrail.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 100);
}

export function createLifecycleDocument(partial) {
  return Object.freeze({
    documentId: partial.documentId ?? `ldoc-${partial.groupId}-${Date.now()}`,
    groupId: partial.groupId,
    docType: partial.docType ?? LIFECYCLE_DOCUMENT_TYPES?.LIFECYCLE ?? "lifecycle.document",
    ownerClientId: partial.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze(partial.authorizedTenantIds ?? []),
    title: partial.title ?? "Documento de ciclo de vida",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? LIFECYCLE_DATA_STATES[0],
    ownership: LIFECYCLE_OWNERSHIP,
    explainable: true,
    createdAt: new Date().toISOString(),
  });
}

export default { getLifecycleStoreInfo, upsertLifecycleDoc };
