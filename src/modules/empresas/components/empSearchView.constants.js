import { formatDateValue } from "./tblEmp.constants";
import { COLUNAS_BASE } from "./tblEmp.constants";
import campoEngine from "@/framework/cadastro/fields/campoEngine";

/** Compatível com protótipo HTML (`erp_vis_config`). */
export const EMP_SEARCH_VIS_KEY = "erp_vis_config";
export const EMP_SEARCH_VIS_KEY_LEGACY = "emp_search_vis_config";
export const EMP_SEARCH_FAV_KEY = "emp_search_favorites";

export const EMP_SEARCH_AVATAR_COLORS = [
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
];

/** Mapeamento chaves protótipo → campos Empresa. */
export const EMP_SEARCH_FIELD_ALIASES = {
  codigo: "codempresa",
  nome: "razao_social",
  fantasia: "nome_fantasia",
  cnpj: "cpf_cnpj",
  uf: "estado",
  dataCadastro: "createdAt",
};

export const EMP_CARD_PRIMARY_KEYS = new Set(["codempresa", "razao_social"]);

const CARD_CATALOG_SKIP = new Set(["id_global", "logo_url"]);
export const EMP_CARD_BODY_SKIP = new Set(["logo_url"]);
/** Campos renderizados fora do corpo (cabeçalho ou pill de status). */
export const EMP_CARD_DETAIL_SKIP = new Set(["logo_url", "status"]);

/** Catálogo completo de campos do lançamento para cards (base + personalizados). */
export const buildEmpCardFieldCatalog = (customFields = []) => {
  const normalizedCustom = customFields
    .map((campo) => campoEngine.normalize(campo))
    .filter((campo) => campo?.ativo !== false)
    .map((campo) => ({
      key: `custom:${campo.field_name}`,
      label: campo.label || campo.field_name,
      visible: false,
      primary: false,
      customField: campo.field_name,
    }));

  const fromColumns = COLUNAS_BASE.filter((col) => !CARD_CATALOG_SKIP.has(col.id)).map((col) => {
    const existing = EMP_SEARCH_DEFAULT_FIELDS.find((field) => field.key === col.id);
    return {
      key: col.id,
      label: col.label,
      visible: existing?.visible ?? false,
      primary: EMP_CARD_PRIMARY_KEYS.has(col.id),
    };
  });

  const merged = new Map();
  [...fromColumns, ...normalizedCustom].forEach((field) => {
    if (!merged.has(field.key)) merged.set(field.key, field);
  });

  EMP_SEARCH_DEFAULT_FIELDS.forEach((field) => {
    if (!merged.has(field.key)) {
      merged.set(field.key, {
        ...field,
        primary: EMP_CARD_PRIMARY_KEYS.has(field.key),
      });
    }
  });

  return [...merged.values()];
};

/** Visibilidade padrão dos campos nos cards (catálogo completo). */
export const getDefaultCardVisFields = (catalog = EMP_SEARCH_DEFAULT_FIELDS) => {
  const defaultsMap = new Map(EMP_SEARCH_DEFAULT_FIELDS.map((field) => [field.key, field.visible]));
  return catalog.map((field) => ({
    ...field,
    visible: field.primary ? true : defaultsMap.get(field.key) ?? field.visible ?? false,
  }));
};

/** Catálogo de cards a partir das colunas em uso na tabela (sem código/nome fixos). */
export const buildCardCatalogFromColumnsInUse = (columnsInUse = []) => {
  return columnsInUse
    .filter(
      (col) =>
        !EMP_CARD_BODY_SKIP.has(col.id) && !EMP_CARD_PRIMARY_KEYS.has(col.id)
    )
    .map((col) => {
      const existing = EMP_SEARCH_DEFAULT_FIELDS.find((field) => field.key === col.id);
      return {
        key: col.id,
        label: col.label,
        visible: existing?.visible ?? col.default ?? false,
        primary: EMP_CARD_PRIMARY_KEYS.has(col.id),
        customField: col.customField,
      };
    });
};

export const sortCardConfigFieldsAlphabetically = (fields = []) =>
  [...fields].sort((a, b) =>
    String(a.label || "").localeCompare(String(b.label || ""), "pt-BR", { sensitivity: "base" })
  );

/** Campos visíveis no corpo do card, na ordem das colunas em uso. */
export const buildCardDetailFieldsFromColumns = (columnsInUse = [], visFields = []) => {
  const visibleMap = new Map(
    visFields.filter((field) => field.visible && !field.primary).map((field) => [field.key, field])
  );

  return columnsInUse
    .filter(
      (col) =>
        !EMP_CARD_PRIMARY_KEYS.has(col.id) &&
        !EMP_CARD_BODY_SKIP.has(col.id) &&
        !EMP_CARD_DETAIL_SKIP.has(col.id)
    )
    .map((col) => visibleMap.get(col.id))
    .filter(Boolean);
};

export const mergeSearchVisFields = (catalog = [], saved = []) => {
  const savedMap = new Map(saved.map((field) => [field.key, field]));
  return catalog.map((field) => {
    const persisted = savedMap.get(field.key);
    if (!persisted) return { ...field };
    return {
      ...field,
      visible: persisted.visible,
      primary: field.primary,
    };
  });
};

