import { getPrismaClient } from "../../../database/prismaClient.js";
import { auditService } from "../../audit/auditService.js";
import { registerRegistroGlobal, reserveNextIdGlobal } from "../../idGlobal/idGlobalService.js";
import { ENTITY_CODIGO_MARCA, reserveNextCodigo } from "../../sequencias/entidadeCodigoService.js";

const ORDER_BY_MAP = {
  codigo: { codigo: "asc" },
  nome: { nome: "asc" },
  status: { status: "asc" },
  id_global: { id_global: "asc" },
};

const resolveOrderBy = (sortBy, sortDir) => {
  const base = ORDER_BY_MAP[sortBy] || ORDER_BY_MAP.codigo;
  const key = Object.keys(base)[0];
  return { [key]: sortDir === "desc" ? "desc" : "asc" };
};

const buildWhere = (clienteId, { search = "", filters = {} } = {}) => {
  const where = { cliente_id: clienteId };
  const term = String(search || "").trim();
  if (term) {
    where.OR = [
      { nome: { contains: term, mode: "insensitive" } },
      { observacoes: { contains: term, mode: "insensitive" } },
    ];
    const asNumber = Number(term);
    if (Number.isFinite(asNumber)) {
      where.OR.push({ codigo: asNumber }, { id_global: asNumber });
    }
  }
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (key.endsWith("__in") && Array.isArray(value)) {
      where[key.replace("__in", "")] = { in: value };
      return;
    }
    where[key] = value;
  });
  return where;
};

export const marcaRepository = {
  async list(scope, query = {}) {
    const prisma = getPrismaClient();
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || 50));
    const where = buildWhere(scope.clienteId, query);
    const orderBy = resolveOrderBy(query.sortBy, query.sortDir);

    const [items, total] = await Promise.all([
      prisma.marca.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.marca.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(scope, id) {
    const prisma = getPrismaClient();
    return prisma.marca.findFirst({
      where: { id, cliente_id: scope.clienteId },
    });
  },

  async create(scope, payload) {
    const prisma = getPrismaClient();
    return prisma.$transaction(async (tx) => {
      const codigo = await reserveNextCodigo(tx, scope.clienteId, ENTITY_CODIGO_MARCA);
      const idGlobal = await reserveNextIdGlobal(tx, scope.clienteId);
      const created = await tx.marca.create({
        data: {
          cliente_id: scope.clienteId,
          codigo,
          id_global: idGlobal,
          nome: payload.nome,
          status: payload.status || "Ativo",
          observacoes: payload.observacoes ?? null,
        },
      });
      await registerRegistroGlobal(tx, {
        clienteId: scope.clienteId,
        idGlobal,
        entityName: "MarcaCadastro",
        recordId: created.id,
      });
      void auditService.log({
        scope,
        entityName: "MarcaCadastro",
        action: "CREATE",
        entityId: created.id,
        idGlobal: created.id_global,
        payload: {
          codigo: created.codigo,
          nome: created.nome,
          status: created.status,
        },
      });
      return created;
    });
  },

  async update(scope, id, payload) {
    const prisma = getPrismaClient();
    const current = await this.getById(scope, id);
    if (!current) return null;
    return prisma.$transaction(async (tx) => {
      const updated = await tx.marca.update({
        where: { id },
        data: {
          ...(payload.nome != null ? { nome: payload.nome } : {}),
          ...(payload.status != null ? { status: payload.status } : {}),
          ...(payload.observacoes !== undefined ? { observacoes: payload.observacoes } : {}),
        },
      });
      void auditService.log({
        scope,
        entityName: "MarcaCadastro",
        action: "UPDATE",
        entityId: id,
        idGlobal: current.id_global,
        payload,
      });
      return updated;
    });
  },

  async remove(scope, id) {
    const prisma = getPrismaClient();
    const current = await this.getById(scope, id);
    if (!current) return null;
    await prisma.marca.delete({ where: { id } });
    void auditService.log({
      scope,
      entityName: "MarcaCadastro",
      action: "DELETE",
      entityId: id,
      idGlobal: current.id_global,
      payload: { nome: current.nome, codigo: current.codigo },
    });
    return { ok: true };
  },
};
