import { upsertSyncRecord, appendSyncError } from "./durabilitySyncStore.js";

function mapApproval(r) {
  return Object.freeze({
    entityId: r.requestId,
    entityType: "approval",
    label: r.label,
    status: r.status,
    actionType: r.actionType,
    summary: r.summary ?? "",
  });
}

export function syncApprovals(groupId, frontendApprovals = [], backendApprovals = []) {
  const backendById = new Map(backendApprovals.map((a) => [a.entityId ?? a.id ?? a.requestId, a]));
  const results = [];
  let synced = 0;
  let diverged = 0;

  for (const fe of frontendApprovals) {
    const key = fe.requestId ?? fe.entityId;
    const be = backendById.get(key);
    const feStatus = fe.status;
    const beStatus = be?.status ?? be?.entityStatus;

    if (!be) {
      results.push(
        upsertSyncRecord(
          Object.freeze({
            syncId: `lsync-appr-${key}`,
            groupId,
            entityType: "approval",
            entityId: key,
            label: fe.label,
            status: "pending",
            summary: "Aguardando confirmação no backend.",
            frontendState: feStatus,
            backendState: null,
          })
        )
      );
      continue;
    }

    if (feStatus !== beStatus) {
      diverged += 1;
      appendSyncError({
        groupId,
        errorCode: "approval_divergence",
        summary: `Divergência de aprovação: frontend ${feStatus}, backend ${beStatus}.`,
        entityType: "approval",
        entityId: key,
        retryable: true,
      });
      results.push(
        upsertSyncRecord(
          Object.freeze({
            syncId: `lsync-appr-${key}`,
            groupId,
            entityType: "approval",
            entityId: key,
            label: fe.label,
            status: "diverged",
            summary: `Estados divergentes: ${feStatus} vs ${beStatus}.`,
            frontendState: feStatus,
            backendState: beStatus,
          })
        )
      );
    } else {
      synced += 1;
      results.push(
        upsertSyncRecord(
          Object.freeze({
            syncId: `lsync-appr-${key}`,
            groupId,
            entityType: "approval",
            entityId: key,
            label: fe.label,
            status: "synced",
            summary: "Aprovação sincronizada.",
            frontendState: feStatus,
            backendState: beStatus,
          })
        )
      );
    }
  }

  return Object.freeze({
    synced,
    diverged,
    pending: frontendApprovals.length - synced - diverged,
    items: results.map(mapApproval),
    explainable: true,
  });
}

export default syncApprovals;
