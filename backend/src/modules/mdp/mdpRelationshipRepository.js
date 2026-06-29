import { getPrismaClient } from "../../database/prismaClient.js";

const RELATIONSHIP_INCLUDE = {
  labels: { orderBy: { locale: "asc" } },
  field_bindings: {
    include: {
      field: { select: { id: true, field_id: true, field_name: true, entity_row_id: true } },
    },
  },
  from_entity: { select: { id: true, entity_id: true, module_id: true } },
  to_entity: { select: { id: true, entity_id: true, module_id: true } },
};

const buildTenantVisibilityWhere = (clienteId) => ({
  OR: [
    { scope: "platform", cliente_id: null },
    { scope: "tenant", cliente_id: clienteId },
  ],
});

export const mdpRelationshipRepository = {
  include: RELATIONSHIP_INCLUDE,

  async findById({ id, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpRelationship.findFirst({
      where: {
        id,
        ...buildTenantVisibilityWhere(clienteId),
      },
      include: RELATIONSHIP_INCLUDE,
    });
  },

  async findByRelationshipId({ relationshipId, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpRelationship.findFirst({
      where: {
        relationship_id: relationshipId,
        ...buildTenantVisibilityWhere(clienteId),
      },
      include: RELATIONSHIP_INCLUDE,
    });
  },

  async list({ clienteId, where = {}, skip = 0, take = 50, orderBy = [{ sort_order: "asc" }] }) {
    const prisma = getPrismaClient();
    const fullWhere = {
      ...buildTenantVisibilityWhere(clienteId),
      lifecycle: "active",
      ...where,
    };
    const [items, total] = await Promise.all([
      prisma.mdpRelationship.findMany({
        where: fullWhere,
        include: RELATIONSHIP_INCLUDE,
        skip,
        take,
        orderBy,
      }),
      prisma.mdpRelationship.count({ where: fullWhere }),
    ]);
    return { items, total };
  },

  async create(data) {
    const prisma = getPrismaClient();
    return prisma.mdpRelationship.create({
      data,
      include: RELATIONSHIP_INCLUDE,
    });
  },

  async update(id, data) {
    const prisma = getPrismaClient();
    return prisma.mdpRelationship.update({
      where: { id },
      data,
      include: RELATIONSHIP_INCLUDE,
    });
  },

  async createAudit(entry) {
    const prisma = getPrismaClient();
    return prisma.mdpRelationshipAudit.create({ data: entry });
  },

  async countByEntity(entityRowId) {
    const prisma = getPrismaClient();
    return prisma.mdpRelationship.count({
      where: {
        lifecycle: "active",
        OR: [{ from_entity_row_id: entityRowId }, { to_entity_row_id: entityRowId }],
      },
    });
  },

  async countPhysicalByEntity(entityRowId) {
    const prisma = getPrismaClient();
    return prisma.mdpRelationship.count({
      where: {
        lifecycle: "active",
        kind: "physical",
        OR: [{ from_entity_row_id: entityRowId }, { to_entity_row_id: entityRowId }],
      },
    });
  },

  async syncFieldBindings(prisma, relationshipRowId, bindings = []) {
    await prisma.mdpRelationshipFieldBinding.deleteMany({
      where: { relationship_row_id: relationshipRowId },
    });
    if (!bindings.length) return;
    await prisma.mdpRelationshipFieldBinding.createMany({
      data: bindings.map((b) => ({
        relationship_row_id: relationshipRowId,
        field_row_id: b.fieldRowId ?? null,
        from_field_name: b.fromFieldName ?? null,
        to_field_name: b.toFieldName ?? null,
        binding_role: b.bindingRole ?? null,
      })),
    });
  },
};
