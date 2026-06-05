import { getPrismaClient } from "../../database/prismaClient.js";
import { auditService } from "../audit/auditService.js";
import { createCampoPersonalizadoRepository } from "../campos/campoPersonalizadoRepository.js";
import { createWithIdGlobal } from "../idGlobal/idGlobalService.js";

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const DEFAULT_PAGE_SIZE = 50;
const ENTITY_NAME = "__ENTITY_NAME__";
const camposRepository = createCampoPersonalizadoRepository(ENTITY_NAME);

const getModel = (prisma) => prisma.cadastroRegistro;

const buildScopeWhere = (scope, extra = {}) => {
  const and = [{ cliente_id: scope.clienteId }, { entity_name: ENTITY_NAME }];
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
    const searchValue = String(query.search || "").trim();
    const searchWhere = (() => {
      if (!searchValue) return {};
      if (/^\d+$/.test(searchValue)) {
        const asNumber = Number(searchValue);
        if (Number.isFinite(asNumber)) {
          return { OR: [{ id_global: asNumber }] };
        }
      }
      const asNumber = Number(searchValue);
      return {
        OR: [
          { nome: { contains: searchValue, mode: "insensitive" } },
          { observacoes: { contains: searchValue, mode: "insensitive" } },
          ...(Number.isFinite(asNumber) ? [{ id_global: asNumber }] : []),
        ],
      };
    })();
    const where = buildScopeWhere(scope, searchWhere);

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
      select: { id: true, codempresa: true, razao_social: true },
    });
    if (!empresa) {
      const error = new Error("Empresa inválida para este cliente.");
      error.statusCode = 403;
      throw error;
    }

    const item = await createWithIdGlobal({
      clienteId: scope.clienteId,
      entityName: ENTITY_NAME,
      createRecord: (tx, idGlobal) =>
        tx.cadastroRegistro.create({
          data: {
            id_global: idGlobal,
            nome: payload.nome,
            status: payload.status || "Ativo",
            observacoes: payload.observacoes || "",
            campos_personalizados: payload.campos_personalizados || {},
            empresa_id: empresa.id,
            codempresa: empresa.codempresa,
            nome_empresa: empresa.razao_social,
            cliente_id: scope.clienteId,
            entity_name: ENTITY_NAME,
          },
        }),
    });

    await auditService.log({
      scope,
      entityName: "__ENTITY_NAME__",
      action: "CREATE",
      entityId: item.id,
      idGlobal: item.id_global,
      empresaId: empresa.id,
      codigoEmpresa: empresa.codempresa,
      nomeEmpresa: empresa.razao_social,
      payload: { id: item.id, id_global: item.id_global },
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
      data: {
        ...(payload.nome != null ? { nome: payload.nome } : {}),
        ...(payload.status != null ? { status: payload.status } : {}),
        ...(payload.observacoes != null ? { observacoes: payload.observacoes } : {}),
        ...(payload.campos_personalizados != null
          ? { campos_personalizados: payload.campos_personalizados }
          : {}),
      },
    });

    await auditService.log({
      scope,
      entityName: "__ENTITY_NAME__",
      action: "UPDATE",
      entityId: item.id,
      empresaId: item.empresa_id || null,
      codigoEmpresa: item.codempresa || null,
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
      codigoEmpresa: current.codempresa || null,
      nomeEmpresa: current.nome_empresa || null,
      payload: { id: current.id },
    });
    return true;
  },

  async listFields({ scope, mode = "aplicavel" }) {
    return camposRepository.list({ scope, mode });
  },

  async createField({ scope, payload }) {
    return camposRepository.create({ scope, payload });
  },

  async updateField({ scope, id, payload }) {
    return camposRepository.update({ scope, id, payload });
  },

  async removeField({ scope, id }) {
    return camposRepository.remove({ scope, id });
  },

  async listOptions({ sources = [] }) {
    const result = {};
    for (const source of sources) {
      result[source.entity] = [];
    }
    return result;
  },
};

