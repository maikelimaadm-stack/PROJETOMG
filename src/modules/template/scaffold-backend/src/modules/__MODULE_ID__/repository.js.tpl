import { getPrismaClient } from "../../database/prismaClient.js";
import { auditService } from "../audit/auditService.js";

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const DEFAULT_PAGE_SIZE = 50;

// IMPORTANTE:
// Substitua "__MODULE_ID__" pelo model Prisma real (ex.: fazenda).
// Este arquivo já nasce com os contratos multiempresa obrigatórios.
const MODEL_NAME = "__MODULE_ID__";

const getModel = (prisma) => {
  const model = prisma[MODEL_NAME];
  if (!model) {
    throw new Error(
      `Model Prisma '${MODEL_NAME}' não encontrado. Atualize __MODULE_ID__/repository.js após gerar o módulo.`
    );
  }
  return model;
};

const buildScopeWhere = (scope, extra = {}) => {
  const and = [{ cliente_id: scope.clienteId }];
  if (scope.selectedEmpresaId) {
    and.push({ empresa_id: scope.selectedEmpresaId });
  } else if (!scope.acessoGlobal) {
    and.push({
      empresa_id: {
        in: scope.allowedEmpresaIds,
      },
    });
  }
  if (Object.keys(extra).length > 0) and.push(extra);
  return and.length === 1 ? and[0] : { AND: and };
};

export const __MODULE_ID__Repository = {
  async list({ scope, query }) {
    const prisma = getPrismaClient();
    const model = getModel(prisma);
    const page = toPositiveInt(query.page, 1);
    const pageSize = Math.min(200, toPositiveInt(query.pageSize, DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * pageSize;
    const where = buildScopeWhere(scope);

    const [items, total] = await Promise.all([
      model.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      model.count({ where }),
    ]);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById({ scope, id }) {
    const prisma = getPrismaClient();
    const model = getModel(prisma);
    return model.findFirst({ where: buildScopeWhere(scope, { id }) });
  },

  async create({ scope, payload }) {
    const prisma = getPrismaClient();
    const model = getModel(prisma);
    const empresaId = payload.empresa_id || scope.selectedEmpresaId || null;
    if (!empresaId) {
      const error = new Error("empresa_id é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        cliente_id: scope.clienteId,
      },
      select: { id: true, codigo_empresa: true, razao_social: true },
    });
    if (!empresa) {
      const error = new Error("Empresa inválida para este cliente.");
      error.statusCode = 403;
      throw error;
    }

    const item = await model.create({
      data: {
        ...payload,
        empresa_id: empresa.id,
        codigo_empresa: empresa.codigo_empresa,
        nome_empresa: empresa.razao_social,
        cliente_id: scope.clienteId,
      },
    });

    await auditService.log({
      scope,
      entityName: "__ENTITY_NAME__",
      action: "CREATE",
      entityId: item.id,
      empresaId: empresa.id,
      codigoEmpresa: empresa.codigo_empresa,
      nomeEmpresa: empresa.razao_social,
      payload: { id: item.id },
    });
    return item;
  },

  async update({ scope, id, payload }) {
    const prisma = getPrismaClient();
    const model = getModel(prisma);
    const current = await model.findFirst({ where: buildScopeWhere(scope, { id }) });
    if (!current) return null;

    const item = await model.update({
      where: { id: current.id },
      data: payload,
    });

    await auditService.log({
      scope,
      entityName: "__ENTITY_NAME__",
      action: "UPDATE",
      entityId: item.id,
      empresaId: item.empresa_id || null,
      codigoEmpresa: item.codigo_empresa || null,
      nomeEmpresa: item.nome_empresa || null,
      payload: { id: item.id },
    });
    return item;
  },

  async remove({ scope, id }) {
    const prisma = getPrismaClient();
    const model = getModel(prisma);
    const current = await model.findFirst({ where: buildScopeWhere(scope, { id }) });
    if (!current) return false;
    await model.delete({ where: { id: current.id } });

    await auditService.log({
      scope,
      entityName: "__ENTITY_NAME__",
      action: "DELETE",
      entityId: current.id,
      empresaId: current.empresa_id || null,
      codigoEmpresa: current.codigo_empresa || null,
      nomeEmpresa: current.nome_empresa || null,
      payload: { id: current.id },
    });
    return true;
  },
};

