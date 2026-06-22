import { getPrismaClient } from "../../../database/prismaClient.js";
import crypto from "node:crypto";
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
import { tieredCache } from "../../../cache/tieredCache.js";

const EMPRESAS_ENTITY_NAME = "EmpresaCadastro";

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = Math.max(
  1000,
  Number(process.env.EMP_MAX_PAGE_SIZE) || 1000
);
const MAX_EXPORT_ROWS = 100_000;
const DISTINCT_CACHE_TTL_MS = Math.max(
  0,
  Number(process.env.EMP_DISTINCT_CACHE_TTL_MS || 30_000)
);
const DISTINCT_CACHE_PREFIX = "emp:distinct:";
const DISTINCT_DEFAULT_PAGE_SIZE = 100;
const DISTINCT_MAX_PAGE_SIZE = 250;

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

const CURSOR_SORT_FIELDS = new Set(Object.keys(ORDER_BY_MAP));

const encodeCursor = ({ sortField, direction, value, id }) => {
  if (value == null || !id) return null;
  const payload = JSON.stringify({
    s: sortField,
    d: direction,
    v: value instanceof Date ? value.toISOString() : value,
    i: String(id),
  });
  return Buffer.from(payload, "utf8").toString("base64url");
};

const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v == null || !parsed.i || !parsed.s || !parsed.d) return null;
    const sortField = String(parsed.s);
    const value = sortField === "updatedAt" ? new Date(parsed.v) : parsed.v;
    if (sortField === "updatedAt" && Number.isNaN(value.getTime())) return null;
    return {
      sortField,
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
  const { cleanedFilters, customAdvancedFilters } = extractCustomAdvancedFilters(filters);
  const searchTerm = String(search || "").trim();
  const baseSearchWhere = buildSearchWhere(searchTerm);
  const [customFieldIds, numericContainsIds] = searchTerm
    ? await Promise.all([
        findIdsMatchingCustomFields(prisma, scope, searchTerm),
        findIdsMatchingNumericContains(prisma, scope, searchTerm),
      ])
    : [[], []];
  const searchWhere = mergeSearchWhere(baseSearchWhere, [
    ...customFieldIds,
    ...numericContainsIds,
  ]);
  const filtersWhere = buildFiltersWhere(cleanedFilters);
  const customAdvancedIds = await findIdsMatchingCustomAdvancedFilters(prisma, scope, customAdvancedFilters);
  const scopedClauses = [];
  if (searchWhere) scopedClauses.push(searchWhere);
  if (filtersWhere) scopedClauses.push(filtersWhere);
  if (customAdvancedFilters.length > 0) {
    scopedClauses.push({
      id: { in: customAdvancedIds && customAdvancedIds.length > 0 ? customAdvancedIds : [EMPTY_RESULT_COMPANY_ID] },
    });
  }
  return buildCadastroScopeWhere(
    scope,
    scopedClauses.length === 0
      ? {}
      : scopedClauses.length === 1
        ? scopedClauses[0]
        : { AND: scopedClauses }
  );
};

