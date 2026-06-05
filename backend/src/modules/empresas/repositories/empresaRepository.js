import { getPrismaClient } from "../../../database/prismaClient.js";
import { auditService } from "../../audit/auditService.js";
import { svcCps } from "../../cadcps/svcCps.js";
import { toLegacyCampoList } from "../../cadcps/campoLegacyAdapter.js";
import { runTransactionWithRetry } from "../../../database/transactionRetry.js";
import {
  registerRegistroGlobal,
  reserveNextIdGlobal,
} from "../../idGlobal/idGlobalService.js";
import {
  ENTITY_CODIGO_EMPRESA,
  reserveNextCodigo,
} from "../../sequencias/entidadeCodigoService.js";

const EMPRESAS_ENTITY_NAME = "EmpresaCadastro";

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
const EMPTY_RESULT_COMPANY_ID = "__no_company_permission__";

const ORDER_BY_MAP = {
  id_global: { id_global: "asc" },
  codempresa: { codempresa: "asc" },
  razao_social: { razao_social: "asc" },
  nome_fantasia: { nome_fantasia: "asc" },
  cpf_cnpj: { cpf_cnpj: "asc" },
  cidade: { cidade: "asc" },
  status: { status: "asc" },
  updatedAt: { updatedAt: "desc" },
};

const resolveOrderBy = (sortBy = "codempresa", sortDir = "asc") => {
  const base = ORDER_BY_MAP[sortBy] || ORDER_BY_MAP.codempresa;
  const direction = String(sortDir || "asc").toLowerCase() === "desc" ? "desc" : "asc";
  const [key] = Object.keys(base);
  return { [key]: direction };
};

const buildSearchWhere = (search) => {
  const value = String(search || "").trim();
  if (!value) return null;

  if (/^\d+$/.test(value)) {
    const numericSearch = Number(value);
    if (Number.isFinite(numericSearch)) {
      return {
        OR: [
          { id_global: Math.floor(numericSearch) },
          { codempresa: Math.floor(numericSearch) },
        ],
      };
    }
  }

  const numericSearch = Number(value);
  const or = [
    { razao_social: { contains: value, mode: "insensitive" } },
    { nome_fantasia: { contains: value, mode: "insensitive" } },
    { cpf_cnpj: { contains: value, mode: "insensitive" } },
    { email: { contains: value, mode: "insensitive" } },
    { cidade: { contains: value, mode: "insensitive" } },
  ];

  if (Number.isFinite(numericSearch)) {
    or.unshift({ id_global: Math.floor(numericSearch) });
    or.push({ codempresa: Math.floor(numericSearch) });
  }

  return { OR: or };
};

