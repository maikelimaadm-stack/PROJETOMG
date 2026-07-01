import { getPrismaClient } from "../../database/prismaClient.js";

export async function listApprovalRequestsByGroup(clienteId, groupId, limit = 50) {
  const prisma = getPrismaClient();
  return prisma.lifecycleApprovalRequest.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

export async function getApprovalRequestById(id) {
  const prisma = getPrismaClient();
  return prisma.lifecycleApprovalRequest.findUnique({ where: { id } });
}

export async function createApprovalRequest(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleApprovalRequest.create({ data });
}

export async function updateApprovalRequest(id, data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleApprovalRequest.update({ where: { id }, data });
}

export async function appendAuditEntry(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleAuditEntry.create({ data });
}

export async function createExecutionJob(data) {
  const prisma = getPrismaClient();
  return prisma.lifecycleExecutionJob.create({ data });
}

export default {
  listApprovalRequestsByGroup,
  getApprovalRequestById,
  createApprovalRequest,
  updateApprovalRequest,
  appendAuditEntry,
  createExecutionJob,
};