export const EMP_SEARCH_DEFAULT_FIELDS = [
  { key: "codempresa", label: "Código", visible: true, primary: true },
  { key: "razao_social", label: "Razão Social", visible: true, primary: true },
  { key: "nome_fantasia", label: "Nome Fantasia", visible: true },
  { key: "cpf_cnpj", label: "CPF/CNPJ", visible: true },
  { key: "telefone", label: "Telefone", visible: true },
  { key: "whatsapp", label: "WhatsApp", visible: false },
  { key: "email", label: "E-mail", visible: false },
  { key: "cidade", label: "Cidade", visible: true },
  { key: "estado", label: "Estado", visible: true },
  { key: "status", label: "Status", visible: false },
  { key: "createdAt", label: "Data Cadastro", visible: false },
];

const normalizeVisConfig = (raw = {}) => {
  const normalized = {};
  Object.entries(raw).forEach(([key, value]) => {
    const mapped = EMP_SEARCH_FIELD_ALIASES[key] || key;
    normalized[mapped] = value;
  });
  return normalized;
};

export const loadSearchVisFields = (catalog = EMP_SEARCH_DEFAULT_FIELDS) => {
  try {
    let saved = localStorage.getItem(EMP_SEARCH_VIS_KEY);
    if (!saved) {
      saved = localStorage.getItem(EMP_SEARCH_VIS_KEY_LEGACY);
    }
    if (!saved) return catalog.map((field) => ({ ...field }));
    const config = normalizeVisConfig(JSON.parse(saved));
    return catalog.map((field) => ({
      ...field,
      visible: config[field.key] !== undefined ? Boolean(config[field.key]) : field.visible,
    }));
  } catch {
    return catalog.map((field) => ({ ...field }));
  }
};

const REVERSE_FIELD_ALIASES = Object.fromEntries(
  Object.entries(EMP_SEARCH_FIELD_ALIASES).map(([prototypeKey, modelKey]) => [modelKey, prototypeKey])
);

export const saveSearchVisFields = (fields) => {
  const obj = {};
  fields.forEach((field) => {
    const storageKey = REVERSE_FIELD_ALIASES[field.key] || field.key;
    obj[storageKey] = field.visible;
  });
  localStorage.setItem(EMP_SEARCH_VIS_KEY, JSON.stringify(obj));
};

export const loadSearchFavorites = () => {
  try {
    const saved = localStorage.getItem(EMP_SEARCH_FAV_KEY);
    if (!saved) return new Set();
    const ids = JSON.parse(saved);
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
};

export const saveSearchFavorites = (favorites) => {
  localStorage.setItem(EMP_SEARCH_FAV_KEY, JSON.stringify([...favorites]));
};

export const formatEmpSearchCode = (codempresa) => {
  const value = Number(codempresa);
  if (!Number.isFinite(value)) return String(codempresa || "—");
  return String(value).padStart(6, "0");
};

export const getEmpSearchFieldValue = (emp, key) => {
  if (!emp) return "—";
  if (key === "codempresa") return formatEmpSearchCode(emp.codempresa);
  if (key === "createdAt") return formatDateValue(emp.createdAt);
  if (key === "tipo_vinculo") {
    if (emp.tipo_vinculo === "proprietario") return "PROPRIETÁRIO";
    if (emp.tipo_vinculo === "arrendatario") return "ARRENDATÁRIO";
    return "—";
  }
  if (key.startsWith("custom:")) {
    const fieldName = key.replace("custom:", "");
    const col = { id: key, field_name: fieldName, customField: fieldName };
    const value = campoEngine.getValorCampo(emp, col, {});
    if (value === undefined || value === null || value === "") return "—";
    return String(value);
  }
  const value = emp[key];
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
};

export const getEmpSearchInitials = (emp) => {
  const source = String(emp?.razao_social || emp?.nome_fantasia || "")
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "");
  const compact = source.replace(/\s+/g, "").toUpperCase();
  if (compact.length >= 3) return compact.substring(0, 3);
  if (compact.length > 0) return compact.padEnd(3, compact.charAt(compact.length - 1));
  return "EMP";
};

const normalizeAlphabetIndex = (letter) => {
  const normalized = letter
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  const code = normalized.charCodeAt(0) - 65;
  if (code >= 0 && code <= 25) return code;
  return null;
};

/** Cor do avatar variando pela primeira letra do nome (A–Z). */
export const getEmpSearchAvatarColor = (emp, index = 0) => {
  const name = String(emp?.razao_social || emp?.nome_fantasia || "").trim();
  const letter = name.match(/[a-zA-ZÀ-ÿ]/)?.[0] || "A";
  const alphabetIndex = normalizeAlphabetIndex(letter);
  if (alphabetIndex !== null) {
    const hue = Math.round((alphabetIndex * 360) / 26);
    return `hsl(${hue}, 62%, 44%)`;
  }
  return EMP_SEARCH_AVATAR_COLORS[index % EMP_SEARCH_AVATAR_COLORS.length];
};

export const formatSearchCounter = ({ page, pageSize, pageCount, total }) => {
  if (total <= 0 || pageCount <= 0) return "Exibindo 0 de 0 registros";
  const displayed = Math.min(page * pageSize, (page - 1) * pageSize + pageCount);
  return `Exibindo ${displayed} de ${total} registros`;
};
