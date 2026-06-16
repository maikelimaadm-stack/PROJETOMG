import { getPrismaClient } from "../../../database/prismaClient.js";
import { auditService } from "../../audit/auditService.js";
import { svcCps } from "../../cadcps/svcCps.js";
import { toLegacyCampoList } from "../../cadcps/campoLegacyAdapter.js";
import { runTransactionWithRetry } from "../../../database/transactionRetry.js";
import {
  registerRegistroGlobal,
  reserveNextIdGlobal,
  syncClienteIdGlobalFloor,
} from "../../idGlobal/idGlobalService.js";
import { getEmpresaCount, incrementClienteCounter, bumpNextIdGlobalInCache } from "../../metrics/counterService.js";
import {
  ENTITY_CODIGO_EMPRESA,
  ensureCodigoSequenciaFloor,
  reserveNextCodigo,
} from "../../sequencias/entidadeCodigoService.js";

const EMPRESAS_ENTITY_NAME = "EmpresaCadastro";

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 500;
const MAX_EXPORT_ROWS = 100_000;

/** Colunas retornadas em listagens paginadas (sem observações/logo pesados). */
const LIST_SELECT = {
  id: true,
  id_global: true,
  codempresa: true,
  razao_social: true,
  nome_fantasia: true,
  tipo_pessoa: true,
  tipo_vinculo: true,
  cpf_cnpj: true,
  inscricao_estadual: true,
  telefone: true,
  whatsapp: true,
  email: true,
  cep: true,
  endereco: true,
  numero: true,
  bairro: true,
  cidade: true,
  estado: true,
  status: true,
  campos_personalizados: true,
  createdAt: true,
  updatedAt: true,
};

/** Select enxuto para exportação CSV/Excel (sem JSON pesado). */
const EXPORT_SELECT = {
  id: true,
  id_global: true,
  codempresa: true,
  razao_social: true,
  nome_fantasia: true,
  cpf_cnpj: true,
  telefone: true,
  email: true,
  cidade: true,
  estado: true,
  status: true,
};

const EXPORT_COLUMNS = [
  { label: "ID Global", getValue: (row) => row.id_global ?? "" },
  { label: "Código", getValue: (row) => row.codempresa ?? "" },
  { label: "Razão Social", getValue: (row) => row.razao_social ?? "" },
  { label: "Nome Fantasia", getValue: (row) => row.nome_fantasia ?? "" },
  { label: "CPF/CNPJ", getValue: (row) => row.cpf_cnpj ?? "" },
  { label: "Telefone", getValue: (row) => row.telefone ?? "" },
  { label: "E-mail", getValue: (row) => row.email ?? "" },
  { label: "Cidade", getValue: (row) => row.cidade ?? "" },
  { label: "Estado", getValue: (row) => row.estado ?? "" },
  { label: "Status", getValue: (row) => row.status ?? "" },
];

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

const SORT_WHITELIST = new Set(Object.keys(ORDER_BY_MAP));

const isIdGlobalUniqueConflict = (error) => {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  const targets = Array.isArray(error?.meta?.target)
    ? error.meta.target.map((item) => String(item))
    : [];
  if (code !== "P2002") return false;
  if (targets.includes("cliente_id") && targets.includes("id_global")) return true;
  return (
    message.includes("cliente_id`,`id_global") ||
    message.includes("(cliente_id,id_global)") ||
    message.includes("id_global")
  );
};

const isCodigoUniqueConflict = (error) => {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  const targets = Array.isArray(error?.meta?.target)
    ? error.meta.target.map((item) => String(item))
    : [];
  if (code !== "P2002") return false;
  if (targets.includes("cliente_id") && targets.includes("codempresa")) return true;
  return (
    message.includes("cliente_id`,`codempresa") ||
    message.includes("(cliente_id,codempresa)") ||
    message.includes("codempresa")
  );
};

