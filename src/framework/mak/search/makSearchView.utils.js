/** Utilitários genéricos de pesquisa/cards — Foundation (sem acoplamento a módulos). */

export const MAK_SEARCH_DROPDOWN_MAX_FIELDS = 5;

export const MAK_CARDS_LAYOUT_DEFAULT = { cardsPerRow: 3 };

export const MAK_CARDS_LAYOUT_OPTIONS = [
  { value: 1, label: "1 card por linha", hint: "Até 5 campos por linha no card" },
  { value: 2, label: "2 cards por linha", hint: "Até 2 campos por linha no card" },
  { value: 3, label: "3 cards por linha", hint: "1 campo por linha no card" },
  { value: 4, label: "4 cards por linha", hint: "1 campo por linha no card" },
];

/** Timing de duplo-clique em cards/linhas (promovido do master Empresas). */
export const ROW_DBLCLICK_OPEN_MS = 260;
export const ROW_DBLCLICK_PAIR_MS = 500;

export const MAK_SEARCH_AVATAR_COLORS = [
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
];

export const normalizeCardsPerRow = (value) => {
  const parsed = Number(value);
  if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4) return parsed;
  return MAK_CARDS_LAYOUT_DEFAULT.cardsPerRow;
};

export const getFieldsPerRowForLayout = (cardsPerRow) => {
  if (cardsPerRow === 1) return 5;
  if (cardsPerRow === 2) return 2;
  return 1;
};

export const countSearchDropdownVisibleFields = (fields = []) =>
  fields.filter((field) => field.visible && !field.primary).length;

export const getDefaultCardVisFields = (catalog = []) => {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];
  return catalog.map((field) => ({
    ...field,
    visible: field.primary ? true : Boolean(field.visible),
  }));
};

export const defaultGetSearchFieldValue = (record, key) => {
  if (!record) return "—";
  const value = record[key];
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
};

export const formatSearchCounter = ({ page, pageSize, pageCount, total }) => {
  if (total <= 0 || pageCount <= 0) return "Exibindo 0 de 0 registros";
  const displayed = Math.min(page * pageSize, (page - 1) * pageSize + pageCount);
  return `Exibindo ${displayed} de ${total} registros`;
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

export const getSearchInitials = (record, titleField = "nome") => {
  const source = String(record?.[titleField] ?? "")
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "");
  const compact = source.replace(/\s+/g, "").toUpperCase();
  if (compact.length >= 3) return compact.substring(0, 3);
  if (compact.length > 0) return compact.padEnd(3, compact.charAt(compact.length - 1));
  return "?";
};

export const getSearchAvatarColor = (record, index = 0, titleField = "nome") => {
  const name = String(record?.[titleField] ?? "").trim();
  const letter = name.match(/[a-zA-ZÀ-ÿ]/)?.[0] || "A";
  const alphabetIndex = normalizeAlphabetIndex(letter);
  if (alphabetIndex !== null) {
    const hue = Math.round((alphabetIndex * 360) / 26);
    return `hsl(${hue}, 62%, 44%)`;
  }
  return MAK_SEARCH_AVATAR_COLORS[index % MAK_SEARCH_AVATAR_COLORS.length];
};

/**
 * Cria resolvedor metadata-driven para exibição de campos em cards/search.
 * @param {{ codeField?: string, titleField?: string, formatFieldValue?: Function }} options
 */
export function createSearchFieldResolver(options = {}) {
  const codeField = options.codeField ?? "codigo";
  const titleField = options.titleField ?? "nome";
  const formatFieldValue = options.formatFieldValue ?? defaultGetSearchFieldValue;

  return {
    codeField,
    titleField,
    getFieldValue: (record, key) => formatFieldValue(record, key),
    getInitials: (record) => getSearchInitials(record, titleField),
    getAvatarColor: (record, index) => getSearchAvatarColor(record, index, titleField),
  };
}

export const loadSearchFavoritesFromAdapter = (adapter, key) => {
  const raw = adapter?.readJson?.(key, []);
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.map((id) => String(id)).filter(Boolean));
};

export const saveSearchFavoritesToAdapter = (adapter, key, favorites, reason = "listagem:favorites") => {
  adapter?.writeJson?.(key, [...favorites].map((id) => String(id)), { reason });
};

export const loadSearchVisFieldsFromAdapter = (adapter, storageKey, catalog = []) => {
  const saved = adapter?.readJson?.(storageKey, null);
  if (!saved || typeof saved !== "object") return catalog.map((field) => ({ ...field }));
  return catalog.map((field) => ({
    ...field,
    visible: saved[field.key] !== undefined ? Boolean(saved[field.key]) : field.visible,
  }));
};

export const saveSearchVisFieldsToAdapter = (adapter, storageKey, fields, reason = "listagem:cards-fields") => {
  const payload = {};
  fields.forEach((field) => {
    payload[field.key] = Boolean(field.visible);
  });
  adapter?.writeJson?.(storageKey, payload, { reason });
};
