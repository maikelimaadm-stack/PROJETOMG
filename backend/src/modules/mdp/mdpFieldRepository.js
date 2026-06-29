import { getPrismaClient } from "../../database/prismaClient.js";

const FIELD_INCLUDE = {
  labels: { orderBy: { locale: "asc" } },
  options: { orderBy: { sort_order: "asc" } },
  telas: { include: { tela: true } },
  empresa_scopes: {
    include: { empresa: { select: { id: true, codempresa: true, razao_social: true } } },
  },
  entity: { select: { id: true, entity_id: true, module_id: true } },
};

const FIELD_APPLICABLE_INCLUDE = {
  labels: { orderBy: { locale: "asc" } },
  options: { orderBy: { sort_order: "asc" } },
  telas: { include: { tela: { select: { id: true, codigo: true, nome: true, entity_name: true } } } },
  empresa_scopes: { select: { empresa_id: true } },
};

const buildTenantFieldVisibilityWhere = (clienteId) => ({
  OR: [
    { scope: "platform", cliente_id: null },
    { scope: "tenant", cliente_id: clienteId },
  ],
});

export const mdpFieldRepository = {
  include: FIELD_INCLUDE,
  applicableInclude: FIELD_APPLICABLE_INCLUDE,

  async findById({ id, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpField.findFirst({
      where: {
        id,
        OR: [
          { scope: "platform", cliente_id: null },
          { cliente_id: clienteId },
        ],
      },
      include: FIELD_INCLUDE,
    });
  },

  async findByFieldName({ fieldName, entityRowId, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpField.findFirst({
      where: {
        field_name: fieldName,
        entity_row_id: entityRowId,
        OR: [
          { scope: "platform", cliente_id: null },
          { cliente_id: clienteId },
        ],
      },
      include: FIELD_INCLUDE,
    });
  },

  async list({ clienteId, where = {}, skip = 0, take = 50, orderBy = { codigo: "asc" } }) {
    const prisma = getPrismaClient();
    const fullWhere = {
      ...buildTenantFieldVisibilityWhere(clienteId),
      lifecycle: "active",
      ...where,
    };
    const [items, total] = await Promise.all([
      prisma.mdpField.findMany({
        where: fullWhere,
        include: FIELD_INCLUDE,
        skip,
        take,
        orderBy,
      }),
      prisma.mdpField.count({ where: fullWhere }),
    ]);
    return { items, total };
  },

  async countCustomFields(clienteId) {
    const prisma = getPrismaClient();
    return prisma.mdpField.count({
      where: {
        cliente_id: clienteId,
        source: "custom",
        lifecycle: "active",
      },
    });
  },

  async listApplicable({ clienteId, entityName, whereExtra = {} }) {
    const prisma = getPrismaClient();
    return prisma.mdpField.findMany({
      where: {
        ...buildTenantFieldVisibilityWhere(clienteId),
        active: true,
        source: { in: ["custom", "computed", "derived"] },
        telas: { some: { tela: { entity_name: entityName } } },
        ...whereExtra,
      },
      include: FIELD_APPLICABLE_INCLUDE,
      orderBy: [{ table_order: "asc" }, { field_name: "asc" }],
    });
  },

  async create(data) {
    const prisma = getPrismaClient();
    return prisma.mdpField.create({
      data,
      include: FIELD_INCLUDE,
    });
  },

  async update(id, data) {
    const prisma = getPrismaClient();
    return prisma.mdpField.update({
      where: { id },
      data,
      include: FIELD_INCLUDE,
    });
  },

  async delete(id) {
    const prisma = getPrismaClient();
    return prisma.mdpField.delete({ where: { id } });
  },

  async syncRelations(prisma, fieldRowId, { tela_ids = [], empresa_ids = [], opcoes = [], empresa_applicability }) {
    await prisma.mdpFieldTela.deleteMany({ where: { field_row_id: fieldRowId } });
    const telaIds = tela_ids.slice(0, 1);
    if (telaIds.length) {
      await prisma.mdpFieldTela.createMany({
        data: telaIds.map((tela_id) => ({ field_row_id: fieldRowId, tela_id })),
        skipDuplicates: true,
      });
    }

    await prisma.mdpFieldEmpresaScope.deleteMany({ where: { field_row_id: fieldRowId } });
    if (empresa_applicability === "selected" && empresa_ids.length) {
      await prisma.mdpFieldEmpresaScope.createMany({
        data: empresa_ids.map((empresa_id) => ({ field_row_id: fieldRowId, empresa_id })),
        skipDuplicates: true,
      });
    }

    await prisma.mdpFieldOption.deleteMany({ where: { field_row_id: fieldRowId } });
    if (opcoes.length) {
      await prisma.mdpFieldOption.createMany({
        data: opcoes.map((opcao, index) => ({
          field_row_id: fieldRowId,
          code: String(opcao.codigo ?? opcao.code),
          label: String(opcao.descricao ?? opcao.label),
          sort_order: opcao.ordem ?? opcao.sort_order ?? index,
          active: opcao.ativo ?? opcao.active ?? true,
        })),
      });
    }
  },

  async upsertLabel(prisma, fieldRowId, { locale, label, description, placeholder }) {
    await prisma.mdpFieldLabel.upsert({
      where: { field_row_id_locale: { field_row_id: fieldRowId, locale } },
      create: { field_row_id: fieldRowId, locale, label, description, placeholder },
      update: { label, description, placeholder },
    });
  },

  async createAudit(entry) {
    const prisma = getPrismaClient();
    return prisma.mdpFieldAudit.create({ data: entry });
  },

  async listAudits({ fieldRowId, clienteId, take = 100 }) {
    const prisma = getPrismaClient();
    return prisma.mdpFieldAudit.findMany({
      where: { field_row_id: fieldRowId, cliente_id: clienteId },
      orderBy: { created_at: "desc" },
      take,
    });
  },

  async countByEntity(entityRowId) {
    const prisma = getPrismaClient();
    return prisma.mdpField.count({
      where: { entity_row_id: entityRowId, lifecycle: "active" },
    });
  },

  async countNativeByEntity(entityRowId) {
    const prisma = getPrismaClient();
    return prisma.mdpField.count({
      where: { entity_row_id: entityRowId, source: "native", lifecycle: "active" },
    });
  },
};
