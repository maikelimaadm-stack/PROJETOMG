import { formatDateValue } from "./tblEmp.constants";

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

export const loadSearchVisFields = () => {
  try {
    let saved = localStorage.getItem(EMP_SEARCH_VIS_KEY);
    if (!saved) {
      saved = localStorage.getItem(EMP_SEARCH_VIS_KEY_LEGACY);
    }
    if (!saved) return EMP_SEARCH_DEFAULT_FIELDS.map((field) => ({ ...field }));
    const config = normalizeVisConfig(JSON.parse(saved));
    return EMP_SEARCH_DEFAULT_FIELDS.map((field) => ({
      ...field,
      visible: config[field.key] !== undefined ? Boolean(config[field.key]) : field.visible,
    }));
  } catch {
    return EMP_SEARCH_DEFAULT_FIELDS.map((field) => ({ ...field }));
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
  const value = emp[key];
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
};

export const getEmpSearchInitials = (emp) =>
  String(emp?.razao_social || "EMP")
    .trim()
    .substring(0, 3)
    .toUpperCase() || "EMP";

/** Mesma lógica do protótipo: `colors[id % colors.length]`. */
export const getEmpSearchAvatarColor = (emp, index = 0) => {
  const numericSeed = Number(emp?.codempresa);
  if (Number.isFinite(numericSeed) && numericSeed > 0) {
    return EMP_SEARCH_AVATAR_COLORS[numericSeed % EMP_SEARCH_AVATAR_COLORS.length];
  }
  return EMP_SEARCH_AVATAR_COLORS[index % EMP_SEARCH_AVATAR_COLORS.length];
};

export const formatSearchCounter = ({ page, pageSize, pageCount, total }) => {
  if (total <= 0 || pageCount <= 0) return "Exibindo 0 de 0 registros";
  const displayed = Math.min(page * pageSize, (page - 1) * pageSize + pageCount);
  return `Exibindo ${displayed} de ${total} registros`;
};
