import { getPrismaClient } from "../../../database/prismaClient.js";

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

const ORDER_BY_MAP = {
  codigo_empresa: { codigo_empresa: "asc" },
  razao_social: { razao_social: "asc" },
  nome_fantasia: { nome_fantasia: "asc" },
  cpf_cnpj: { cpf_cnpj: "asc" },
  cidade: { cidade: "asc" },
  status: { status: "asc" },
  updatedAt: { updatedAt: "desc" },
};

const resolveOrderBy = (sortBy = "codigo_empresa", sortDir = "asc") => {
  const base = ORDER_BY_MAP[sortBy] || ORDER_BY_MAP.codigo_empresa;
  const direction = String(sortDir || "asc").toLowerCase() === "desc" ? "desc" : "asc";
  const [key] = Object.keys(base);
  return { [key]: direction };
};

const buildSearchWhere = (search) => {
  const value = String(search || "").trim();
  if (!value) return null;

  const numericSearch = Number(value);
  const or = [
    { razao_social: { contains: value, mode: "insensitive" } },
    { nome_fantasia: { contains: value, mode: "insensitive" } },
    { cpf_cnpj: { contains: value, mode: "insensitive" } },
    { email: { contains: value, mode: "insensitive" } },
    { cidade: { contains: value, mode: "insensitive" } },
  ];

  if (Number.isFinite(numericSearch)) {
    or.push({ codigo_empresa: Math.floor(numericSearch) });
  }

  return { OR: or };
};

const FILTER_FIELD_MAP = {
  status: "status",
  cidade: "cidade",
  tipo_pessoa: "tipo_pessoa",
};

const buildFiltersWhere = (filters = {}) => {
  const and = [];
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (!FILTER_FIELD_MAP[key]) return;
    if (value == null || value === "") return;
    and.push({
      [FILTER_FIELD_MAP[key]]: {
        equals: String(value),
        mode: "insensitive",
      },
    });
  });
  if (and.length === 0) return null;
  return { AND: and };
};

const withTenantWhere = (tenantId, extra = {}) => ({
  tenant_id: tenantId,
  ...extra,
});

export const empresaRepository = {
  async list({ tenantId, page = 1, pageSize = DEFAULT_PAGE_SIZE, search = "", sortBy, sortDir, filters = {} }) {
    const prisma = getPrismaClient();
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(MAX_PAGE_SIZE, toPositiveInt(pageSize, DEFAULT_PAGE_SIZE));
    const skip = (safePage - 1) * safePageSize;
    const searchWhere = buildSearchWhere(search);
    const filtersWhere = buildFiltersWhere(filters);
    const where = withTenantWhere(tenantId, {
      ...(searchWhere || {}),
      ...(filtersWhere || {}),
    });

    const [items, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        orderBy: resolveOrderBy(sortBy, sortDir),
        skip,
        take: safePageSize,
      }),
      prisma.empresa.count({ where }),
    ]);

    return {
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    };
  },

  async getById(id, tenantId) {
    const prisma = getPrismaClient();
    return prisma.empresa.findFirst({
      where: withTenantWhere(tenantId, { id }),
    });
  },

  async create(data, tenantId) {
    const prisma = getPrismaClient();
    let codigo = Number(data.codigo_empresa || 0);
    if (!Number.isFinite(codigo) || codigo <= 0) {
      const lastEmpresa = await prisma.empresa.findFirst({
        where: withTenantWhere(tenantId),
        orderBy: { codigo_empresa: "desc" },
        select: { codigo_empresa: true },
      });
      codigo = Number(lastEmpresa?.codigo_empresa || 0) + 1;
    }

    return prisma.empresa.create({
      data: {
        ...data,
        codigo_empresa: codigo,
        tenant_id: tenantId,
      },
    });
  },

  async update(id, data, tenantId) {
    const prisma = getPrismaClient();
    const current = await prisma.empresa.findFirst({
      where: withTenantWhere(tenantId, { id }),
    });
    if (!current) return null;
    return prisma.empresa.update({
      where: { id: current.id },
      data,
    });
  },

  async remove(id, tenantId) {
    const prisma = getPrismaClient();
    const current = await prisma.empresa.findFirst({
      where: withTenantWhere(tenantId, { id }),
      select: { id: true },
    });
    if (!current) return false;
    await prisma.empresa.delete({ where: { id: current.id } });
    return true;
  },

  async listCampos(tenantId) {
    const prisma = getPrismaClient();
    return prisma.campoPersonalizado.findMany({
      where: withTenantWhere(tenantId),
      orderBy: [{ ordem_tabela: "asc" }],
    });
  },

  async createCampo(data, tenantId) {
    const prisma = getPrismaClient();
    return prisma.campoPersonalizado.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });
  },

  async updateCampo(id, data, tenantId) {
    const prisma = getPrismaClient();
    const current = await prisma.campoPersonalizado.findFirst({
      where: withTenantWhere(tenantId, { id }),
      select: { id: true },
    });
    if (!current) return null;
    return prisma.campoPersonalizado.update({
      where: { id: current.id },
      data,
    });
  },

  async removeCampo(id, tenantId) {
    const prisma = getPrismaClient();
    const current = await prisma.campoPersonalizado.findFirst({
      where: withTenantWhere(tenantId, { id }),
      select: { id: true },
    });
    if (!current) return false;
    await prisma.campoPersonalizado.delete({ where: { id: current.id } });
    return true;
  },
};
