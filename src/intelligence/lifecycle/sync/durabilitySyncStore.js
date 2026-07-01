import {
  LIFECYCLE_SYNC_VERSION,
  SYNC_OWNERSHIP,
} from "./lifecycleSyncContracts.js";

const STORAGE_KEY = "mak-lifecycle-sync-v1";
const memoryFallback = {};

function emptyStore() {
  return {
    schemaVersion: LIFECYCLE_SYNC_VERSION,
    syncRecords: [],
    syncErrors: [],
    retries: [],
    notifications: [],
    storageActions: [],
    backupActions: [],
    monitoringEvents: [],
    healthSnapshots: [],
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
    schemaVersion: LIFECYCLE_SYNC_VERSION,
    syncRecords: (data.syncRecords ?? []).slice(0, 300),
    syncErrors: (data.syncErrors ?? []).slice(0, 200),
    retries: (data.retries ?? []).slice(0, 200),
    notifications: (data.notifications ?? []).slice(0, 200),
    storageActions: (data.storageActions ?? []).slice(0, 200),
    backupActions: (data.backupActions ?? []).slice(0, 200),
    monitoringEvents: (data.monitoringEvents ?? []).slice(0, 300),
    healthSnapshots: (data.healthSnapshots ?? []).slice(0, 50),
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

export function getSyncStoreInfo() {
  return Object.freeze({
    schemaVersion: LIFECYCLE_SYNC_VERSION,
    durable: true,
    backendCapable: true,
    ...SYNC_OWNERSHIP,
  });
}

export function upsertSyncRecord(record) {
  const store = readStore();
  return upsert("syncRecords", "syncId", record, store);
}

export function appendSyncError(error) {
  const store = readStore();
  const record = Object.freeze({
    errorId: error.errorId ?? `lsync-err-${error.groupId}-${Date.now()}`,
    ...error,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.syncErrors = [record, ...store.syncErrors].slice(0, 200);
  writeStore(store);
  return record;
}

export function appendSyncRetry(retry) {
  const store = readStore();
  const record = Object.freeze({
    retryId: retry.retryId ?? `lsync-retry-${retry.groupId}-${Date.now()}`,
    ...retry,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.retries = [record, ...store.retries].slice(0, 200);
  writeStore(store);
  return record;
}

export function appendNotification(notification) {
  const store = readStore();
  const record = Object.freeze({
    notificationId: notification.notificationId ?? `lnotif-${notification.groupId}-${Date.now()}`,
    ...notification,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.notifications = [record, ...store.notifications].slice(0, 200);
  writeStore(store);
  return record;
}

export function appendStorageAction(action) {
  const store = readStore();
  const record = Object.freeze({
    actionId: action.actionId ?? `lstor-sync-${action.groupId}-${Date.now()}`,
    ...action,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.storageActions = [record, ...store.storageActions].slice(0, 200);
  writeStore(store);
  return record;
}

export function appendBackupAction(action) {
  const store = readStore();
  const record = Object.freeze({
    actionId: action.actionId ?? `lbak-sync-${action.groupId}-${Date.now()}`,
    ...action,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.backupActions = [record, ...store.backupActions].slice(0, 200);
  writeStore(store);
  return record;
}

export function appendMonitoringEvent(event) {
  const store = readStore();
  const record = Object.freeze({
    eventId: event.eventId ?? `lmon-${event.groupId}-${Date.now()}`,
    ...event,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  store.monitoringEvents = [record, ...store.monitoringEvents].slice(0, 300);
  writeStore(store);
  return record;
}

export function upsertHealthSnapshot(snapshot) {
  const store = readStore();
  return upsert("healthSnapshots", "healthId", snapshot, store);
}

export function listSyncRecords(groupId, options = {}) {
  return readStore().syncRecords.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 100);
}

export function listSyncErrors(groupId, options = {}) {
  return readStore().syncErrors.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listSyncRetries(groupId, options = {}) {
  return readStore().retries.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listNotifications(groupId, options = {}) {
  return readStore().notifications.filter((n) => n.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listStorageActions(groupId, options = {}) {
  return readStore().storageActions.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listBackupActions(groupId, options = {}) {
  return readStore().backupActions.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listMonitoringEvents(groupId, options = {}) {
  return readStore().monitoringEvents.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 50);
}

export function getLatestHealthSnapshot(groupId) {
  return readStore().healthSnapshots.find((h) => h.groupId === groupId) ?? null;
}

export default { getSyncStoreInfo, upsertSyncRecord, appendSyncError };
