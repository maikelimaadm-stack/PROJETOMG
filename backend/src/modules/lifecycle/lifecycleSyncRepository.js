import { getPrismaClient } from "../../database/prismaClient.js";

export async function listSyncStatesByGroup(clienteId, groupId, limit = 100) {
  const prisma = getPrismaClient();
  return prisma.lifecycleSyncState.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function upsertSyncState(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleSyncState.upsert({
    where: {
      cliente_id_group_id_entity_type_entity_id: {
        cliente_id: data.cliente_id,
        group_id: data.group_id,
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

export async function appendSyncError(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleSyncError.create({ data });
}

export async function listSyncErrorsByGroup(clienteId, groupId, limit = 50) {
  const prisma = getPrismaClient();
  return prisma.lifecycleSyncError.findMany({
    where: { cliente_id: clienteId, group_id: groupId, resolved: false },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function listNotificationsByGroup(clienteId, groupId, limit = 50) {
  const prisma = getPrismaClient();
  return prisma.lifecycleNotification.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function createNotification(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleNotification.create({ data });
}

export async function listStorageActionsByGroup(clienteId, groupId, limit = 50) {
  const prisma = getPrismaClient();
  return prisma.lifecycleStorageAction.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function createStorageAction(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleStorageAction.create({ data });
}

export async function listBackupActionsByGroup(clienteId, groupId, limit = 50) {
  const prisma = getPrismaClient();
  return prisma.lifecycleBackupAction.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function createBackupAction(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleBackupAction.create({ data });
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
