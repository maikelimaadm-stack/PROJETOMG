import { listSyncRecords, listSyncErrors, listSyncRetries, getLatestHealthSnapshot } from "./durabilitySyncStore.js";

export function summarizeLifecycleSync(groupId) {
  const records = listSyncRecords(groupId);
  const errors = listSyncErrors(groupId);
  const retries = listSyncRetries(groupId);
  const health = getLatestHealthSnapshot(groupId);

  const synced = records.filter((r) => r.status === "synced").length;
  const diverged = records.filter((r) => r.status === "diverged").length;
  const pending = records.filter((r) => r.status === "pending").length;

  const headline =
    diverged > 0
      ? `${diverged} divergência(s) entre frontend e backend requerem atenção.`
      : pending > 0
        ? `${pending} item(ns) aguardando sincronização com backend.`
        : synced > 0
          ? "Ciclo de vida sincronizado com backend, storage e auditoria."
          : "Sincronização de ciclo de vida pronta para operação.";

  return Object.freeze({
    groupId,
    headline,
    syncedCount: synced,
    divergedCount: diverged,
    pendingCount: pending,
    errorCount: errors.length,
    retryCount: retries.filter((r) => r.status !== "completed").length,
    healthStatus: health?.status ?? "unknown",
    durable: true,
    explainable: true,
  });
}

export default summarizeLifecycleSync;
