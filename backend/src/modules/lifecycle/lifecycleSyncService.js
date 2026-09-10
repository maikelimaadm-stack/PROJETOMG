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
import { authorizeLifecycleTenant, NO_LIFECYCLE_TENANT_AUTHORITY } from "./lifecycleTenant.js";

/**
 * A decisão de tenant acontece AQUI, na fronteira de escrita — não na rota. Assim a
 * condição de tenant participa da operação de persistência (sem TOCTOU entre uma
 * checagem na rota e a gravação no serviço), e um caller futuro que esqueça de validar
 * continua protegido.
 *
 * `deps.tenantAuthority` é a autoridade server-side de (owner, group, tenant). O default
 * é `NO_LIFECYCLE_TENANT_AUTHORITY`, que não sabe responder — e "não sabe" é recusa.
 * `deps.client` é o Prisma; o default é o de produção.
 */
const resolveTenantForWrite = async (clienteId, groupId, requestedTenantId, deps) =>
  authorizeLifecycleTenant(
    { ownerClientId: clienteId, groupId, requestedTenantId },
    deps.tenantAuthority ?? NO_LIFECYCLE_TENANT_AUTHORITY,
  );

export async function getSyncSnapshot(clienteId, groupId, deps = {}) {
  const c = deps.client;
  const [approvals, syncStates, errors, notifications, storageActions, backupActions] = await Promise.all([
    listApprovalRequestsByGroup(clienteId, groupId, 50, c),
    listSyncStatesByGroup(clienteId, groupId, 100, c),
    listSyncErrorsByGroup(clienteId, groupId, 50, c),
    listNotificationsByGroup(clienteId, groupId, 50, c),
    listStorageActionsByGroup(clienteId, groupId, 50, c),
    listBackupActionsByGroup(clienteId, groupId, 50, c),
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

/**
 * `requestedTenantId` é a DECLARAÇÃO do cliente (vinda de `body.tenantId`). Ela nunca é
 * autoridade: é validada por `authorizeLifecycleTenant` antes de qualquer escrita.
 * `batch.authorizedTenantIds` e `batch.ownerClientId`, se vierem, são ignorados por
 * construção — nada abaixo os lê.
 *
 * ATOMICIDADE: este batch NÃO é transacional. São três laços independentes com
 * `await`; uma falha num item posterior deixa os anteriores persistidos. D-093 não
 * exige all-or-nothing e a certificação diz isso com todas as letras (TD-019).
 */
export async function pushSyncBatchBackend(clienteId, groupId, requestedTenantId, batch, deps = {}) {
  const { tenantId } = await resolveTenantForWrite(clienteId, groupId, requestedTenantId, deps);
  const c = deps.client;
  let pushed = 0;

  for (const approval of batch.approvals ?? []) {
    await upsertSyncState({
      cliente_id: clienteId,
      group_id: groupId,
      tenant_id: tenantId,
      entity_type: "approval",
      entity_id: approval.entityId,
      frontend_state: approval.status,
      backend_state: approval.status,
      sync_status: "synced",
      label: approval.label,
      summary: "Aprovação sincronizada via backend.",
      last_sync_at: new Date(),
    }, c);
    pushed += 1;
  }

  for (const storage of batch.storageActions ?? []) {
    await createStorageAction({
      cliente_id: clienteId,
      group_id: groupId,
      tenant_id: tenantId,
      request_id: storage.requestId ?? null,
      action_type: storage.actionType ?? "archive",
      storage_target: storage.storageTarget ?? "tenant-archive",
      status: storage.status ?? "confirmed",
      summary: storage.summary ?? "Storage sincronizado.",
      confirmed_at: new Date(),
    }, c);
    pushed += 1;
  }

  for (const backup of batch.backupActions ?? []) {
    await createBackupAction({
      cliente_id: clienteId,
      group_id: groupId,
      tenant_id: tenantId,
      request_id: backup.requestId ?? null,
      backup_snapshot: backup.backupSnapshot ?? "tenant-backup",
      status: backup.status ?? "confirmed",
      summary: backup.summary ?? "Backup sincronizado.",
      confirmed_at: new Date(),
    }, c);
    pushed += 1;
  }

  return Object.freeze({ pushed, tenantId, durable: true });
}

export async function reconcileSyncBackend(clienteId, groupId, deps = {}) {
  const errors = await listSyncErrorsByGroup(clienteId, groupId, 50, deps.client);
  return Object.freeze({
    reconciled: true,
    unresolvedErrors: errors.length,
    durable: true,
  });
}

export async function recordSyncDivergence(clienteId, groupId, requestedTenantId, partial, deps = {}) {
  const { tenantId } = await resolveTenantForWrite(clienteId, groupId, requestedTenantId, deps);
  const c = deps.client;
  await appendSyncError({
    cliente_id: clienteId,
    group_id: groupId,
    tenant_id: tenantId,
    error_code: partial.errorCode ?? "sync_divergence",
    summary: partial.summary ?? "Divergência frontend/backend.",
    entity_type: partial.entityType,
    entity_id: partial.entityId,
    retryable: true,
  }, c);

  await upsertSyncState({
    cliente_id: clienteId,
    group_id: groupId,
    tenant_id: tenantId,
    entity_type: partial.entityType ?? "sync",
    entity_id: partial.entityId ?? `div-${Date.now()}`,
    frontend_state: partial.frontendState,
    backend_state: partial.backendState,
    sync_status: "diverged",
    divergence_reason: partial.summary,
    label: partial.label ?? "Divergência",
    summary: partial.summary,
    last_sync_at: new Date(),
  }, c);

  return Object.freeze({ recorded: true, durable: true });
}

export default { getSyncSnapshot, pushSyncBatchBackend, reconcileSyncBackend };
