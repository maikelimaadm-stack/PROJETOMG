import { getPrismaClient } from "../../database/prismaClient.js";

/**
 * `client` opcional em toda função: o default é o Prisma de produção; os testes de
 * segurança injetam um duplo determinístico para exercitar a lógica REAL do serviço
 * sem banco. Mesmo padrão de `lifecycleRepository.js`.
 */
const resolveClient = (client) => client ?? getPrismaClient();

export async function listSyncStatesByGroup(clienteId, groupId, limit = 100, client) {
  return resolveClient(client).lifecycleSyncState.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

/**
 * A chave do upsert inclui `tenant_id`. Sem ele, dois tenants autorizados no MESMO
 * owner/group com o mesmo `entity_id` colidiam: o push do tenant B sobrescrevia a linha
 * do tenant A — e, como o `update` não toca `tenant_id`, a linha ficava com o tenant de
 * A carregando o estado de B. O unique correspondente vive em `schema.prisma`.
 */
export async function upsertSyncState(data, client) {
  return resolveClient(client).lifecycleSyncState.upsert({
    where: {
      cliente_id_group_id_tenant_id_entity_type_entity_id: {
        cliente_id: data.cliente_id,
        group_id: data.group_id,
        tenant_id: data.tenant_id,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
      },
    },
    create: data,
    update: {
      frontend_state: data.frontend_state,
      backend_state: data.backend_state,
      sync_status: data.sync_status,
      divergence_reason: data.divergence_reason,
      label: data.label,
      summary: data.summary,
      last_sync_at: data.last_sync_at ?? new Date(),
      retry_count: data.retry_count ?? 0,
    },
  });
}

export async function appendSyncError(data, client) {
  return resolveClient(client).lifecycleSyncError.create({ data });
}

export async function listSyncErrorsByGroup(clienteId, groupId, limit = 50, client) {
  return resolveClient(client).lifecycleSyncError.findMany({
    where: { cliente_id: clienteId, group_id: groupId, resolved: false },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function listNotificationsByGroup(clienteId, groupId, limit = 50, client) {
  return resolveClient(client).lifecycleNotification.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function createNotification(data, client) {
  return resolveClient(client).lifecycleNotification.create({ data });
}

export async function listStorageActionsByGroup(clienteId, groupId, limit = 50, client) {
  return resolveClient(client).lifecycleStorageAction.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function createStorageAction(data, client) {
  return resolveClient(client).lifecycleStorageAction.create({ data });
}

export async function listBackupActionsByGroup(clienteId, groupId, limit = 50, client) {
  return resolveClient(client).lifecycleBackupAction.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function createBackupAction(data, client) {
  return resolveClient(client).lifecycleBackupAction.create({ data });
}

export default {
  listSyncStatesByGroup,
  upsertSyncState,
  appendSyncError,
  listSyncErrorsByGroup,
  listNotificationsByGroup,
  listStorageActionsByGroup,
  listBackupActionsByGroup,
};