const resolveOrderBy = (sortBy = "codempresa", sortDir = "asc") => {
  const safeSortBy = SORT_WHITELIST.has(sortBy) ? sortBy : "codempresa";
  const base = ORDER_BY_MAP[safeSortBy] || ORDER_BY_MAP.codempresa;
  const direction = String(sortDir || "asc").toLowerCase() === "desc" ? "desc" : "asc";
  const [key] = Object.keys(base);
  return { [key]: direction };
};

const CURSOR_SORT_FIELDS = new Set(["codempresa", "id_global"]);

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

const buildKeysetCursorWhere = (baseWhere, cursorMeta) => {
  const comparator = cursorMeta.direction === "desc" ? "lt" : "gt";
  const sortField = cursorMeta.sortField;
  return {
    AND: [
      baseWhere,
      {
        OR: [
          { [sortField]: { [comparator]: cursorMeta.value } },
          {
            AND: [
              { [sortField]: cursorMeta.value },
              { id: { [comparator]: cursorMeta.id } },
            ],
          },
        ],
      },
    ],
  };
};

const buildListWhere = async (prisma, scope, { search = "", filters = {} } = {}) => {
  const searchTerm = String(search || "").trim();
  const baseSearchWhere = buildSearchWhere(searchTerm);
  const customFieldIds = searchTerm
    ? await findIdsMatchingCustomFields(prisma, scope, searchTerm)
    : [];
  const numericContainsIds = searchTerm
    ? await findIdsMatchingNumericContains(prisma, scope, searchTerm)
    : [];
  const searchWhere = mergeSearchWhere(baseSearchWhere, [
    ...customFieldIds,
    ...numericContainsIds,
  ]);
  const filtersWhere = buildFiltersWhere(filters);
  const scopedClauses = [];
  if (searchWhere) scopedClauses.push(searchWhere);
  if (filtersWhere) scopedClauses.push(filtersWhere);
  return buildCadastroScopeWhere(
    scope,
    scopedClauses.length === 0
      ? {}
      : scopedClauses.length === 1
        ? scopedClauses[0]
        : { AND: scopedClauses }
  );
};

const buildCustomDistinctSql = (scope, fieldName, limit, optionSearch = "") => {
  const safeField = String(fieldName || "").replace(/[^a-zA-Z0-9_]/g, "");
  if (!safeField) return null;
  const params = [scope.clienteId, limit];
  let sql = `
    SELECT DISTINCT TRIM(campos_personalizados->>'${safeField}') AS value
    FROM "Empresa"
    WHERE cliente_id = $1
      AND campos_personalizados IS NOT NULL
      AND campos_personalizados ? '${safeField}'
      AND TRIM(campos_personalizados->>'${safeField}') <> ''
  `;
  const optionSearchTerm = String(optionSearch || "").trim();
  if (optionSearchTerm) {
    sql += ` AND campos_personalizados->>'${safeField}' ILIKE $${params.length + 1}`;
    params.push(
      `%${optionSearchTerm
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_")}%`
    );
  }

  if (!scope.acessoGlobal) {
    const allowed = scope.allowedEmpresaIds.length > 0 ? scope.allowedEmpresaIds : [EMPTY_RESULT_COMPANY_ID];
    const placeholders = allowed.map((_, index) => `$${index + 3}`).join(", ");
    sql += ` AND id IN (${placeholders})`;
    params.push(...allowed);
  }

  if (scope.selectedEmpresaId) {
    sql += ` AND id = $${params.length + 1}`;
    params.push(scope.selectedEmpresaId);
  }

  sql += ` ORDER BY value ASC LIMIT $2`;
  return { sql, params };
};

const TEXT_SEARCH_FIELDS = [
  "razao_social",
  "nome_fantasia",
  "cpf_cnpj",
  "inscricao_estadual",
  "telefone",
  "whatsapp",
  "email",
  "cep",
  "endereco",
  "numero",
  "bairro",
  "cidade",
  "estado",
  "observacoes",
  "status",
  "tipo_pessoa",
  "tipo_vinculo",
];

const buildTextContainsClauses = (value) =>
  TEXT_SEARCH_FIELDS.map((field) => ({
    [field]: { contains: value, mode: "insensitive" },
  }));

