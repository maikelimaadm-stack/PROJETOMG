import { FORTRESS_STORE_VERSION, FORTRESS_OWNERSHIP, FORTRESS_LIFECYCLE_STATES } from "./complianceFortressContracts.js";

const STORAGE_KEY = "mak-fortress-v1";
const memoryFallback = {
  complianceDocs: [],
  retentionDocs: [],
  auditDocs: [],
  complianceRules: [],
  retentionRules: [],
  auditRules: [],
  schedules: [],
  expunges: [],
  holds: [],
  archives: [],
  auditEvents: [],
  reviews: [],
  exceptions: [],
  alerts: [],
};

function emptyStore() {
  return {
    complianceDocs: [],
    retentionDocs: [],
    auditDocs: [],
    complianceRules: [],
    retentionRules: [],
    auditRules: [],
    schedules: [],
    expunges: [],
    holds: [],
    archives: [],
    auditEvents: [],
    reviews: [],
    exceptions: [],
    alerts: [],
  };
}

function readStore() {
  if (typeof localStorage === "undefined") return emptyStore();
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
    complianceDocs: (data.complianceDocs ?? []).slice(0, 50),
    retentionDocs: (data.retentionDocs ?? []).slice(0, 50),
    auditDocs: (data.auditDocs ?? []).slice(0, 50),
    complianceRules: (data.complianceRules ?? []).slice(0, 100),
    retentionRules: (data.retentionRules ?? []).slice(0, 100),
    auditRules: (data.auditRules ?? []).slice(0, 100),
    schedules: (data.schedules ?? []).slice(0, 50),
    expunges: (data.expunges ?? []).slice(0, 50),
    holds: (data.holds ?? []).slice(0, 50),
    archives: (data.archives ?? []).slice(0, 50),
    auditEvents: (data.auditEvents ?? []).slice(0, 200),
    reviews: (data.reviews ?? []).slice(0, 100),
    exceptions: (data.exceptions ?? []).slice(0, 50),
    alerts: (data.alerts ?? []).slice(0, 50),
  };
  if (typeof localStorage === "undefined") Object.assign(memoryFallback, trimmed);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getFortressStoreInfo() {
  return Object.freeze({
    schemaVersion: FORTRESS_STORE_VERSION,
    groupScopedRequiresAuthorization: true,
    belongsToPlatform: true,
    purgeRequiresPolicyAndAudit: true,
    retentionRequiresExplicitRule: true,
  });
}

function upsert(collection, key, item, store) {
  store[collection] = [item, ...store[collection].filter((i) => i[key] !== item[key])];
  writeStore(store);
  return item;
}

export function upsertComplianceDoc(doc) {
  const store = readStore();
  return upsert("complianceDocs", "documentId", doc, store);
}

export function upsertRetentionDoc(doc) {
  const store = readStore();
  return upsert("retentionDocs", "documentId", doc, store);
}

export function upsertAuditDoc(doc) {
  const store = readStore();
  return upsert("auditDocs", "documentId", doc, store);
}

export function upsertComplianceRule(rule) {
  const store = readStore();
  return upsert("complianceRules", "ruleId", rule, store);
}

export function upsertRetentionRule(rule) {
  const store = readStore();
  return upsert("retentionRules", "ruleId", rule, store);
}

export function upsertAuditRule(rule) {
  const store = readStore();
  return upsert("auditRules", "ruleId", rule, store);
}

export function upsertRetentionSchedule(schedule) {
  const store = readStore();
  return upsert("schedules", "scheduleId", schedule, store);
}

export function upsertExpungeRecord(record) {
  const store = readStore();
  return upsert("expunges", "expungeId", record, store);
}

export function upsertLegalHold(hold) {
  const store = readStore();
  return upsert("holds", "holdId", hold, store);
}

export function upsertArchiveRecord(archive) {
  const store = readStore();
  return upsert("archives", "archiveId", archive, store);
}

export function upsertAuditEvent(event) {
  const store = readStore();
  return upsert("auditEvents", "eventId", event, store);
}

export function upsertFortressReview(review) {
  const store = readStore();
  return upsert("reviews", "reviewId", review, store);
}

export function upsertFortressException(exception) {
  const store = readStore();
  return upsert("exceptions", "exceptionId", exception, store);
}

export function upsertFortressAlert(alert) {
  const store = readStore();
  return upsert("alerts", "alertId", alert, store);
}

export function listComplianceDocs(groupId, options = {}) {
  return readStore().complianceDocs.filter((d) => d.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listRetentionDocs(groupId, options = {}) {
  return readStore().retentionDocs.filter((d) => d.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listAuditDocs(groupId, options = {}) {
  return readStore().auditDocs.filter((d) => d.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listComplianceRules(groupId, options = {}) {
  return readStore().complianceRules.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listRetentionRules(groupId, options = {}) {
  return readStore().retentionRules.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listAuditRules(groupId, options = {}) {
  return readStore().auditRules.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listRetentionSchedules(groupId, options = {}) {
  return readStore().schedules.filter((s) => s.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listExpungeRecords(groupId, options = {}) {
  return readStore().expunges.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listLegalHolds(groupId, options = {}) {
  return readStore().holds.filter((h) => h.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listArchiveRecords(groupId, options = {}) {
  return readStore().archives.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listAuditEvents(groupId, options = {}) {
  return readStore().auditEvents.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listFortressReviews(groupId, options = {}) {
  return readStore().reviews.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listFortressExceptions(groupId, options = {}) {
  return readStore().exceptions.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listFortressAlerts(groupId, options = {}) {
  return readStore().alerts.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 20);
}

export function createFortressDocument(partial) {
  return Object.freeze({
    documentId: partial.documentId ?? `fdoc-${partial.groupId}-${Date.now()}`,
    groupId: partial.groupId,
    docType: partial.docType ?? "fortress.compliance",
    ownerClientId: partial.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze(partial.authorizedTenantIds ?? []),
    title: partial.title ?? "Documento de conformidade",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? FORTRESS_LIFECYCLE_STATES[1],
    ownership: FORTRESS_OWNERSHIP,
    explainable: true,
    createdAt: new Date().toISOString(),
  });
}

export default { getFortressStoreInfo, upsertComplianceDoc };
