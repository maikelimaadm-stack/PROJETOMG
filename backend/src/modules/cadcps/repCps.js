import { getPrismaClient } from "../../database/prismaClient.js";
import { auditService } from "../audit/auditService.js";
import {
  registerRegistroGlobal,
  reserveNextIdGlobal,
} from "../idGlobal/idGlobalService.js";
import { assertCampoNotInUse } from "./cadcpsFieldUsage.js";
import { CADCPS_APLICACAO, normalizeCadcpsTipo } from "./cadcpsConstants.js";
import { listCadastroModulesForCadcps } from "./cadastroModuleRegistry.js";

const CAMPO_INCLUDE = {
  telas: { include: { tela: true } },
  empresas: { include: { empresa: { select: { id: true, codempresa: true, razao_social: true } } } },
  opcoes: { orderBy: { ordem: "asc" } },
};

const mapCampoRow = (row) => {
  if (!row) return null;
  const tipo = normalizeCadcpsTipo(row.tipo);
  const deprecatedMask = ["cpf", "cnpj", "telefone", "cep", "rg"].includes(row.tipo);
  return {
    ...row,
    tipo,
    ...(deprecatedMask && !row.usar_mascara ? { usar_mascara: true } : {}),
    telas: (row.telas || []).map((link) => link.tela).filter(Boolean),
    empresa_ids: (row.empresas || []).map((link) => link.empresa_id),
    empresas_vinculadas: (row.empresas || []).map((link) => link.empresa).filter(Boolean),
    quantidade_empresas:
      row.aplicacao_modo === CADCPS_APLICACAO.TODAS
        ? null
        : (row.empresas || []).length,
    opcoes: row.opcoes || [],
  };
};

const nextCodigo = async (prisma, clienteId) => {
  const seq = await prisma.cadCpsCodigoSequencia.upsert({
    where: { cliente_id: clienteId },
    create: { cliente_id: clienteId, next_codigo: 2 },
    update: { next_codigo: { increment: 1 } },
  });
  return seq.next_codigo - 1;
};

const recordHistorico = async (prisma, { scope, campoId, acao, valorAnterior, valorNovo }) => {
  await prisma.cadCpsHistorico.create({
    data: {
      cliente_id: scope.clienteId,
      campo_id: campoId,
      usuario_id: scope.userId,
      acao,
      valor_anterior: valorAnterior ?? undefined,
      valor_novo: valorNovo ?? undefined,
    },
  });
};