const buildSearchWhere = (search) => {
  const value = String(search || "").trim();
  if (!value) return null;

  const or = buildTextContainsClauses(value);

  const numericSearch = Number(value);
  if (Number.isFinite(numericSearch)) {
    or.unshift({ id_global: Math.floor(numericSearch) });
    or.push({ codempresa: Math.floor(numericSearch) });
  }

  return { OR: or };
};

const findIdsMatchingCustomFields = async (prisma, scope, searchTerm) => {
  const value = String(searchTerm || "").trim();
  if (!value) return [];

  const pattern = `%${value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
  const params = [scope.clienteId, pattern];
  let sql = `
    SELECT id
    FROM "Empresa"
    WHERE cliente_id = $1
      AND campos_personalizados IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM jsonb_each_text(campos_personalizados) AS kv(key, value)
        WHERE value ILIKE $2
      )
  `;

  if (!scope.acessoGlobal) {
    const allowed = scope.allowedEmpresaIds.length > 0 ? scope.allowedEmpresaIds : [EMPTY_RESULT_COMPANY_ID];
    const placeholders = allowed.map((_, index) => `$${index + 3}`).join(", ");
    sql += ` AND id IN (${placeholders})`;
    params.push(...allowed);
  }

  if (scope.selectedEmpresaId) {
    sql += ` AND id = $${params.length + 1}`;
    params.push(scope.selectedEmpresaId);
  }

  const rows = await prisma.$queryRawUnsafe(sql, ...params);
  return rows.map((row) => row.id).filter(Boolean);
};

const findIdsMatchingNumericContains = async (prisma, scope, searchTerm) => {
  const value = String(searchTerm || "").trim();
  if (!value || !/\d/.test(value)) return [];

  const pattern = `%${value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
  const params = [scope.clienteId, pattern];
  let sql = `
    SELECT id
    FROM "Empresa"
    WHERE cliente_id = $1
      AND (
        CAST(codempresa AS TEXT) ILIKE $2
        OR CAST(id_global AS TEXT) ILIKE $2
      )
  `;

  if (!scope.acessoGlobal) {
    const allowed = scope.allowedEmpresaIds.length > 0 ? scope.allowedEmpresaIds : [EMPTY_RESULT_COMPANY_ID];
    const placeholders = allowed.map((_, index) => `$${index + 3}`).join(", ");
    sql += ` AND id IN (${placeholders})`;
    params.push(...allowed);
  }

  if (scope.selectedEmpresaId) {
    sql += ` AND id = $${params.length + 1}`;
    params.push(scope.selectedEmpresaId);
  }

  const rows = await prisma.$queryRawUnsafe(sql, ...params);
  return rows.map((row) => row.id).filter(Boolean);
};

const mergeSearchWhere = (baseWhere, extraIds = []) => {
  if (!baseWhere) return null;
  const uniqueIds = [...new Set(extraIds.filter(Boolean))];
  if (uniqueIds.length === 0) return baseWhere;
  return {
    OR: [...(baseWhere.OR || []), { id: { in: uniqueIds } }],
  };
};

const FILTER_FIELD_MAP = {
  status: { field: "status", match: "equals" },
  cidade: { field: "cidade", match: "contains" },
  estado: { field: "estado", match: "equals" },
  tipo_pessoa: { field: "tipo_pessoa", match: "equals" },
  tipo_vinculo: { field: "tipo_vinculo", match: "equals" },
  razao_social: { field: "razao_social", match: "contains" },
  nome_fantasia: { field: "nome_fantasia", match: "contains" },
  cpf_cnpj: { field: "cpf_cnpj", match: "contains" },
  telefone: { field: "telefone", match: "contains" },
  whatsapp: { field: "whatsapp", match: "contains" },
  email: { field: "email", match: "contains" },
  cep: { field: "cep", match: "contains" },
  bairro: { field: "bairro", match: "contains" },
  endereco: { field: "endereco", match: "contains" },
  codempresa: { field: "codempresa", match: "number" },
  id_global: { field: "id_global", match: "number" },
};

