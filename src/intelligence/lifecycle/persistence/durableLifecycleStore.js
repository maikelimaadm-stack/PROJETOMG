import {
  LIFECYCLE_PERSISTENCE_VERSION,
  PERSISTENCE_OWNERSHIP,
  DURABLE_AUDIT_STORE_VERSION,
} from "./lifecyclePersistenceContracts.js";

const STORAGE_KEY = "mak-lifecycle-persistence-v1";
const memoryFallback = {};

function emptyStore() {
  return {
    schemaVersion: LIFECYCLE_PERSISTENCE_VERSION,
    persistenceDocs: [],
    approvalDocs: [],
    approvalRequests: [],
    executionJobs: [],
    auditEntries: [],
    stateRecords: [],
    transitions: [],
    storageEvents: [],
    backupEvents: [],
  };
}

function readStore() {
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyStore();
      return JSON.parse(raw);
    } catch {
      return emptyStore();
    }
  }
  return memoryFallback._data ?? emptyStore();
}

function writeStore(data) {
  const trimmed = {
    schemaVersion: LIFECYCLE_PERSISTENCE_VERSION,
    persistenceDocs: (data.persistenceDocs ?? []).slice(0, 50),
    approvalDocs: (data.approvalDocs ?? []).slice(0, 50),
    approvalRequests: (data.approvalRequests ?? []).slice(0, 200),
    executionJobs: (data.executionJobs ?? []).slice(0, 200),
    auditEntries: (data.auditEntries ?? []).slice(0, 1000),
    stateRecords: (data.stateRecords ?? []).slice(0, 300),
    transitions: (data.transitions ?? []).slice(0, 500),
    storageEvents: (data.storageEvents ?? []).slice(0, 200),
    backupEvents: (data.backupEvents ?? []).slice(0, 200),
  };

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } else {
    memoryFallback._data = trimmed;
  }
}

function upsert(collection, key, item, store) {
  store[collection] = [item, ...store[collection].filter((i) => i[key] !== item[key])];
  writeStore(store);
  return item;
}

export function getDurableStoreInfo() {
  return Object.freeze({
    schemaVersion: LIFECYCLE_PERSISTENCE_VERSION,
    auditStoreVersion: DURABLE_AUDIT_STORE_VERSION,
    durable: true,
    backendCapable: true,
    groupScopedRequiresAuthorization: true,
    ...PERSISTENCE_OWNERSHIP,
  });
}

export function upsertPersistenceDoc(doc) {
  const store = readStore();
  return upsert("persistenceDocs", "documentId", doc, store);
}

export function upsertApprovalDoc(doc) {
  const store = readStore();
  return upsert("approvalDocs", "documentId", doc, store);
}

export function upsertApprovalRequest(request) {
  const store = readStore();
  return upsert("approvalRequests", "requestId", request, store);
}

export function upsertExecutionJob(job) {
  const store = readStore();
  return upsert("executionJobs", "jobId", job, store);
}

export function appendDurableAuditEntry(entry) {
  const store = readStore();
  const record = Object.freeze({
    auditId: entry.auditId ?? `lpaudit-${entry.groupId}-${Date.now()}`,
    groupId: entry.groupId,
    tenantId: entry.tenantId ?? null,
    clienteId: entry.clienteId ?? null,
    action: entry.action,
    entityId: entry.entityId ?? null,
    entityType: entry.entityType ?? "lifecycle_persistence",
    actorId: entry.actorId ?? "system",
    humanApproved: entry.humanApproved ?? false,
    summary: entry.summary ?? "",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.auditEntries = [record, ...store.auditEntries].slice(0, 1000);
  writeStore(store);
  return record;
}

export function upsertStateRecord(state) {
  const store = readStore();
  return upsert("stateRecords", "stateId", state, store);
}

export function upsertTransition(transition) {
  const store = readStore();
  return upsert("transitions", "transitionId", transition, store);
}

export function appendStorageEvent(event) {
  const store = readStore();
  const record = Object.freeze({
    eventId: event.eventId ?? `lstor-${event.groupId}-${Date.now()}`,
    ...event,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.storageEvents = [record, ...store.storageEvents].slice(0, 200);
  writeStore(store);
  return record;
}

export function appendBackupEvent(event) {
  const store = readStore();
  const record = Object.freeze({
    eventId: event.eventId ?? `lbak-${event.groupId}-${Date.now()}`,
    ...event,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.backupEvents = [record, ...store.backupEvents].slice(0, 200);
  writeStore(store);
  return record;
}

export function listApprovalRequests(groupId, options = {}) {
  return readStore().approvalRequests.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listExecutionJobs(groupId, options = {}) {
  return readStore().executionJobs.filter((j) => j.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listDurableAuditEntries(groupId, options = {}) {
  return readStore().auditEntries.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 100);
}

export function listStateRecords(groupId, options = {}) {
  return readStore().stateRecords.filter((s) => s.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listTransitions(groupId, options = {}) {
  return readStore().transitions.filter((t) => t.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listStorageEvents(groupId, options = {}) {
  return readStore().storageEvents.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listBackupEvents(groupId, options = {}) {
  return readStore().backupEvents.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 30);
}

export function getApprovalRequest(requestId) {
  return readStore().approvalRequests.find((r) => r.requestId === requestId) ?? null;
}

export default {
  getDurableStoreInfo,
  upsertApprovalRequest,
  appendDurableAuditEntry,
};
