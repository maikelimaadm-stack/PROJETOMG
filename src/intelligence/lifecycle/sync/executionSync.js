import { upsertSyncRecord } from "./durabilitySyncStore.js";

export function syncExecutions(groupId, frontendJobs = [], backendJobs = []) {
  const backendById = new Map(backendJobs.map((j) => [j.jobId ?? j.entityId ?? j.id, j]));
  let synced = 0;
  let pending = 0;

  for (const fe of frontendJobs) {
    const key = fe.jobId ?? fe.entityId;
    const be = backendById.get(key);
    const feStatus = fe.status;
    const beStatus = be?.status;

    if (!be || feStatus !== beStatus) {
      pending += 1;
      upsertSyncRecord(
        Object.freeze({
          syncId: `lsync-exec-${key}`,
          groupId,
          entityType: "execution",
          entityId: key,
          label: fe.label,
          status: be ? "diverged" : "pending",
          summary: be ? "Execução com estado divergente." : "Aguardando processamento backend.",
          frontendState: feStatus,
          backendState: beStatus ?? null,
        })
      );
    } else {
      synced += 1;
      upsertSyncRecord(
        Object.freeze({
          syncId: `lsync-exec-${key}`,
          groupId,
          entityType: "execution",
          entityId: key,
          label: fe.label,
          status: "synced",
          summary: "Execução sincronizada.",
          frontendState: feStatus,
          backendState: beStatus,
        })
      );
    }
  }

  return Object.freeze({ synced, pending, explainable: true });
}

export default syncExecutions;
