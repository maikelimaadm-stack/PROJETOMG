import {
  listSyncStatesByGroup,
  upsertSyncState,
  appendSyncError,
  listSyncErrorsByGroup,
  listNotificationsByGroup,
  listStorageActionsByGroup,
  listBackupActionsByGroup,
  createStorageAction,
  createBackupAction,
} from "./lifecycleSyncRepository.js";
import { listApprovalRequestsByGroup } from "./lifecycleRepository.js";
import { resolveLifecycleTenantId } from "./lifecycleTenant.js";

/**
 * Defesa em profundidade: mesmo que um caller futuro esqueça de validar, o tenant
 * gravado tem de ser o do cliente. `tenant_id` não é subdivisão independente neste
 * produto — ver `lifecycleTenant.js`. O antigo fallback `"default"` sumiu: gravar
 * dado persistente sob um tenant não provado é pior do que recusar a operação.
 */
const assertTenantMatchesCliente = (clienteId, tenantId) => {
  const authorized = resolveLifecycleTenantId({ clienteId });
  if (String(tenantId) !== authorized) {
    const error = new Error("tenantId forbidden for authenticated scope.");
    error.statusCode = 403;
    error.code = "TENANT_FORBIDDEN";
    throw error;
  }
  return authorized;
};

export async function getSyncSnapshot(clienteId, groupId) {
  const [approvals, syncStates, errors, notifications, storageActions, backupActions] = await Promise.all([
    listApprovalRequestsByGroup(clienteId, groupId),
    listSyncStatesByGroup(clienteId, groupId),
    listSyncErrorsByGroup(clienteId, groupId),
    listNotificationsByGroup(clienteId, groupId),
    listStorageActionsByGroup(clienteId, groupId),
    listBackupActionsByGroup(clienteId, groupId),
  ]);

  return Object.freeze({
    approvals: approvals.map((a) => ({
      entityId: a.id,
      label: a.label,
      status: a.status,
      actionType: a.action_type,
    })),
    executions: [],
    audits: [],
    storageActions: storageActions.map((s) => ({
      entityId: s.id,
      label: s.storage_target,
      status: s.status,
      requestId: s.request_id,
    })),
    backupActions: backupActions.map((b) => ({
      entityId: b.id,
      label: b.backup_snapshot,
      status: b.status,
      requestId: b.request_id,
    })),
    syncStates,
    errors,
    notifications,
    durable: true,
  });
}

export async function pushSyncBatchBackend(clienteId, groupId, tenantId, batch) {
  const scopedTenantId = assertTenantMatchesCliente(clienteId, tenantId);
  let pushed = 0;

  for (const approval of batch.approvals ?? []) {
    await upsertSyncState({
      cliente_id: clienteId,
      group_id: groupId,
      tenant_id: scopedTenantId,
      entity_type: "approval",
      entity_id: approval.entityId,
      frontend_state: approval.status,
      backend_state: approval.status,
      sync_status: "synced",
      label: approval.label,
      summary: "Aprovação sincronizada via backend.",
      last_sync_at: new Date(),
    });
    pushed += 1;
  }

  for (const storage of batch.storageActions ?? []) {
    await createStorageAction({
      cliente_id: clienteId,
      group_id: groupId,
      tenant_id: scopedTenantId,
      request_id: storage.requestId ?? null,
      action_type: storage.actionType ?? "archive",
      storage_target: storage.storageTarget ?? "tenant-archive",
      status: storage.status ?? "confirmed",
      summary: storage.summary ?? "Storage sincronizado.",
      confirmed_at: new Date(),
    });
    pushed += 1;
  }

  for (const backup of batch.backupActions ?? []) {
    await createBackupAction({
      cliente_id: clienteId,
      group_id: groupId,
      tenant_id: scopedTenantId,
      request_id: backup.requestId ?? null,
      backup_snapshot: backup.backupSnapshot ?? "tenant-backup",
      status: backup.status ?? "confirmed",
      summary: backup.summary ?? "Backup sincronizado.",
      confirmed_at: new Date(),
    });
    pushed += 1;
  }

  return Object.freeze({ pushed, durable: true });
}

export async function reconcileSyncBackend(clienteId, groupId) {
  const errors = await listSyncErrorsByGroup(clienteId, groupId);
  return Object.freeze({
    reconciled: true,
    unresolvedErrors: errors.length,
    durable: true,
  });
}

export async function recordSyncDivergence(clienteId, groupId, tenantId, partial) {
  const scopedTenantId = assertTenantMatchesCliente(clienteId, tenantId);
  await appendSyncError({
    cliente_id: clienteId,
    group_id: groupId,
    tenant_id: scopedTenantId,
    error_code: partial.errorCode ?? "sync_divergence",
    summary: partial.summary ?? "Divergência frontend/backend.",
    entity_type: partial.entityType,
    entity_id: partial.entityId,
    retryable: true,
  });

  await upsertSyncState({
    cliente_id: clienteId,
    group_id: groupId,
    tenant_id: scopedTenantId,
    entity_type: partial.entityType ?? "sync",
    entity_id: partial.entityId ?? `div-${Date.now()}`,
    frontend_state: partial.frontendState,
    backend_state: partial.backendState,
    sync_status: "diverged",
    divergence_reason: partial.summary,
    label: partial.label ?? "Divergência",
    summary: partial.summary,
    last_sync_at: new Date(),
  });

  return Object.freeze({ recorded: true, durable: true });
}

export default { getSyncSnapshot, pushSyncBatchBackend, reconcileSyncBackend };