const buildCustomDistinctSql = (scope, fieldName, limit, offset = 0, optionSearch = "") => {
  const safeField = String(fieldName || "").replace(/[^a-zA-Z0-9_]/g, "");
  if (!safeField) return null;
  const params = [scope.clienteId];
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
    const placeholders = allowed.map((_, index) => `$${params.length + index + 1}`).join(", ");
    sql += ` AND id IN (${placeholders})`;
    params.push(...allowed);
  }

  if (scope.selectedEmpresaId) {
    sql += ` AND id = $${params.length + 1}`;
    params.push(scope.selectedEmpresaId);
  }

  sql += ` ORDER BY value ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, Math.max(0, Number(offset) || 0));
  return { sql, params };
};

const buildDistinctScopeHash = (scope) => {
  const payload = JSON.stringify({
    clienteId: scope.clienteId,
    acessoGlobal: Boolean(scope.acessoGlobal),
    selectedEmpresaId: scope.selectedEmpresaId || null,
    allowedEmpresaIds: Array.isArray(scope.allowedEmpresaIds)
      ? [...scope.allowedEmpresaIds].sort()
      : [],
  });
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 24);
};

const buildDistinctCacheKey = ({ scope, column, search, optionSearch, filters, limit, cursor }) => {
  const keyPayload = JSON.stringify({
    column,
    search,
    optionSearch,
    filters: filters || {},
    limit: Number(limit) || DISTINCT_DEFAULT_PAGE_SIZE,
    cursor: cursor || null,
  });
  const digest = crypto.createHash("sha256").update(keyPayload).digest("hex").slice(0, 24);
  return `${DISTINCT_CACHE_PREFIX}${scope.clienteId}:${buildDistinctScopeHash(scope)}:${digest}`;
};

const encodeDistinctCursor = (offset) => {
  const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, Math.floor(Number(offset))) : 0;
  return Buffer.from(String(safeOffset), "utf8").toString("base64url");
};

const decodeDistinctCursor = (cursor) => {
  if (!cursor) return 0;
  try {
    const parsed = Number(Buffer.from(String(cursor), "base64url").toString("utf8"));
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
  } catch {
    return 0;
  }
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
  numero: { field: "numero", match: "contains" },
  inscricao_estadual: { field: "inscricao_estadual", match: "contains" },
  observacoes: { field: "observacoes", match: "contains" },
  logo_url: { field: "logo_url", match: "contains" },
  codempresa: { field: "codempresa", match: "number" },
  id_global: { field: "id_global", match: "number" },
  createdAt: { field: "createdAt", match: "date" },
  updatedAt: { field: "updatedAt", match: "date" },
};

const ADVANCED_FILTER_OPERATORS = new Set([
  "not_equals",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "not_between",
  "equals",
  "before",
  "after",
  "gt",
  "gte",
  "lt",
  "lte",
  "today",
  "yesterday",
  "this_month",
  "last_month",
]);

const parseNumericFilterValue = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return NaN;
  if (text.toLowerCase() === "undefined" || text.toLowerCase() === "null") return NaN;
  const cleaned = text.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") return NaN;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const parseDateFilterValue = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split("/");
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const isoDate = text.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) {
    const [year, month, day] = isoDate.split("-");
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const startOfDay = (dateLike) => {
  const base = new Date(dateLike);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate());
};

const endOfDay = (dateLike) => {
  const base = new Date(dateLike);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
};

const formatDateToken = (dateLike) => {
  const date = new Date(dateLike);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeBetweenValue = (value) => {
  if (value == null) return { from: null, to: null };
  if (Array.isArray(value)) return { from: value[0] ?? null, to: value[1] ?? null };
  if (typeof value === "object") return { from: value.from ?? null, to: value.to ?? null };
  return { from: value, to: null };
};

const parseAdvancedFilterKey = (key) => {
  if (!key || typeof key !== "string") return null;
  const customNumericMarker = "__num_";
  const customDateMarker = "__date_";
  if (key.startsWith("custom:") && key.includes(customNumericMarker)) {
    const markerIndex = key.indexOf(customNumericMarker);
    const fieldName = key.slice("custom:".length, markerIndex).trim();
    const operator = key.slice(markerIndex + customNumericMarker.length).trim();
    if (!fieldName || !ADVANCED_FILTER_OPERATORS.has(operator)) return null;
    return { baseKey: `custom:${fieldName}`, operator, customType: "number" };
  }
  if (key.startsWith("custom:") && key.includes(customDateMarker)) {
    const markerIndex = key.indexOf(customDateMarker);
    const fieldName = key.slice("custom:".length, markerIndex).trim();
    const operator = key.slice(markerIndex + customDateMarker.length).trim();
    if (!fieldName || !ADVANCED_FILTER_OPERATORS.has(operator)) return null;
    return { baseKey: `custom:${fieldName}`, operator, customType: "date" };
  }
  const match = key.match(
    /^(.*)__(not_equals|gt|gte|lt|lte|between|not_between|equals|before|after|today|yesterday|this_month|last_month)$/
  );
  if (!match) return null;
  return { baseKey: match[1], operator: match[2], customType: null };
};

const buildNumberOperatorClause = (field, operator, value) => {
  const numeric = parseNumericFilterValue(value);
  if (!Number.isFinite(numeric)) return null;
  if (operator === "not_equals") {
    return { [field]: { not: numeric } };
  }
  return { [field]: { [operator]: numeric } };
};

const buildNumberBetweenClause = (field, value, invert = false) => {
  const { from, to } = normalizeBetweenValue(value);
  const min = parseNumericFilterValue(from);
  const max = parseNumericFilterValue(to);
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);
  if (!hasMin && !hasMax) return null;

  if (!invert) {
    const clause = {};
    if (hasMin) clause.gte = min;
    if (hasMax) clause.lte = max;
    return { [field]: clause };
  }

  if (hasMin && hasMax) {
    return {
      OR: [
        { [field]: { lt: min } },
        { [field]: { gt: max } },
      ],
    };
  }
  if (hasMin) return { [field]: { lt: min } };
  return { [field]: { gt: max } };
};

const buildDateOperatorClause = (field, operator, value) => {
  const parsed = parseDateFilterValue(value);
  if (!parsed) return null;
  if (operator === "not_equals") {
    return {
      OR: [
        { [field]: { lt: startOfDay(parsed) } },
        { [field]: { gt: endOfDay(parsed) } },
      ],
    };
  }
  if (operator === "equals") {
    return { [field]: { gte: startOfDay(parsed), lte: endOfDay(parsed) } };
  }
  if (operator === "before") {
    return { [field]: { lt: startOfDay(parsed) } };
  }
  if (operator === "after") {
    return { [field]: { gt: endOfDay(parsed) } };
  }
  if (operator === "gt") {
    return { [field]: { gt: endOfDay(parsed) } };
  }
  if (operator === "gte") {
    return { [field]: { gte: startOfDay(parsed) } };
  }
  if (operator === "lt") {
    return { [field]: { lt: startOfDay(parsed) } };
  }
  if (operator === "lte") {
    return { [field]: { lte: endOfDay(parsed) } };
  }
  return null;
};

const buildDatePresetClause = (field, operator) => {
  const now = new Date();
  if (operator === "today") {
    return { [field]: { gte: startOfDay(now), lte: endOfDay(now) } };
  }
  if (operator === "yesterday") {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return { [field]: { gte: startOfDay(date), lte: endOfDay(date) } };
  }
  if (operator === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return { [field]: { gte: start, lte: end } };
  }
  if (operator === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
    return { [field]: { gte: start, lte: end } };
  }
  return null;
};

const buildDateBetweenClause = (field, value, invert = false) => {
  const { from, to } = normalizeBetweenValue(value);
  const start = parseDateFilterValue(from);
  const end = parseDateFilterValue(to);
  if (!start && !end) return null;
  if (invert) {
    if (start && end) {
      return {
        OR: [
          { [field]: { lt: startOfDay(start) } },
          { [field]: { gt: endOfDay(end) } },
        ],
      };
    }
    if (start) return { [field]: { lt: startOfDay(start) } };
    return { [field]: { gt: endOfDay(end) } };
  }
  const clause = {};
  if (start) clause.gte = startOfDay(start);
  if (end) clause.lte = endOfDay(end);
  return { [field]: clause };
};

const FILTER_OBJECT_SELECTION_KEYS = [
  "values",
  "selectedValues",
  "checkedValues",
  "selected",
  "options",
];

const extractOptionScalarValue = (value) => {
  if (value == null) return value;
  if (typeof value !== "object" || Array.isArray(value)) return value;
  const candidates = [
    value.value,
    value.id,
    value.key,
    value.code,
    value.codigo,
    value.label,
    value.nome,
    value.name,
  ];
  for (const candidate of candidates) {
    if (candidate != null && String(candidate).trim() !== "") return candidate;
  }
  return "";
};

const extractFilterObjectSelectionValues = (value) => {
  if (!value || typeof value !== "object") return [];
  for (const key of FILTER_OBJECT_SELECTION_KEYS) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate
        .map((item) => String(extractOptionScalarValue(item) ?? "").trim())
        .filter((item) => item && item !== "undefined" && item !== "null");
    }
    if (candidate && typeof candidate === "object") {
      return Object.entries(candidate)
        .filter(([, checked]) => checked != null && checked !== false)
        .map(([item, checked]) => {
          if (checked === true) return String(item).trim();
          const extracted = extractOptionScalarValue(checked);
          return String(
            extracted == null || String(extracted).trim() === "" ? item : extracted
          ).trim();
        })
        .filter((item) => item && item !== "undefined" && item !== "null");
    }
  }
  if (String(value.operator || "").trim().toLowerCase() === "in") {
    const fallback = String(value.value ?? "").trim();
    if (fallback) {
      return fallback
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter((item) => item && item !== "undefined" && item !== "null");
    }
  }
  return [];
};

const buildNestedOperatorClause = (key, value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const operator = String(value.operator || "").trim().toLowerCase();
  if (!operator) return null;

  if (operator === "in") {
    const selectedValues = extractFilterObjectSelectionValues(value);
    if (selectedValues.length === 0) return null;
    if (key.startsWith("custom:")) {
      return buildCustomFieldFilterClause(key.slice(7), selectedValues);
    }
    const config = FILTER_FIELD_MAP[key];
    if (!config) return null;
    return buildFilterClause(config, selectedValues);
  }

  if (operator === "equals") {
    const scalar = value.value ?? extractFilterObjectSelectionValues(value)[0] ?? null;
    if (scalar == null || scalar === "") return null;
    if (key.startsWith("custom:")) {
      return buildCustomFieldFilterClause(key.slice(7), scalar);
    }
    const config = FILTER_FIELD_MAP[key];
    if (!config) return null;
    return buildFilterClause(config, scalar, "equals");
  }

  return null;
};

const hasNestedOperatorObject = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      String(value.operator || "").trim()
  );

const buildFilterClause = (config, value, operator = "") => {
  if (value == null || value === "") return null;

  const normalizedOperator = String(operator || "").trim();

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => String(extractOptionScalarValue(item) ?? "").trim())
      .filter(Boolean);
    if (normalized.length === 0) return null;
    if (config.match === "number") {
      const numericValues = normalized
        .map((item) => parseNumericFilterValue(item))
        .filter(Number.isFinite)
        .map((item) => Math.floor(item));
      if (numericValues.length === 0) return null;
      return {
        [config.field]: {
          in: [...new Set(numericValues)],
        },
      };
    }
    return {
      [config.field]: {
        in: [...new Set(normalized)],
      },
    };
  }

  if (config.match === "number") {
    if (
      normalizedOperator === "not_equals" ||
      normalizedOperator === "gt" ||
      normalizedOperator === "gte" ||
      normalizedOperator === "lt" ||
      normalizedOperator === "lte"
    ) {
      return buildNumberOperatorClause(config.field, normalizedOperator, value);
    }
    if (normalizedOperator === "between") {
      return buildNumberBetweenClause(config.field, value, false);
    }
    if (normalizedOperator === "not_between") {
      return buildNumberBetweenClause(config.field, value, true);
    }
    const numeric = parseNumericFilterValue(value);
    if (!Number.isFinite(numeric)) return null;
    return { [config.field]: Math.floor(numeric) };
  }

  if (config.match === "date") {
    if (normalizedOperator === "between") {
      return buildDateBetweenClause(config.field, value);
    }
    if (normalizedOperator === "not_between") {
      return buildDateBetweenClause(config.field, value, true);
    }
    if (
      normalizedOperator === "today" ||
      normalizedOperator === "yesterday" ||
      normalizedOperator === "this_month" ||
      normalizedOperator === "last_month"
    ) {
      return buildDatePresetClause(config.field, normalizedOperator);
    }
    if (
      normalizedOperator === "equals" ||
      normalizedOperator === "not_equals" ||
      normalizedOperator === "before" ||
      normalizedOperator === "after" ||
      normalizedOperator === "gt" ||
      normalizedOperator === "gte" ||
      normalizedOperator === "lt" ||
      normalizedOperator === "lte"
    ) {
      return buildDateOperatorClause(config.field, normalizedOperator, value);
    }
    const parsed = parseDateFilterValue(value);
    if (!parsed) return null;
    return { [config.field]: { gte: startOfDay(parsed), lte: endOfDay(parsed) } };
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

const buildScopeSqlClauses = (scope, startingIndex = 2) => {
  const params = [];
  let sql = "";
  let nextIndex = startingIndex;

  if (!scope.acessoGlobal) {
    const allowed = scope.allowedEmpresaIds.length > 0 ? scope.allowedEmpresaIds : [EMPTY_RESULT_COMPANY_ID];
    const placeholders = allowed.map((_, offset) => `$${nextIndex + offset}`).join(", ");
    sql += ` AND id IN (${placeholders})`;
    params.push(...allowed);
    nextIndex += allowed.length;
  }

  if (scope.selectedEmpresaId) {
    sql += ` AND id = $${nextIndex}`;
    params.push(scope.selectedEmpresaId);
    nextIndex += 1;
  }

  return { sql, params };
};

const escapeCustomFieldName = (fieldName) => String(fieldName || "").replace(/[^a-zA-Z0-9_]/g, "");

const buildCustomNumericExpression = (safeField) => `
  CASE
    WHEN REGEXP_REPLACE(TRIM(campos_personalizados->>'${safeField}'), '[^0-9,.-]', '', 'g') ~ '^-?\\d+(\\.\\d+)?$'
    THEN REPLACE(REPLACE(REGEXP_REPLACE(TRIM(campos_personalizados->>'${safeField}'), '[^0-9,.-]', '', 'g'), '.', ''), ',', '.')::numeric
    ELSE NULL
  END
