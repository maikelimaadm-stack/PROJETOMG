import { getPrismaClient } from "../../database/prismaClient.js";
import { runTransactionWithRetry } from "../../database/transactionRetry.js";
import { auditService } from "../audit/auditService.js";
import {
  registerRegistroGlobal,
  reserveNextIdGlobal,
} from "../idGlobal/idGlobalService.js";
import {
  ENTITY_CODIGO_CADCPS,
  reserveNextCodigo,
} from "../sequencias/entidadeCodigoService.js";
import { assertCampoNotInUse } from "./cadcpsFieldUsage.js";
import { CADCPS_APLICACAO, normalizeCadcpsTipo } from "./cadcpsConstants.js";
import { incrementClienteCounter } from "../metrics/counterService.js";
import { listCadastroModulesForCadcps } from "./cadastroModuleRegistry.js";
import { mdpFieldRepository } from "../mdp/mdpFieldRepository.js";
import {
  buildLabelCreate,
  buildStableFieldId,
  CADCPS_APLICACAO_TO_MDP,
  MDP_PLATFORM_VERSION_ID,
} from "../mdp/mdpFieldConstants.js";
import {
  campoPayloadToMdpFieldData,
  mdpFieldToCampoShape,
} from "../mdp/mdpFieldCadcpsAdapter.js";
import { mdpEntityRepository } from "../mdp/mdpEntityRepository.js";

const CADCPS_SORT_WHITELIST = new Set([
  "codigo",
  "nome",
  "field_name",
  "tipo",
  "ativo",
  "ordem_tabela",
  "id_global",
  "aplicacao_modo",
  "updatedAt",
]);
const CADCPS_CURSOR_SORT_FIELDS = new Set(["codigo", "id_global"]);

const MAX_PAGE_SIZE = 200;

const SORT_FIELD_MAP = {
  codigo: "codigo",
  field_name: "field_name",
  tipo: "field_type",
  ativo: "active",
  ordem_tabela: "table_order",
  id_global: "id_global",
  aplicacao_modo: "empresa_applicability",
  updatedAt: "updated_at",
};

const encodeCursor = ({ sortField, direction, value, id }) => {
  const payload = JSON.stringify({
    s: sortField,
    d: direction,
    v: Number(value),
    i: String(id),
  });
  return Buffer.from(payload, "utf8").toString("base64url");
};

const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const value = Number(parsed.v);
    if (!Number.isFinite(value) || !parsed.i || !parsed.s || !parsed.d) return null;
    return {
      sortField: String(parsed.s),
      direction: String(parsed.d) === "desc" ? "desc" : "asc",
      value,
      id: String(parsed.i),
    };
  } catch {
    return null;
  }
};

const buildKeysetCursorWhere = (baseWhere, cursorMeta, prismaSortField) => {
  const comparator = cursorMeta.direction === "desc" ? "lt" : "gt";
  return {
    AND: [
      baseWhere,
      {
        OR: [
          { [prismaSortField]: { [comparator]: cursorMeta.value } },
          {
            AND: [
              { [prismaSortField]: cursorMeta.value },
              { id: { [comparator]: cursorMeta.id } },
            ],
          },
        ],
      },
    ],
  };
};

