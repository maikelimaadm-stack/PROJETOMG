import { getPrismaClient } from "../../../database/prismaClient.js";
const withTenantWhere = (tenantId, extra = {}) => ({
  tenant_id: tenantId,
  ...extra,
});

export const anexoRepository = {
  async list({ tenantId, entityName, recordId }) {
    const prisma = getPrismaClient();
    return prisma.registroAnexo.findMany({
      where: withTenantWhere(tenantId, {
        ...(entityName ? { entity_name: entityName } : {}),
        ...(recordId ? { record_id: recordId } : {}),
      }),
      orderBy: [{ createdAt: "desc" }],
    });
  },

  async create(data, tenantId) {
    const prisma = getPrismaClient();
    return prisma.registroAnexo.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });
  },

  async remove(id, tenantId) {
    const prisma = getPrismaClient();
    const current = await prisma.registroAnexo.findFirst({
      where: withTenantWhere(tenantId, { id }),
      select: { id: true },
    });
    if (!current) return false;
    await prisma.registroAnexo.delete({ where: { id: current.id } });
    return true;
  },
};
