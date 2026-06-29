import { getPrismaClient } from "../../database/prismaClient.js";

const ENTITY_INCLUDE = {
  labels: { orderBy: { locale: "asc" } },
  capabilities: true,
  routes: { orderBy: { sort_order: "asc" } },
};

const buildTenantVisibilityWhere = (clienteId) => ({
  OR: [
    { scope: "platform", cliente_id: null },
    { scope: "tenant", cliente_id: clienteId },
  ],
});

export const mdpEntityRepository = {
  include: ENTITY_INCLUDE,

  async findPlatformVersion(versionId) {
    const prisma = getPrismaClient();
    return prisma.mdpDefinitionVersion.findUnique({ where: { id: versionId } });
  },

  async list({ clienteId, filters = {}, skip = 0, take = 50 }) {
    const prisma = getPrismaClient();
    const where = {
      ...buildTenantVisibilityWhere(clienteId),
      ...(filters.moduleId ? { module_id: filters.moduleId } : {}),
      ...(filters.lifecycle ? { lifecycle: filters.lifecycle } : {}),
      ...(filters.entityKind ? { entity_kind: filters.entityKind } : {}),
      ...(filters.runtimeOnly === true || filters.runtimeOnly === "true"
        ? { is_runtime_module: true }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.mdpEntity.findMany({
        where,
        include: ENTITY_INCLUDE,
        orderBy: [{ sort_order: "asc" }, { entity_id: "asc" }],
        skip,
        take,
      }),
      prisma.mdpEntity.count({ where }),
    ]);
    return { items, total };
  },

  async findById({ id, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpEntity.findFirst({
      where: {
        id,
        ...buildTenantVisibilityWhere(clienteId),
      },
      include: ENTITY_INCLUDE,
    });
  },

  async findByEntityId({ entityId, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpEntity.findFirst({
      where: {
        entity_id: entityId,
        ...buildTenantVisibilityWhere(clienteId),
      },
      include: ENTITY_INCLUDE,
    });
  },

  async create(data) {
    const prisma = getPrismaClient();
    return prisma.mdpEntity.create({
      data,
      include: ENTITY_INCLUDE,
    });
  },

  async update(id, data) {
    const prisma = getPrismaClient();
    return prisma.mdpEntity.update({
      where: { id },
      data,
      include: ENTITY_INCLUDE,
    });
  },

  async delete(id) {
    const prisma = getPrismaClient();
    return prisma.mdpEntity.delete({ where: { id } });
  },

  async createAudit(entry) {
    const prisma = getPrismaClient();
    return prisma.mdpEntityAudit.create({ data: entry });
  },

  async countRuntimeModules() {
    const prisma = getPrismaClient();
    return prisma.mdpEntity.count({
      where: {
        scope: "platform",
        cliente_id: null,
        is_runtime_module: true,
        lifecycle: "active",
      },
    });
  },
};