const FILTER_FIELD_MAP = {
  status: "status",
  cidade: "cidade",
  tipo_pessoa: "tipo_pessoa",
  tipo_vinculo: "tipo_vinculo",
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

const buildCadastroScopeWhere = (scope, extra = {}) => {
  const and = [{ cliente_id: scope.clienteId }];

  if (!scope.acessoGlobal) {
    and.push({
      id: {
        in: scope.allowedEmpresaIds.length > 0 ? scope.allowedEmpresaIds : [EMPTY_RESULT_COMPANY_ID],
      },
    });
  }

  if (scope.selectedEmpresaId) {
    and.push({ id: scope.selectedEmpresaId });
  }

  if (extra && Object.keys(extra).length > 0) {
    and.push(extra);
  }

  if (and.length === 1) return and[0];
  return { AND: and };
};

export const empresaRepository = {
  async count(scope) {
    const prisma = getPrismaClient();
    return prisma.empresa.count({
      where: buildCadastroScopeWhere(scope),
    });
  },

  async list({ scope, page = 1, pageSize = DEFAULT_PAGE_SIZE, search = "", sortBy, sortDir, filters = {} }) {
    const prisma = getPrismaClient();
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(MAX_PAGE_SIZE, toPositiveInt(pageSize, DEFAULT_PAGE_SIZE));
    const skip = (safePage - 1) * safePageSize;
    const searchWhere = buildSearchWhere(search);
    const filtersWhere = buildFiltersWhere(filters);
    const scopedClauses = [];
    if (searchWhere) scopedClauses.push(searchWhere);
    if (filtersWhere) scopedClauses.push(filtersWhere);
    const where = buildCadastroScopeWhere(
      scope,
      scopedClauses.length === 0
        ? {}
        : scopedClauses.length === 1
          ? scopedClauses[0]
          : { AND: scopedClauses }
    );

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

  async getById(id, scope) {
    const prisma = getPrismaClient();
    return prisma.empresa.findFirst({
      where: buildCadastroScopeWhere(scope, { id }),
    });
  },

  async create(data, scope) {
    const prisma = getPrismaClient();
    const created = await runTransactionWithRetry(prisma, async (tx) => {
      let codigo = Number(data.codempresa || 0);
      if (!Number.isFinite(codigo) || codigo <= 0) {
        codigo = await reserveNextCodigo(tx, scope.clienteId, ENTITY_CODIGO_EMPRESA);
      } else {
        const existingCode = await tx.empresa.findFirst({
          where: { cliente_id: scope.clienteId, codempresa: codigo },
          select: { id: true },
        });
        if (existingCode) {
          const conflictError = new Error(
            `Código de empresa ${codigo} já existe para este cliente.`
          );
          conflictError.statusCode = 409;
          throw conflictError;
        }
      }

      const idGlobal = await reserveNextIdGlobal(tx, scope.clienteId);
      const record = await tx.empresa.create({
        data: {
          ...data,
          id_global: idGlobal,
          codempresa: codigo,
          cliente_id: scope.clienteId,
        },
      });
      await registerRegistroGlobal(tx, {
        clienteId: scope.clienteId,
        idGlobal,
        entityName: "Empresa",
        registroId: record.id,
      });
      return record;
    });
    void auditService.log({
      scope,
      entityName: "Empresa",
      action: "CREATE",
      entityId: created.id,
      idGlobal: created.id_global,
      empresaId: created.id,
      codigoEmpresa: created.codempresa,
      nomeEmpresa: created.razao_social,
      payload: {
        id_global: created.id_global,
        codempresa: created.codempresa,
        razao_social: created.razao_social,
        status: created.status,
      },
    });
    return created;
  },

  async update(id, data, scope) {
    const prisma = getPrismaClient();
    const current = await prisma.empresa.findFirst({
      where: buildCadastroScopeWhere(scope, { id }),
    });
    if (!current) return null;
    const updated = await prisma.empresa.update({
      where: { id: current.id },
      data,
    });
    void auditService.log({
      scope,
      entityName: "Empresa",
      action: "UPDATE",
      entityId: updated.id,
      empresaId: updated.id,
      codigoEmpresa: updated.codempresa,
      nomeEmpresa: updated.razao_social,
      payload: {
        before: {
          razao_social: current.razao_social,
          status: current.status,
        },
        after: {
          razao_social: updated.razao_social,
          status: updated.status,
        },
      },
    });
    return updated;
  },

  async remove(id, scope) {
    const prisma = getPrismaClient();
    const current = await prisma.empresa.findFirst({
      where: buildCadastroScopeWhere(scope, { id }),
      select: { id: true, codempresa: true, razao_social: true },
    });
    if (!current) return false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.cadastroRegistro.deleteMany({ where: { empresa_id: current.id } });
        await tx.empresa.delete({ where: { id: current.id } });
      });
    } catch (error) {
      if (String(error?.code || "") === "P2003") {
        const conflictError = new Error(
          "Não é possível excluir a empresa pois existem registros vinculados."
        );
        conflictError.statusCode = 409;
        throw conflictError;
      }
      throw error;
    }
    void auditService.log({
      scope,
      entityName: "Empresa",
      action: "DELETE",
      entityId: current.id,
      empresaId: current.id,
      codigoEmpresa: current.codempresa,
      nomeEmpresa: current.razao_social,
      payload: {
        codempresa: current.codempresa,
        razao_social: current.razao_social,
      },
    });
    return true;
  },

  async listCampos(scope, mode = "aplicavel") {
    if (mode === "config") {
      const telas = await svcCps.listTelas();
      const telaEmpresas = telas.find((t) => t.entity_name === EMPRESAS_ENTITY_NAME);
      const result = await svcCps.list(scope, {
        page: 1,
        pageSize: 500,
        sortBy: "codigo",
        sortDir: "asc",
        ...(telaEmpresas?.id ? { tela_id: telaEmpresas.id } : {}),
      });
      return toLegacyCampoList(result.items);
    }
    return svcCps.listApplicableLegacy(scope, EMPRESAS_ENTITY_NAME);
  },
};
