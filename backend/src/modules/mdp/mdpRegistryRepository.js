import { getPrismaClient } from "../../database/prismaClient.js";

const REGISTRY_INCLUDE = {
  labels: { orderBy: { locale: "asc" } },
  bindings: { orderBy: { sort_order: "asc" } },
  entity: { select: { id: true, entity_id: true, module_id: true } },
};

const buildTenantVisibilityWhere = (clienteId) => ({
  OR: [
    { scope: "platform", cliente_id: null },
    { scope: "tenant", cliente_id: clienteId },
  ],
});

export const mdpRegistryRepository = {
  include: REGISTRY_INCLUDE,

  async findById({ id, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpRegistryEntry.findFirst({
      where: {
        id,
        ...buildTenantVisibilityWhere(clienteId),
      },
      include: REGISTRY_INCLUDE,
    });
  },

  async findByEntryId({ entryId, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpRegistryEntry.findFirst({
      where: {
        entry_id: entryId,
        ...buildTenantVisibilityWhere(clienteId),
      },
      include: REGISTRY_INCLUDE,
    });
  },

  async list({ clienteId, where = {}, skip = 0, take = 50, orderBy = [{ sort_order: "asc" }, { entry_id: "asc" }] }) {
    const prisma = getPrismaClient();
    const fullWhere = {
      ...buildTenantVisibilityWhere(clienteId),
      lifecycle: "active",
      ...where,
    };
    const [items, total] = await Promise.all([
      prisma.mdpRegistryEntry.findMany({
        where: fullWhere,
        include: REGISTRY_INCLUDE,
        skip,
        take,
        orderBy,
      }),
      prisma.mdpRegistryEntry.count({ where: fullWhere }),
    ]);
    return { items, total };
  },

  async create(data) {
    const prisma = getPrismaClient();
    return prisma.mdpRegistryEntry.create({
      data,
      include: REGISTRY_INCLUDE,
    });
  },

  async update(id, data) {
    const prisma = getPrismaClient();
    return prisma.mdpRegistryEntry.update({
      where: { id },
      data,
      include: REGISTRY_INCLUDE,
    });
  },

  async createAudit(entry) {
    const prisma = getPrismaClient();
    return prisma.mdpRegistryAudit.create({ data: entry });
  },

  async syncBindings(prisma, entryRowId, bindings = []) {
    await prisma.mdpRegistryBinding.deleteMany({
      where: { entry_row_id: entryRowId },
    });
    if (!bindings.length) return;
    await prisma.mdpRegistryBinding.createMany({
      data: bindings.map((b, index) => ({
        entry_row_id: entryRowId,
        binding_kind: b.bindingKind,
        target_id: b.targetId,
        target_row_id: b.targetRowId ?? null,
        sort_order: b.sortOrder ?? index,
      })),
    });
  },

  async upsertLabel(prisma, entryRowId, { locale, label, description, helpText }) {
    await prisma.mdpRegistryEntryLabel.upsert({
      where: { entry_row_id_locale: { entry_row_id: entryRowId, locale } },
      create: {
        entry_row_id: entryRowId,
        locale,
        label,
        description: description ?? null,
        help_text: helpText ?? null,
      },
      update: {
        label,
        description: description ?? null,
        help_text: helpText ?? null,
      },
    });
  },

  async listSchemas() {
    const prisma = getPrismaClient();
    return prisma.mdpRegistrySchema.findMany({
      where: { active: true },
      orderBy: [{ entry_type: "asc" }, { schema_version: "asc" }],
    });
  },

  async countByType({ clienteId, moduleId }) {
    const prisma = getPrismaClient();
    const where = {
      ...buildTenantVisibilityWhere(clienteId),
      lifecycle: "active",
      ...(moduleId ? { module_id: moduleId } : {}),
    };
    const rows = await prisma.mdpRegistryEntry.groupBy({
      by: ["entry_type", "status"],
      where,
      _count: { _all: true },
    });
    return rows.map((row) => ({
      entryType: row.entry_type,
      status: row.status,
      count: row._count._all,
    }));
  },

  async countByModule({ clienteId, moduleId }) {
    const prisma = getPrismaClient();
    return prisma.mdpRegistryEntry.count({
      where: {
        ...buildTenantVisibilityWhere(clienteId),
        lifecycle: "active",
        module_id: moduleId,
      },
    });
  },

  async countPublishedByTypes({ clienteId, moduleId, entryTypes }) {
    const prisma = getPrismaClient();
    return prisma.mdpRegistryEntry.count({
      where: {
        ...buildTenantVisibilityWhere(clienteId),
        lifecycle: "active",
        status: "published",
        module_id: moduleId,
        entry_type: { in: entryTypes },
      },
    });
  },
};