const buildFilterClause = (config, value) => {
  if (value == null || value === "") return null;

  if (config.match === "number") {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return { [config.field]: Math.floor(numeric) };
  }

  if (Array.isArray(value)) {
    const normalized = value.map((item) => String(item).trim()).filter(Boolean);
    if (normalized.length === 0) return null;
    return {
      [config.field]: {
        in: config.match === "number" ? normalized.map(Number).filter(Number.isFinite) : normalized,
      },
    };
  }

  if (config.match === "contains") {
    return {
      [config.field]: {
        contains: String(value).trim(),
        mode: "insensitive",
      },
    };
  }

  return {
    [config.field]: {
      equals: String(value).trim(),
      mode: "insensitive",
    },
  };
};

const buildFiltersWhere = (filters = {}) => {
  const and = [];
  const rawIds = filters.ids;
  if (rawIds != null) {
    const ids = Array.isArray(rawIds)
      ? rawIds.filter(Boolean)
      : String(rawIds)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
    if (ids.length > 0) {
      and.push({ id: { in: ids } });
    } else {
      and.push({ id: EMPTY_RESULT_COMPANY_ID });
    }
  }

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (key === "ids") return;
    if (value == null || value === "") return;

    if (key.endsWith("__in")) {
      const baseKey = key.slice(0, -4);
      if (baseKey.startsWith("custom:")) {
        const clause = buildCustomFieldFilterClause(baseKey.slice(7), value);
        if (clause) and.push(clause);
        return;
      }
      const config = FILTER_FIELD_MAP[baseKey];
      if (!config) return;
      const clause = buildFilterClause(config, value);
      if (clause) and.push(clause);
      return;
    }

    if (key.startsWith("custom:")) {
      const clause = buildCustomFieldFilterClause(key.slice(7), value);
      if (clause) and.push(clause);
      return;
    }

    const config = FILTER_FIELD_MAP[key];
    if (!config) return;
    const clause = buildFilterClause(config, value);
    if (clause) and.push(clause);
  });
  if (and.length === 0) return null;
  return { AND: and };
};

const buildCustomFieldFilterClause = (fieldName, value) => {
  const safeField = String(fieldName || "").trim();
  if (!safeField) return null;

  if (Array.isArray(value)) {
    const normalized = value.map((item) => String(item).trim()).filter(Boolean);
    if (normalized.length === 0) return null;
    return {
      OR: normalized.map((item) => ({
        campos_personalizados: {
          path: [safeField],
          equals: item,
        },
      })),
    };
  }

  const text = String(value).trim();
  if (!text) return null;
  return {
    campos_personalizados: {
      path: [safeField],
      string_contains: text,
    },
  };
};

const resolveDistinctField = (column) => {
  const key = String(column || "").trim();
  if (!key) return null;
  if (key.startsWith("custom:")) {
    return { type: "custom", field: key.slice(7) };
  }
  const config = FILTER_FIELD_MAP[key];
  if (!config) return null;
  return { type: "column", field: config.field };
};

