import { resolveFieldWidthToken } from "./empFormFieldSizing.js";
import {
  FIELD_WIDTH_TYPE_OPTIONS,
  normalizeFieldWidthTypes,
} from "./empFormFieldWidthPresets.js";

/** @deprecated Layout corporativo não usa grid 12 — apenas compatibilidade SGG. */
export const FIELD_SIZE_COLUMNS = {
  XS: 1,
  SM: 2,
  MD: 3,
  LG: 4,
  XL: 6,
  FULL: 12,
};

/** @deprecated */
export const FIELD_SIZE_OPTIONS = ["XS", "SM", "MD", "LG", "XL", "FULL"];

export { FIELD_WIDTH_TYPE_OPTIONS };

export const CARD_COL_SPAN_OPTIONS = [
  { value: 12, label: "Tela inteira" },
  { value: 6, label: "Meia tela" },
];

const normalizeSizeKey = (value) => String(value || "").trim().toUpperCase();

/** @deprecated */
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
 * @deprecated Use empFormRowBalance + empFormFieldWidthPresets
 */
export function resolveFieldGridSpan(field, fieldSizes = {}) {
  const configured = normalizeSizeKey(fieldSizes?.[field?.id] || field?.fieldSize);
  if (FIELD_SIZE_COLUMNS[configured]) return FIELD_SIZE_COLUMNS[configured];
  return FIELD_SIZE_COLUMNS[inferFieldSizeFromField(field)] || FIELD_SIZE_COLUMNS.LG;
}

/** Aceita tipos de largura ou XS–XL legado → tipos de largura. */
export function normalizeFieldSizes(source = {}) {
  return normalizeFieldWidthTypes(source);
}
