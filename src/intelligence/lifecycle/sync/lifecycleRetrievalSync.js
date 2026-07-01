import {
  listSyncRecords,
  listSyncErrors,
  listSyncRetries,
  listNotifications,
  listStorageActions,
  listBackupActions,
  listMonitoringEvents,
  getLatestHealthSnapshot,
} from "./durabilitySyncStore.js";

export function retrieveSyncState(groupId) {
  return Object.freeze({
    groupId,
    syncRecords: listSyncRecords(groupId),
    syncErrors: listSyncErrors(groupId),
    retries: listSyncRetries(groupId),
    notifications: listNotifications(groupId),
    storageActions: listStorageActions(groupId),
    backupActions: listBackupActions(groupId),
    monitoringEvents: listMonitoringEvents(groupId),
    health: getLatestHealthSnapshot(groupId),
    durable: true,
    explainable: true,
  });
}

export default retrieveSyncState;