const formatDistinctValue = (column, raw) => {
  if (raw == null || raw === "") return null;
  if (column === "tipo_vinculo") {
    if (raw === "proprietario") return "PROPRIETÁRIO";
    if (raw === "arrendatario") return "ARRENDATÁRIO";
  }
  if (column === "codempresa" || column === "id_global") return String(raw);
  return String(raw);
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
  LIST_SELECT,
  EXPORT_SELECT,
  EXPORT_COLUMNS,
  MAX_EXPORT_ROWS,
  resolveOrderBy,
  buildListWhere,
  async count(scope) {
    return getEmpresaCount(scope);
  },

  async list({
    scope,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search = "",
    sortBy,
    sortDir,
    filters = {},
    cursor = null,
    includeTotal = true,
  }) {
    const prisma = getPrismaClient();
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(MAX_PAGE_SIZE, toPositiveInt(pageSize, DEFAULT_PAGE_SIZE));
    const where = await buildListWhere(prisma, scope, { search, filters });
    const resolvedOrder = resolveOrderBy(sortBy, sortDir);
    const [sortField] = Object.keys(resolvedOrder);
    const direction = resolvedOrder[sortField] === "desc" ? "desc" : "asc";
    const cursorMeta = decodeCursor(cursor);
    const isCursorMode =
      CURSOR_SORT_FIELDS.has(sortField) &&
      cursorMeta &&
      cursorMeta.sortField === sortField &&
      cursorMeta.direction === direction;
    const skip = (safePage - 1) * safePageSize;
    const hasHeavyFilter = Boolean(String(search || "").trim() || Object.keys(filters || {}).length);
    const shouldIncludeTotal =
      String(includeTotal ?? "true").toLowerCase() !== "false" &&
      String(includeTotal ?? "true").toLowerCase() !== "0";
    const pageWhere = isCursorMode ? buildKeysetCursorWhere(where, cursorMeta) : where;
    const orderBy = isCursorMode ? [{ [sortField]: direction }, { id: direction }] : resolvedOrder;

    const items = await prisma.empresa.findMany({
      where: pageWhere,
      select: LIST_SELECT,
      orderBy,
      ...(isCursorMode ? {} : { skip }),
      take: safePageSize,
    });

    let total;
    if (shouldIncludeTotal) {
      if (hasHeavyFilter) {
        total = await prisma.empresa.count({ where });
      } else {
        total = await getEmpresaCount(scope);
      }
    } else {
      const baseTotal = (safePage - 1) * safePageSize;
      total = baseTotal + items.length + (items.length === safePageSize ? 1 : 0);
    }

    return {
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: shouldIncludeTotal
        ? Math.max(1, Math.ceil(total / safePageSize))
        : items.length < safePageSize
          ? safePage
          : safePage + 1,
      nextCursor:
        isCursorMode && items.length === safePageSize
          ? encodeCursor({
              sortField,
              direction,
              value: items[items.length - 1]?.[sortField],
              id: items[items.length - 1]?.id,
            })
          : null,
    };
  },

  async distinctColumnValues({ scope, column, search = "", filters = {}, limit = 5000, optionSearch = "" }) {
    const prisma = getPrismaClient();
    const safeLimit = Math.min(5000, Math.max(1, Number(limit) || 5000));
    const fieldMeta = resolveDistinctField(column);
    if (!fieldMeta) return { items: [] };

    const searchTerm = String(search || "").trim();
    const baseSearchWhere = buildSearchWhere(searchTerm);
    const filtersWhere = buildFiltersWhere(filters);
    const scopedClauses = [];
    if (baseSearchWhere) scopedClauses.push(baseSearchWhere);
    if (filtersWhere) scopedClauses.push(filtersWhere);
    const where = buildCadastroScopeWhere(
      scope,
      scopedClauses.length === 0
        ? {}
        : scopedClauses.length === 1
          ? scopedClauses[0]
          : { AND: scopedClauses }
    );

    if (fieldMeta.type === "custom") {
      const distinctSql = buildCustomDistinctSql(scope, fieldMeta.field, safeLimit, optionSearch);
      if (!distinctSql) return { items: [] };
      const rows = await prisma.$queryRawUnsafe(distinctSql.sql, ...distinctSql.params);
      const items = rows
        .map((row) => String(row.value || "").trim())
        .filter(Boolean);
      return { items: [...new Set(items)] };
    }

    const optionSearchTerm = String(optionSearch || "").trim();
    const optionSearchWhere = optionSearchTerm
      ? (() => {
          const numericFields = new Set(["codempresa", "id_global"]);
          if (numericFields.has(fieldMeta.field)) {
            const asNumber = Number(optionSearchTerm);
            if (!Number.isFinite(asNumber)) {
              return { id: EMPTY_RESULT_COMPANY_ID };
            }
            return { [fieldMeta.field]: Math.floor(asNumber) };
          }
          return {
            [fieldMeta.field]: {
              contains: optionSearchTerm,
              mode: "insensitive",
            },
          };
        })()
      : null;

    const finalWhere = optionSearchWhere
      ? {
          AND: [where, optionSearchWhere],
        }
      : where;

    const rows = await prisma.empresa.findMany({
      where: finalWhere,
      select: { [fieldMeta.field]: true },
      distinct: [fieldMeta.field],
      orderBy: { [fieldMeta.field]: "asc" },
      take: safeLimit,
    });

    const items = rows
      .map((row) => formatDistinctValue(column, row[fieldMeta.field]))
      .filter(Boolean);

    return { items: [...new Set(items)] };
  },

  async getById(id, scope) {
    const prisma = getPrismaClient();
    return prisma.empresa.findFirst({
      where: buildCadastroScopeWhere(scope, { id }),
    });
  },

  async create(data, scope) {
    const prisma = getPrismaClient();
    let created = null;
    let lastError = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        created = await runTransactionWithRetry(
          prisma,
          async (tx) => {
            // Caminho quente: reserva IDs/códigos de forma atômica sem realinhamento prévio.
            // O realinhamento pesado fica no fallback de conflito para reduzir latência.
            const codigo = await reserveNextCodigo(tx, scope.clienteId, ENTITY_CODIGO_EMPRESA);
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
          },
          { attempts: 10, maxWait: 20_000, timeout: 45_000 }
        );
        break;
      } catch (error) {
        lastError = error;
        const isIdGlobalConflict = isIdGlobalUniqueConflict(error);
        const isCodigoConflict = isCodigoUniqueConflict(error);
        if ((!isIdGlobalConflict && !isCodigoConflict) || attempt >= 4) {
          if (isIdGlobalConflict || isCodigoConflict) {
            const conflictError = new Error(
              "Conflito ao gerar sequências internas. Tente novamente em alguns segundos."
            );
            conflictError.statusCode = 409;
            throw conflictError;
          }
          throw error;
        }
        await prisma.$transaction(async (tx) => {
          // Sequências defasadas: realinha e tenta novamente.
          await syncClienteIdGlobalFloor(tx, scope.clienteId);
          await ensureCodigoSequenciaFloor(tx, scope.clienteId, ENTITY_CODIGO_EMPRESA);
        });
      }
    }

    if (!created) {
      throw lastError || new Error("Falha ao criar empresa.");
    }

    await incrementClienteCounter(scope.clienteId, "empresas", 1);
    await bumpNextIdGlobalInCache(scope.clienteId, 1);
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
      select: { id: true, razao_social: true, status: true, codempresa: true },
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
      await runTransactionWithRetry(
        prisma,
        async (tx) => {
          await tx.cadastroRegistro.deleteMany({ where: { empresa_id: current.id } });
          await tx.registroAnexo.deleteMany({ where: { cliente_id: scope.clienteId, empresa_id: current.id } });
          await tx.registroGlobal.deleteMany({
            where: {
              cliente_id: scope.clienteId,
              OR: [
                { entity_name: "Empresa", registro_id: current.id },
                { entity_name: "EmpresaCadastro", registro_id: current.id },
              ],
            },
          });
          await tx.empresa.delete({ where: { id: current.id } });
        },
        { attempts: 10, maxWait: 20_000, timeout: 45_000 }
      );
      await incrementClienteCounter(scope.clienteId, "empresas", -1);
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
      const paginated = await this.listCamposPaginated(scope, { page: 1, pageSize: 200 });
      return toLegacyCampoList(paginated.items);
    }
    return svcCps.listApplicableLegacy(scope, EMPRESAS_ENTITY_NAME);
  },

  async listCamposPaginated(scope, query = {}) {
    const telas = await svcCps.listTelas();
    const telaEmpresas = telas.find((t) => t.entity_name === EMPRESAS_ENTITY_NAME);
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE));
    let filters = {};
    if (query.filters) {
      try {
        filters = typeof query.filters === "string" ? JSON.parse(query.filters) : query.filters;
      } catch {
        filters = {};
      }
    }
    const result = await svcCps.list(scope, {
      page,
      pageSize,
      search: query.search || "",
      sortBy: query.sortBy || "codigo",
      sortDir: query.sortDir || "asc",
      filters,
      ...(telaEmpresas?.id ? { tela_id: telaEmpresas.id } : {}),
    });
    return {
      ...result,
      items: toLegacyCampoList(result.items),
    };
  },
};