`;

const buildCustomDateExpression = (safeField) => `
  CASE
    WHEN TRIM(campos_personalizados->>'${safeField}') ~ '^\\d{4}-\\d{2}-\\d{2}'
      THEN TO_DATE(SUBSTRING(TRIM(campos_personalizados->>'${safeField}'), 1, 10), 'YYYY-MM-DD')
    WHEN TRIM(campos_personalizados->>'${safeField}') ~ '^\\d{2}/\\d{2}/\\d{4}$'
      THEN TO_DATE(TRIM(campos_personalizados->>'${safeField}'), 'DD/MM/YYYY')
    ELSE NULL
  END
`;

const queryCustomAdvancedFilterIds = async (prisma, scope, filter) => {
  const safeField = escapeCustomFieldName(filter.fieldName);
  if (!safeField) return [];
  const params = [scope.clienteId];
  let sql = `
    SELECT id
    FROM "Empresa"
    WHERE cliente_id = $1
      AND campos_personalizados IS NOT NULL
      AND campos_personalizados ? '${safeField}'
  `;

  const scopeClause = buildScopeSqlClauses(scope, params.length + 1);
  if (scopeClause.sql) {
    sql += scopeClause.sql;
    params.push(...scopeClause.params);
  }

  const isNumeric = filter.customType === "number";
  const expression = isNumeric ? buildCustomNumericExpression(safeField) : buildCustomDateExpression(safeField);
  const appendParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (isNumeric) {
    if (
      filter.operator === "not_equals" ||
      filter.operator === "gt" ||
      filter.operator === "gte" ||
      filter.operator === "lt" ||
      filter.operator === "lte"
    ) {
      const numeric = parseNumericFilterValue(filter.value);
      if (!Number.isFinite(numeric)) return [];
      if (filter.operator === "not_equals") {
        sql += ` AND (${expression}) IS NOT NULL AND (${expression}) <> ${appendParam(numeric)}`;
      } else {
        sql += ` AND (${expression}) IS NOT NULL AND (${expression}) ${filter.operator === "gt" ? ">" : filter.operator === "gte" ? ">=" : filter.operator === "lt" ? "<" : "<="} ${appendParam(numeric)}`;
      }
    } else if (filter.operator === "between" || filter.operator === "not_between") {
      const { from, to } = normalizeBetweenValue(filter.value);
      const min = parseNumericFilterValue(from);
      const max = parseNumericFilterValue(to);
      const hasMin = Number.isFinite(min);
      const hasMax = Number.isFinite(max);
      if (!hasMin && !hasMax) return [];
      if (filter.operator === "between") {
        if (hasMin) sql += ` AND (${expression}) >= ${appendParam(min)}`;
        if (hasMax) sql += ` AND (${expression}) <= ${appendParam(max)}`;
      } else if (hasMin && hasMax) {
        sql += ` AND ((${expression}) < ${appendParam(min)} OR (${expression}) > ${appendParam(max)})`;
      } else if (hasMin) {
        sql += ` AND (${expression}) < ${appendParam(min)}`;
      } else {
        sql += ` AND (${expression}) > ${appendParam(max)}`;
      }
    } else {
      return [];
    }
  } else {
    const now = new Date();
    const startEndForPreset = () => {
      if (filter.operator === "today") return [startOfDay(now), endOfDay(now)];
      if (filter.operator === "yesterday") {
        const date = new Date(now);
        date.setDate(date.getDate() - 1);
        return [startOfDay(date), endOfDay(date)];
      }
      if (filter.operator === "this_month") {
        return [new Date(now.getFullYear(), now.getMonth(), 1), endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0))];
      }
      if (filter.operator === "last_month") {
        return [new Date(now.getFullYear(), now.getMonth() - 1, 1), endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))];
      }
      return null;
    };

    if (filter.operator === "today" || filter.operator === "yesterday" || filter.operator === "this_month" || filter.operator === "last_month") {
      const [start, end] = startEndForPreset();
      sql += ` AND (${expression}) >= ${appendParam(formatDateToken(start))}::date`;
      sql += ` AND (${expression}) <= ${appendParam(formatDateToken(end))}::date`;
    } else if (
      filter.operator === "equals" ||
      filter.operator === "not_equals" ||
      filter.operator === "before" ||
      filter.operator === "after" ||
      filter.operator === "gt" ||
      filter.operator === "gte" ||
      filter.operator === "lt" ||
      filter.operator === "lte"
    ) {
      const parsed = parseDateFilterValue(filter.value);
      if (!parsed) return [];
      if (filter.operator === "equals") {
        sql += ` AND (${expression}) = ${appendParam(formatDateToken(startOfDay(parsed)))}::date`;
      } else if (filter.operator === "not_equals") {
        sql += ` AND (${expression}) <> ${appendParam(formatDateToken(startOfDay(parsed)))}::date`;
      } else if (filter.operator === "before") {
        sql += ` AND (${expression}) < ${appendParam(formatDateToken(startOfDay(parsed)))}::date`;
      } else if (filter.operator === "gt") {
        sql += ` AND (${expression}) > ${appendParam(formatDateToken(endOfDay(parsed)))}::date`;
      } else if (filter.operator === "gte") {
        sql += ` AND (${expression}) >= ${appendParam(formatDateToken(startOfDay(parsed)))}::date`;
      } else if (filter.operator === "lt") {
        sql += ` AND (${expression}) < ${appendParam(formatDateToken(startOfDay(parsed)))}::date`;
      } else if (filter.operator === "lte") {
        sql += ` AND (${expression}) <= ${appendParam(formatDateToken(endOfDay(parsed)))}::date`;
      } else {
        sql += ` AND (${expression}) > ${appendParam(formatDateToken(endOfDay(parsed)))}::date`;
      }
    } else if (filter.operator === "between" || filter.operator === "not_between") {
      const { from, to } = normalizeBetweenValue(filter.value);
      const start = parseDateFilterValue(from);
      const end = parseDateFilterValue(to);
      if (!start && !end) return [];
      const startToken = start ? formatDateToken(startOfDay(start)) : null;
      const endToken = end ? formatDateToken(endOfDay(end)) : null;
      if (filter.operator === "between") {
        if (startToken) sql += ` AND (${expression}) >= ${appendParam(startToken)}::date`;
        if (endToken) sql += ` AND (${expression}) <= ${appendParam(endToken)}::date`;
      } else if (startToken && endToken) {
        sql += ` AND ((${expression}) < ${appendParam(startToken)}::date OR (${expression}) > ${appendParam(endToken)}::date)`;
      } else if (startToken) {
        sql += ` AND (${expression}) < ${appendParam(startToken)}::date`;
      } else if (endToken) {
        sql += ` AND (${expression}) > ${appendParam(endToken)}::date`;
      }
    } else {
      return [];
    }
  }

  const rows = await prisma.$queryRawUnsafe(sql, ...params);
  return rows.map((row) => row.id).filter(Boolean);
};

const extractCustomAdvancedFilters = (filters = {}) => {
  const cleanedFilters = {};
  const customAdvancedFilters = [];

  Object.entries(filters || {}).forEach(([key, value]) => {
    const parsed = parseAdvancedFilterKey(key);
    if (!parsed || !parsed.baseKey.startsWith("custom:") || !parsed.customType) {
      cleanedFilters[key] = value;
      return;
    }
    customAdvancedFilters.push({
      fieldName: parsed.baseKey.slice("custom:".length),
      operator: parsed.operator,
      customType: parsed.customType,
      value,
    });
  });

  return { cleanedFilters, customAdvancedFilters };
};

const findIdsMatchingCustomAdvancedFilters = async (prisma, scope, customFilters = []) => {
  if (!Array.isArray(customFilters) || customFilters.length === 0) return null;
  let intersection = null;

  for (const filter of customFilters) {
    const ids = await queryCustomAdvancedFilterIds(prisma, scope, filter);
    const idSet = new Set(ids);
    if (intersection === null) {
      intersection = idSet;
      continue;
    }
    intersection = new Set([...intersection].filter((id) => idSet.has(id)));
    if (intersection.size === 0) break;
  }

  return intersection ? [...intersection] : null;
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

    const nestedClause = buildNestedOperatorClause(key, value);
    if (nestedClause) {
      and.push(nestedClause);
      return;
    }
    if (hasNestedOperatorObject(value)) return;

    const advanced = parseAdvancedFilterKey(key);
    if (advanced && !advanced.baseKey.startsWith("custom:")) {
      const config = FILTER_FIELD_MAP[advanced.baseKey];
      if (!config) return;
      const clause = buildFilterClause(config, value, advanced.operator);
      if (clause) and.push(clause);
      return;
    }

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

  async distinctColumnValues({
    scope,
    column,
    search = "",
    filters = {},
    limit = DISTINCT_DEFAULT_PAGE_SIZE,
    optionSearch = "",
    cursor = null,
  }) {
    const prisma = getPrismaClient();
    const safeLimit = Math.min(
      DISTINCT_MAX_PAGE_SIZE,
      Math.max(1, Number(limit) || DISTINCT_DEFAULT_PAGE_SIZE)
    );
    const safeOffset = decodeDistinctCursor(cursor);
    const queryTake = safeLimit + 1;
    const cacheKey =
      DISTINCT_CACHE_TTL_MS > 0
        ? buildDistinctCacheKey({
            scope,
            column,
            search,
            optionSearch,
            filters,
            limit: safeLimit,
            cursor: safeOffset,
          })
        : null;
    if (cacheKey) {
      const cached = await tieredCache.get(cacheKey);
      if (cached && Array.isArray(cached.items) && typeof cached.hasMore === "boolean") {
        return cached;
      }
    }
    const fieldMeta = resolveDistinctField(column);
    if (!fieldMeta) return { items: [], nextCursor: null, hasMore: false, total: 0 };

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
      const distinctSql = buildCustomDistinctSql(
        scope,
        fieldMeta.field,
        queryTake,
        safeOffset,
        optionSearch
      );
      if (!distinctSql) return { items: [], nextCursor: null, hasMore: false, total: 0 };
      const rows = await prisma.$queryRawUnsafe(distinctSql.sql, ...distinctSql.params);
      const items = rows
        .map((row) => String(row.value || "").trim())
        .filter(Boolean);
      const uniqueItems = [...new Set(items)];
      const hasMore = uniqueItems.length >= safeLimit;
      const pageItems = uniqueItems.slice(0, safeLimit);
      const payload = {
        items: pageItems,
        nextCursor: hasMore && pageItems.length > 0
          ? encodeDistinctCursor(safeOffset + pageItems.length)
          : null,
        hasMore,
        total: safeOffset + pageItems.length + (hasMore ? 1 : 0),
      };
      if (cacheKey) {
        await tieredCache.set(cacheKey, payload, DISTINCT_CACHE_TTL_MS);
      }
      return payload;
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
      skip: safeOffset,
      take: queryTake,
    });

    const items = rows
      .map((row) => formatDistinctValue(column, row[fieldMeta.field]))
      .filter(Boolean);
    const uniqueItems = [...new Set(items)];
    const hasMore = uniqueItems.length >= safeLimit;
    const pageItems = uniqueItems.slice(0, safeLimit);
    const payload = {
      items: pageItems,
      nextCursor: hasMore && pageItems.length > 0
        ? encodeDistinctCursor(safeOffset + pageItems.length)
        : null,
      hasMore,
      total: safeOffset + pageItems.length + (hasMore ? 1 : 0),
    };
    if (cacheKey) {
      await tieredCache.set(cacheKey, payload, DISTINCT_CACHE_TTL_MS);
    }
    return payload;
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
    await tieredCache.invalidatePrefix(`${DISTINCT_CACHE_PREFIX}${scope.clienteId}:`);
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
    await tieredCache.invalidatePrefix(`${DISTINCT_CACHE_PREFIX}${scope.clienteId}:`);
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
    await tieredCache.invalidatePrefix(`${DISTINCT_CACHE_PREFIX}${scope.clienteId}:`);
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