const slugifyFieldName = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const assertFieldName = (fieldName) => {
  const safe = String(fieldName || "").trim();
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safe)) {
    const error = new Error(`Nome técnico inválido: ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
  return safe;
};

const resolveFieldName = (payload = {}) => {
  const fromPayload = String(payload.field_name || "").trim();
  if (fromPayload) return assertFieldName(fromPayload);
  const fromNome = slugifyFieldName(payload.nome);
  return assertFieldName(fromNome || "campo");
};

const buildListWhere = (scope, query = {}) => {
  const and = [{ cliente_id: scope.clienteId }];

  if (query.codigo) and.push({ codigo: Number(query.codigo) });
  if (query.nome) and.push({ nome: { contains: String(query.nome), mode: "insensitive" } });
  if (query.tipo) and.push({ tipo: String(query.tipo) });
  if (query.ativo !== undefined) and.push({ ativo: Boolean(query.ativo) });
  if (query.obrigatorio !== undefined) and.push({ obrigatorio: Boolean(query.obrigatorio) });
  if (query.com_formula) and.push({ formula: { not: null } });
  if (query.com_mascara) and.push({ usar_mascara: true });
  if (query.com_decimal) and.push({ usar_decimal: true });

  if (query.tela_id) {
    and.push({ telas: { some: { tela_id: String(query.tela_id) } } });
  }

  if (query.empresa_id) {
    and.push({
      OR: [
        { aplicacao_modo: CADCPS_APLICACAO.TODAS },
        { empresas: { some: { empresa_id: String(query.empresa_id) } } },
      ],
    });
  }

  const search = String(query.search || "").trim();
  if (search) {
    if (/^\d+$/.test(search)) {
      const asNumber = Number(search);
      if (Number.isFinite(asNumber)) {
        and.push({
          OR: [{ id_global: asNumber }, { codigo: asNumber }],
        });
      }
    } else {
      const asNumber = Number(search);
      and.push({
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { field_name: { contains: search, mode: "insensitive" } },
          ...(Number.isFinite(asNumber) ? [{ id_global: asNumber }, { codigo: asNumber }] : []),
        ],
      });
    }
  }

  return { AND: and };
};

const buildApplicableWhere = (scope, entityName) => {
  const and = [
    { cliente_id: scope.clienteId },
    { ativo: true },
    { telas: { some: { tela: { entity_name: entityName } } } },
  ];

  const empresaOr = [{ aplicacao_modo: CADCPS_APLICACAO.TODAS }];
  if (scope.selectedEmpresaId && scope.selectedEmpresaId !== "all") {
    empresaOr.push({ empresas: { some: { empresa_id: scope.selectedEmpresaId } } });
  } else if (!scope.acessoGlobal && scope.allowedEmpresaIds?.length) {
    empresaOr.push({ empresas: { some: { empresa_id: { in: scope.allowedEmpresaIds } } } });
  } else if (scope.acessoGlobal) {
    empresaOr.push({ aplicacao_modo: CADCPS_APLICACAO.ESPECIFICAS });
  }

  and.push({ OR: empresaOr });
  return { AND: and };
};

const resolveTelaIdsFromPayload = (payload, fallbackTelas = []) => {
  const single = payload?.tela_id || payload?.tela_ids?.[0] || fallbackTelas[0]?.id;
  return single ? [String(single)] : [];
};

const syncRelations = async (prisma, campoId, { tela_ids = [], empresa_ids = [], opcoes = [], aplicacao_modo }) => {
  const telaIds = tela_ids.slice(0, 1);
  await prisma.cadCpsCampoTela.deleteMany({ where: { campo_id: campoId } });
  if (telaIds.length) {
    await prisma.cadCpsCampoTela.createMany({
      data: telaIds.map((tela_id) => ({ campo_id: campoId, tela_id })),
      skipDuplicates: true,
    });
  }

  await prisma.cadCpsCampoEmpresa.deleteMany({ where: { campo_id: campoId } });
  if (aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS && empresa_ids.length) {
    await prisma.cadCpsCampoEmpresa.createMany({
      data: empresa_ids.map((empresa_id) => ({ campo_id: campoId, empresa_id })),
      skipDuplicates: true,
    });
  }

  await prisma.cadCpsCampoOpcao.deleteMany({ where: { campo_id: campoId } });
  if (opcoes.length) {
    await prisma.cadCpsCampoOpcao.createMany({
      data: opcoes.map((opcao, index) => ({
        campo_id: campoId,
        codigo: String(opcao.codigo),
        descricao: String(opcao.descricao),
        ordem: opcao.ordem ?? index,
        ativo: opcao.ativo ?? true,
      })),
    });
  }
};

export const repCps = {
  async ensureTelasSeed() {
    const prisma = getPrismaClient();
    const registry = listCadastroModulesForCadcps();
    const activeCodes = new Set(registry.map((t) => t.codigo));

    for (const tela of registry) {
      await prisma.cadCpsTela.upsert({
        where: { codigo: tela.codigo },
        create: {
          codigo: tela.codigo,
          nome: tela.nome,
          entity_name: tela.entity_name,
          ordem: tela.ordem,
          ativo: true,
        },
        update: {
          nome: tela.nome,
          entity_name: tela.entity_name,
          ordem: tela.ordem,
          ativo: true,
        },
      });
    }

    if (activeCodes.size) {
      await prisma.cadCpsTela.updateMany({
        where: { codigo: { notIn: [...activeCodes] } },
        data: { ativo: false },
      });
    }
  },

  async listTelas() {
    const prisma = getPrismaClient();
    return prisma.cadCpsTela.findMany({ where: { ativo: true }, orderBy: { ordem: "asc" } });
  },

  async list({ scope, query }) {
    const prisma = getPrismaClient();
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || 50));
    const skip = (page - 1) * pageSize;
    const where = buildListWhere(scope, query);
    const sortBy = String(query.sortBy || "codigo");
    const sortDir = query.sortDir === "desc" ? "desc" : "asc";
    const orderBy = { [sortBy]: sortDir };

    const [rows, total] = await Promise.all([
      prisma.cadCpsCampo.findMany({ where, include: CAMPO_INCLUDE, skip, take: pageSize, orderBy }),
      prisma.cadCpsCampo.count({ where }),
    ]);

    return {
      items: rows.map(mapCampoRow),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(scope, id) {
    const prisma = getPrismaClient();
    const row = await prisma.cadCpsCampo.findFirst({
      where: { id, cliente_id: scope.clienteId },
      include: CAMPO_INCLUDE,
    });
    return mapCampoRow(row);
  },

  async listApplicable(scope, entityName) {
    const prisma = getPrismaClient();
    const rows = await prisma.cadCpsCampo.findMany({
      where: buildApplicableWhere(scope, entityName),
      include: CAMPO_INCLUDE,
      orderBy: [{ ordem_tabela: "asc" }, { nome: "asc" }],
    });
    return rows.map(mapCampoRow);
  },

  async create({ scope, payload }) {
    const prisma = getPrismaClient();
    const field_name = resolveFieldName(payload);
    const existing = await prisma.cadCpsCampo.findFirst({
      where: { cliente_id: scope.clienteId, field_name },
    });
    if (existing) {
      const error = new Error(`Já existe campo com nome técnico "${field_name}".`);
      error.statusCode = 409;
      throw error;
    }

    const aplicacao_modo = payload.aplicacao_modo || CADCPS_APLICACAO.TODAS;
    const data = {
      cliente_id: scope.clienteId,
      nome: payload.nome,
      field_name,
      descricao: payload.descricao,
      tipo: normalizeCadcpsTipo(payload.tipo),
      ativo: payload.ativo ?? true,
      obrigatorio: payload.obrigatorio ?? false,
      read_only: payload.read_only ?? false,
      visivel_form: payload.visivel_form ?? true,
      visivel_tabela: payload.visivel_tabela ?? false,
      visivel_relatorio: payload.visivel_relatorio ?? false,
      pesquisavel: payload.pesquisavel ?? true,
      filtravel: payload.filtravel ?? true,
      exportavel: payload.exportavel ?? true,
      auditavel: payload.auditavel ?? true,
      aplicacao_modo,
      placeholder: payload.placeholder,
      formula: payload.formula,
      calculation_builder: payload.calculation_builder,
      usar_mascara: payload.usar_mascara ?? false,
      mascaras_text: payload.mascaras_text,
      usar_decimal: payload.usar_decimal ?? false,
      decimal_places: payload.decimal_places ?? 2,
      separador_decimal: payload.separador_decimal || ",",
      separador_milhar: payload.separador_milhar || ".",
      ordem_tabela: payload.ordem_tabela ?? 999,
      largura_coluna: payload.largura_coluna ?? 160,
      relation_entity: payload.relation_entity,
      options_label_field: payload.options_label_field,
      options_value_field: payload.options_value_field,
      created_by: scope.userId,
      updated_by: scope.userId,
    };

    const created = await prisma.$transaction(async (tx) => {
      const codigo = await nextCodigo(tx, scope.clienteId);
      const idGlobal = await reserveNextIdGlobal(tx, scope.clienteId);
      const record = await tx.cadCpsCampo.create({
        data: {
          ...data,
          codigo,
          id_global: idGlobal,
        },
      });
      await registerRegistroGlobal(tx, {
        clienteId: scope.clienteId,
        idGlobal,
        entityName: "CadCpsCampo",
        registroId: record.id,
      });
      await syncRelations(tx, record.id, {
        tela_ids: resolveTelaIdsFromPayload(payload),
        empresa_ids: payload.empresa_ids,
        opcoes: payload.opcoes,
        aplicacao_modo,
      });
      return record;
    });

    const full = await this.getById(scope, created.id);
    await recordHistorico(prisma, { scope, campoId: created.id, acao: "CREATE", valorNovo: full });
    void auditService.log({
      scope,
      entityName: "CadCpsCampo",
      action: "CREATE",
      entityId: created.id,
      idGlobal: created.id_global,
      payload: {
        id_global: created.id_global,
        codigo: created.codigo,
        field_name,
        nome: payload.nome,
      },
    });

    return full;
  },

  async update({ scope, id, payload }) {
    const prisma = getPrismaClient();
    const current = await this.getById(scope, id);
    if (!current) return null;

    await assertCampoNotInUse(current, scope, "editado");

    const field_name = payload.field_name
      ? assertFieldName(payload.field_name)
      : current.field_name;

    const data = {
      ...(payload.nome !== undefined ? { nome: payload.nome } : {}),
      ...(payload.field_name !== undefined ? { field_name } : {}),
      ...(payload.descricao !== undefined ? { descricao: payload.descricao } : {}),
      ...(payload.tipo !== undefined ? { tipo: normalizeCadcpsTipo(payload.tipo) } : {}),
      ...(payload.ativo !== undefined ? { ativo: payload.ativo } : {}),
      ...(payload.obrigatorio !== undefined ? { obrigatorio: payload.obrigatorio } : {}),
      ...(payload.read_only !== undefined ? { read_only: payload.read_only } : {}),
      ...(payload.visivel_form !== undefined ? { visivel_form: payload.visivel_form } : {}),
      ...(payload.visivel_tabela !== undefined ? { visivel_tabela: payload.visivel_tabela } : {}),
      ...(payload.visivel_relatorio !== undefined ? { visivel_relatorio: payload.visivel_relatorio } : {}),
      ...(payload.pesquisavel !== undefined ? { pesquisavel: payload.pesquisavel } : {}),
      ...(payload.filtravel !== undefined ? { filtravel: payload.filtravel } : {}),
      ...(payload.exportavel !== undefined ? { exportavel: payload.exportavel } : {}),
      ...(payload.auditavel !== undefined ? { auditavel: payload.auditavel } : {}),
      ...(payload.aplicacao_modo !== undefined ? { aplicacao_modo: payload.aplicacao_modo } : {}),
      ...(payload.placeholder !== undefined ? { placeholder: payload.placeholder } : {}),
      ...(payload.formula !== undefined ? { formula: payload.formula } : {}),
      ...(payload.calculation_builder !== undefined
        ? { calculation_builder: payload.calculation_builder }
        : {}),
      ...(payload.usar_mascara !== undefined ? { usar_mascara: payload.usar_mascara } : {}),
      ...(payload.mascaras_text !== undefined ? { mascaras_text: payload.mascaras_text } : {}),
      ...(payload.usar_decimal !== undefined ? { usar_decimal: payload.usar_decimal } : {}),
      ...(payload.decimal_places !== undefined ? { decimal_places: payload.decimal_places } : {}),
      ...(payload.separador_decimal !== undefined
        ? { separador_decimal: payload.separador_decimal }
        : {}),
      ...(payload.separador_milhar !== undefined ? { separador_milhar: payload.separador_milhar } : {}),
      ...(payload.ordem_tabela !== undefined ? { ordem_tabela: payload.ordem_tabela } : {}),
      ...(payload.largura_coluna !== undefined ? { largura_coluna: payload.largura_coluna } : {}),
      ...(payload.relation_entity !== undefined ? { relation_entity: payload.relation_entity } : {}),
      ...(payload.options_label_field !== undefined
        ? { options_label_field: payload.options_label_field }
        : {}),
      ...(payload.options_value_field !== undefined
        ? { options_value_field: payload.options_value_field }
        : {}),
      updated_by: scope.userId,
    };

    await prisma.cadCpsCampo.update({ where: { id }, data });

    if (
      payload.tela_id ||
      payload.tela_ids ||
      payload.empresa_ids ||
      payload.opcoes ||
      payload.aplicacao_modo !== undefined
    ) {
      await syncRelations(prisma, id, {
        tela_ids: resolveTelaIdsFromPayload(payload, current.telas),
        empresa_ids: payload.empresa_ids || current.empresa_ids,
        opcoes: payload.opcoes || current.opcoes,
        aplicacao_modo: payload.aplicacao_modo || current.aplicacao_modo,
      });
    }

    const full = await this.getById(scope, id);
    await recordHistorico(prisma, {
      scope,
      campoId: id,
      acao: "UPDATE",
      valorAnterior: current,
      valorNovo: full,
    });
    void auditService.log({
      scope,
      entityName: "CadCpsCampo",
      action: "UPDATE",
      entityId: id,
      payload: { field_name: full.field_name },
    });

    return full;
  },

  async remove({ scope, id }) {
    const prisma = getPrismaClient();
    const current = await this.getById(scope, id);
    if (!current) return false;

    await assertCampoNotInUse(current, scope, "excluído");

    await recordHistorico(prisma, {
      scope,
      campoId: id,
      acao: "DELETE",
      valorAnterior: current,
    });
    await prisma.cadCpsCampo.delete({ where: { id } });
    void auditService.log({
      scope,
      entityName: "CadCpsCampo",
      action: "DELETE",
      entityId: id,
      payload: { field_name: current.field_name },
    });
    return true;
  },

  async listHistorico(scope, campoId) {
    const prisma = getPrismaClient();
    return prisma.cadCpsHistorico.findMany({
      where: { cliente_id: scope.clienteId, campo_id: campoId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },
};
