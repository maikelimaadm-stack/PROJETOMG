import { resolveFieldWidthToken } from "./empFormFieldSizing.js";

/** Colunas ocupadas no grid de 12 (layout corporativo). */
export const FIELD_SIZE_COLUMNS = {
  XS: 1,
  SM: 2,
  MD: 3,
  LG: 4,
  XL: 6,
  FULL: 12,
};

export const FIELD_SIZE_OPTIONS = ["XS", "SM", "MD", "LG", "XL", "FULL"];

export const CARD_COL_SPAN_OPTIONS = [
  { value: 12, label: "Tela inteira" },
  { value: 6, label: "Meia tela" },
];

const normalizeSizeKey = (value) => String(value || "").trim().toUpperCase();

/** Heurística padrão quando não há fieldSize persistido. */
export function inferFieldSizeFromField(field) {
  const token = resolveFieldWidthToken(field);
  if (token === "full") return "FULL";
  if (token === "xs" || token === "toggle") return "XS";
  if (token === "sm" || token === "sm-date") return "SM";
  if (token === "md" || token === "lookup") return "MD";
  if (token === "lg") return "LG";
  if (token === "xl") return "XL";
  return "LG";
}

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldSizes]
 */
export function resolveFieldGridSpan(field, fieldSizes = {}) {
  const configured = normalizeSizeKey(fieldSizes?.[field?.id] || field?.fieldSize);
  if (FIELD_SIZE_COLUMNS[configured]) return FIELD_SIZE_COLUMNS[configured];
  return FIELD_SIZE_COLUMNS[inferFieldSizeFromField(field)] || FIELD_SIZE_COLUMNS.LG;
}

export function normalizeFieldSizes(source = {}) {
  const next = {};
  Object.entries(source || {}).forEach(([fieldId, size]) => {
    const key = normalizeSizeKey(size);
    if (FIELD_SIZE_COLUMNS[key]) next[fieldId] = key;
  });
  return next;
}