const recordHistorico = async (scope, fieldRowId, { acao, valorAnterior, valorNovo }) => {
  await mdpFieldRepository.createAudit({
    field_row_id: fieldRowId,
    cliente_id: scope.clienteId,
    action: acao,
    before: valorAnterior ?? undefined,
    after: valorNovo ?? undefined,
    usuario_id: scope.userId,
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

const resolveEntityFromTela = async (prisma, scope, telaId) => {
  const tela = await prisma.cadCpsTela.findUnique({ where: { id: telaId } });
  if (!tela) return null;
  return mdpEntityRepository.findByEntityId({
    entityId: tela.entity_name,
    clienteId: scope.clienteId,
  });
};

const buildListWhere = (scope, query = {}) => {
  const and = [
    { cliente_id: scope.clienteId },
    { source: "custom" },
    { lifecycle: "active" },
  ];
  if (scope.perfil !== "ADMIN") {
    const empresaClauses = [{ empresa_applicability: "all" }];
    if (scope.selectedEmpresaId && scope.selectedEmpresaId !== "all") {
      empresaClauses.push({ empresa_scopes: { some: { empresa_id: scope.selectedEmpresaId } } });
    } else if (scope.allowedEmpresaIds?.length) {
      empresaClauses.push({
        empresa_scopes: { some: { empresa_id: { in: scope.allowedEmpresaIds } } },
      });
    }
    and.push({ OR: empresaClauses });
  }

  if (query.codigo) and.push({ codigo: Number(query.codigo) });
  if (query.nome) {
    and.push({ labels: { some: { label: { contains: String(query.nome), mode: "insensitive" } } } });
  }
  if (query.tipo) and.push({ field_type: String(query.tipo) });
  if (query.ativo !== undefined) and.push({ active: Boolean(query.ativo) });
  if (query.obrigatorio !== undefined) and.push({ required: Boolean(query.obrigatorio) });
  if (query.com_formula) and.push({ formula: { not: null } });
  if (query.com_mascara) and.push({ use_mask: true });
  if (query.com_decimal) and.push({ use_decimal: true });
  if (query.field_name) {
    and.push({ field_name: { contains: String(query.field_name), mode: "insensitive" } });
  }
  if (query.aplicacao_modo) {
    and.push({
      empresa_applicability: CADCPS_APLICACAO_TO_MDP[query.aplicacao_modo] || "all",
    });
  }
  if (query.id_global) and.push({ id_global: Number(query.id_global) });

  if (query.tela_id) {
    and.push({ telas: { some: { tela_id: String(query.tela_id) } } });
  }

  if (query.empresa_id) {
    and.push({
      OR: [
        { empresa_applicability: "all" },
        { empresa_scopes: { some: { empresa_id: String(query.empresa_id) } } },
      ],
    });
  }

  const filters = query.filters && typeof query.filters === "object" ? query.filters : {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null || value === "") return;

    if (key.endsWith("__in")) {
      const baseKey = key.slice(0, -4);
      const values = Array.isArray(value) ? value : [value];
      const normalized = values.map((item) => String(item).trim()).filter(Boolean);
      if (normalized.length === 0) return;
      if (baseKey === "ativo" || baseKey === "obrigatorio") {
        const prismaKey = baseKey === "ativo" ? "active" : "required";
        and.push({
          [prismaKey]: {
            in: normalized.map((v) => v === "Sim" || v === true || v === "true"),
          },
        });
        return;
      }
      if (baseKey === "codigo" || baseKey === "id_global") {
        and.push({ [baseKey]: { in: normalized.map(Number).filter(Number.isFinite) } });
        return;
      }
      const mappedKey = SORT_FIELD_MAP[baseKey] || baseKey;
      and.push({ [mappedKey]: { in: normalized } });
      return;
    }

    if (key === "ativo" || key === "obrigatorio") {
      const prismaKey = key === "ativo" ? "active" : "required";
      and.push({ [prismaKey]: value === "Sim" || value === true || value === "true" });
      return;
    }
    if (key === "codigo" || key === "id_global") {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) and.push({ [key]: Math.floor(numeric) });
      return;
    }
    if (key === "tipo") {
      and.push({ field_type: String(value) });
      return;
    }
    if (key === "aplicacao_modo") {
      and.push({ empresa_applicability: CADCPS_APLICACAO_TO_MDP[value] || "all" });
      return;
    }
    if (key === "nome") {
      and.push({ labels: { some: { label: { contains: String(value).trim(), mode: "insensitive" } } } });
      return;
    }
    if (key === "field_name") {
      and.push({ field_name: { contains: String(value).trim(), mode: "insensitive" } });
    }
  });

  const search = String(query.search || "").trim();
  if (search) {
    if (/^\d+$/.test(search)) {
      const asNumber = Number(search);
      if (Number.isFinite(asNumber)) {
        and.push({ OR: [{ id_global: asNumber }, { codigo: asNumber }] });
      }
    } else {
      const asNumber = Number(search);
      and.push({
        OR: [
          { labels: { some: { label: { contains: search, mode: "insensitive" } } } },
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
    { active: true },
    { source: { in: ["custom", "computed", "derived"] } },
    { telas: { some: { tela: { entity_name: entityName } } } },
  ];

  const empresaOr = [{ empresa_applicability: "all" }];
  if (scope.selectedEmpresaId && scope.selectedEmpresaId !== "all") {
    empresaOr.push({ empresa_scopes: { some: { empresa_id: scope.selectedEmpresaId } } });
  } else if (!scope.acessoGlobal && scope.allowedEmpresaIds?.length) {
    empresaOr.push({ empresa_scopes: { some: { empresa_id: { in: scope.allowedEmpresaIds } } } });
  } else if (scope.acessoGlobal) {
    empresaOr.push({ empresa_applicability: "selected" });
  }

  and.push({ OR: empresaOr });
  return { AND: and };
};

const resolveTelaIdsFromPayload = (payload, fallbackTelas = []) => {
  const single = payload?.tela_id || payload?.tela_ids?.[0] || fallbackTelas[0]?.id;
  return single ? [String(single)] : [];
};

const assertEmpresaIdsBelongToCliente = async (prisma, scope, empresaIds) => {
  if (!empresaIds.length) return [];
  const normalized = [...new Set(empresaIds.map((id) => String(id).trim()).filter(Boolean))];
  if (!normalized.length) return [];
  const empresas = await prisma.empresa.findMany({
    where: { id: { in: normalized }, cliente_id: scope.clienteId },
    select: { id: true },
  });
  const allowed = new Set(empresas.map((item) => item.id));
  const invalid = normalized.filter((id) => !allowed.has(id));
  if (invalid.length > 0) {
    const error = new Error("empresa_ids contém empresas inválidas para este cliente.");
    error.statusCode = 400;
    throw error;
  }
  return normalized;
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
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || 50));
    const skip = (page - 1) * pageSize;
    const where = buildListWhere(scope, query);
    const rawSortBy = String(query.sortBy || "codigo");
    const sortBy = CADCPS_SORT_WHITELIST.has(rawSortBy) ? rawSortBy : "codigo";
    const prismaSortField = SORT_FIELD_MAP[sortBy] || "codigo";
    const sortDir = query.sortDir === "desc" ? "desc" : "asc";
    const cursorMeta = decodeCursor(query.cursor);
    const isCursorMode =
      CADCPS_CURSOR_SORT_FIELDS.has(sortBy) &&
      cursorMeta &&
      cursorMeta.sortField === sortBy &&
      cursorMeta.direction === sortDir;
    const orderBy = isCursorMode
      ? [{ [prismaSortField]: sortDir }, { id: sortDir }]
      : { [prismaSortField]: sortDir };
    const pageWhere = isCursorMode ? buildKeysetCursorWhere(where, cursorMeta, prismaSortField) : where;
    const hasHeavyFilter = Boolean(
      String(query.search || "").trim() || (query.filters && Object.keys(query.filters).length)
    );
    const shouldIncludeTotal =
      String(query.includeTotal ?? "true").toLowerCase() !== "false" &&
      String(query.includeTotal ?? "true").toLowerCase() !== "0";

    const rows = await prisma.mdpField.findMany({
      where: pageWhere,
      include: mdpFieldRepository.include,
      ...(isCursorMode ? {} : { skip }),
      take: pageSize,
      orderBy,
    });

    let total;
    if (shouldIncludeTotal && hasHeavyFilter) {
      total = await prisma.mdpField.count({ where });
    } else if (shouldIncludeTotal) {
      total = await mdpFieldRepository.countCustomFields(scope.clienteId);
    } else {
      const baseTotal = (page - 1) * pageSize;
      total = baseTotal + rows.length + (rows.length === pageSize ? 1 : 0);
    }

    return {
      items: rows.map(mdpFieldToCampoShape),
      total,
      page,
      pageSize,
      totalPages: shouldIncludeTotal
        ? Math.max(1, Math.ceil(total / pageSize))
        : rows.length < pageSize
          ? page
          : page + 1,
      nextCursor:
        isCursorMode && rows.length === pageSize
          ? encodeCursor({
              sortField: sortBy,
              direction: sortDir,
              value: rows[rows.length - 1]?.[prismaSortField],
              id: rows[rows.length - 1]?.id,
            })
          : null,
    };
  },

  async getById(scope, id) {
    const row = await mdpFieldRepository.findById({ id, clienteId: scope.clienteId });
    if (!row || row.source !== "custom") return null;
    return mdpFieldToCampoShape(row);
  },

  async listApplicable(scope, entityName) {
    const prisma = getPrismaClient();
    const rows = await prisma.mdpField.findMany({
      where: buildApplicableWhere(scope, entityName),
      include: mdpFieldRepository.applicableInclude,
      orderBy: [{ table_order: "asc" }, { field_name: "asc" }],
    });
    return rows.map(mdpFieldToCampoShape);
  },

  async create({ scope, payload }) {
    const prisma = getPrismaClient();
    const field_name = resolveFieldName(payload);
    const telaIds = resolveTelaIdsFromPayload(payload);
    if (!telaIds.length) {
      const error = new Error("tela_id é obrigatório para criar campo personalizado.");
      error.statusCode = 400;
      throw error;
    }

    const entity = await resolveEntityFromTela(prisma, scope, telaIds[0]);
    if (!entity) {
      const error = new Error("Entidade alvo da tela não encontrada no Entity Dictionary.");
      error.statusCode = 400;
      throw error;
    }

    const existing = await mdpFieldRepository.findByFieldName({
      fieldName: field_name,
      entityRowId: entity.id,
      clienteId: scope.clienteId,
    });
    if (existing) {
      const error = new Error(`Já existe campo com nome técnico "${field_name}".`);
      error.statusCode = 409;
      throw error;
    }

    const aplicacao_modo = payload.aplicacao_modo || CADCPS_APLICACAO.TODAS;
    const stableFieldId = buildStableFieldId(entity.entity_id, field_name);
    const mdpData = campoPayloadToMdpFieldData(payload, {
      fieldName: field_name,
      entityRowId: entity.id,
      stableFieldId,
      scope: "tenant",
      clienteId: scope.clienteId,
      source: "custom",
    });

    const created = await runTransactionWithRetry(prisma, async (tx) => {
      const codigo = await reserveNextCodigo(tx, scope.clienteId, ENTITY_CODIGO_CADCPS);
      const idGlobal = await reserveNextIdGlobal(tx, scope.clienteId);
      const record = await tx.mdpField.create({
        data: {
          ...mdpData,
          codigo,
          id_global: idGlobal,
          version_id: MDP_PLATFORM_VERSION_ID,
          created_by: scope.userId,
          updated_by: scope.userId,
          labels: {
            create: buildLabelCreate(payload.nome, payload.descricao, payload.placeholder),
          },
        },
      });
      await registerRegistroGlobal(tx, {
        clienteId: scope.clienteId,
        idGlobal,
        entityName: "MdpField",
        registroId: record.id,
      });
      const empresaIds =
        aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS
          ? await assertEmpresaIdsBelongToCliente(tx, scope, payload.empresa_ids || [])
          : [];
      await mdpFieldRepository.syncRelations(tx, record.id, {
        tela_ids: telaIds,
        empresa_ids: empresaIds,
        opcoes: payload.opcoes || [],
        empresa_applicability: mdpData.empresa_applicability,
      });
      return record;
    });

    void incrementClienteCounter(scope.clienteId, "cadcps", 1);

    const full = await this.getById(scope, created.id);
    await recordHistorico(scope, created.id, { acao: "CREATE", valorNovo: full });
    void auditService.log({
      scope,
      entityName: "MdpField",
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

    const mdpUpdates = {
      ...(payload.nome !== undefined || payload.descricao !== undefined || payload.placeholder !== undefined
        ? {}
        : {}),
      ...(payload.field_name !== undefined ? { field_name } : {}),
      ...(payload.tipo !== undefined ? { field_type: normalizeCadcpsTipo(payload.tipo) } : {}),
      ...(payload.ativo !== undefined ? { active: payload.ativo } : {}),
      ...(payload.obrigatorio !== undefined ? { required: payload.obrigatorio } : {}),
      ...(payload.read_only !== undefined ? { read_only: payload.read_only } : {}),
      ...(payload.visivel_form !== undefined ? { visible_form: payload.visivel_form } : {}),
      ...(payload.visivel_tabela !== undefined ? { visible_table: payload.visivel_tabela } : {}),
      ...(payload.visivel_relatorio !== undefined ? { visible_report: payload.visivel_relatorio } : {}),
      ...(payload.pesquisavel !== undefined ? { searchable: payload.pesquisavel } : {}),
      ...(payload.filtravel !== undefined ? { filterable: payload.filtravel } : {}),
      ...(payload.exportavel !== undefined ? { exportable: payload.exportavel } : {}),
      ...(payload.auditavel !== undefined ? { auditable: payload.auditavel } : {}),
      ...(payload.aplicacao_modo !== undefined
        ? { empresa_applicability: CADCPS_APLICACAO_TO_MDP[payload.aplicacao_modo] || "all" }
        : {}),
      ...(payload.placeholder !== undefined ? { placeholder: payload.placeholder } : {}),
      ...(payload.formula !== undefined ? { formula: payload.formula } : {}),
      ...(payload.calculation_builder !== undefined
        ? { calculation_builder: payload.calculation_builder }
        : {}),
      ...(payload.usar_mascara !== undefined ? { use_mask: payload.usar_mascara } : {}),
      ...(payload.mascaras_text !== undefined ? { mask_text: payload.mascaras_text } : {}),
      ...(payload.usar_decimal !== undefined ? { use_decimal: payload.usar_decimal } : {}),
      ...(payload.decimal_places !== undefined ? { decimal_places: payload.decimal_places } : {}),
      ...(payload.separador_decimal !== undefined
        ? { decimal_separator: payload.separador_decimal }
        : {}),
      ...(payload.separador_milhar !== undefined
        ? { thousand_separator: payload.separador_milhar }
        : {}),
      ...(payload.ordem_tabela !== undefined ? { table_order: payload.ordem_tabela } : {}),
      ...(payload.largura_coluna !== undefined ? { column_width: payload.largura_coluna } : {}),
      ...(payload.relation_entity !== undefined ? { relation_entity: payload.relation_entity } : {}),
      ...(payload.options_label_field !== undefined
        ? { options_label_field: payload.options_label_field }
        : {}),
      ...(payload.options_value_field !== undefined
        ? { options_value_field: payload.options_value_field }
        : {}),
      updated_by: scope.userId,
    };

    await mdpFieldRepository.update(id, mdpUpdates);

    if (payload.nome !== undefined || payload.descricao !== undefined || payload.placeholder !== undefined) {
      await mdpFieldRepository.upsertLabel(prisma, id, {
        locale: "pt-BR",
        label: payload.nome ?? current.nome,
        description: payload.descricao ?? current.descricao,
        placeholder: payload.placeholder ?? current.placeholder,
      });
    }

    if (
      payload.tela_id ||
      payload.tela_ids ||
      payload.empresa_ids ||
      payload.opcoes ||
      payload.aplicacao_modo !== undefined
    ) {
      const aplicacao =
        payload.aplicacao_modo !== undefined
          ? CADCPS_APLICACAO_TO_MDP[payload.aplicacao_modo] || "all"
          : CADCPS_APLICACAO_TO_MDP[current.aplicacao_modo] || "all";
      const empresaIds =
        aplicacao === "selected"
          ? await assertEmpresaIdsBelongToCliente(
              prisma,
              scope,
              payload.empresa_ids || current.empresa_ids || []
            )
          : [];
      await mdpFieldRepository.syncRelations(prisma, id, {
        tela_ids: resolveTelaIdsFromPayload(payload, current.telas),
        empresa_ids: empresaIds,
        opcoes: payload.opcoes || current.opcoes,
        empresa_applicability: aplicacao,
      });
    }

    const full = await this.getById(scope, id);
    await recordHistorico(scope, id, {
      acao: "UPDATE",
      valorAnterior: current,
      valorNovo: full,
    });
    void auditService.log({
      scope,
      entityName: "MdpField",
      action: "UPDATE",
      entityId: id,
      payload: { field_name: full.field_name },
    });

    return full;
  },

  async remove({ scope, id }) {
    const current = await this.getById(scope, id);
    if (!current) return false;

    await assertCampoNotInUse(current, scope, "excluído");

    await recordHistorico(scope, id, { acao: "DELETE", valorAnterior: current });
    await mdpFieldRepository.delete(id);
    void incrementClienteCounter(scope.clienteId, "cadcps", -1);
    void auditService.log({
      scope,
      entityName: "MdpField",
      action: "DELETE",
      entityId: id,
      payload: { field_name: current.field_name },
    });
    return true;
  },

  async listHistorico(scope, campoId) {
    const rows = await mdpFieldRepository.listAudits({
      fieldRowId: campoId,
      clienteId: scope.clienteId,
    });
    return rows.map((row) => ({
      id: row.id,
      cliente_id: row.cliente_id,
      campo_id: row.field_row_id,
      usuario_id: row.usuario_id,
      acao: row.action,
      valor_anterior: row.before,
      valor_novo: row.after,
      createdAt: row.created_at,
    }));
  },
};
