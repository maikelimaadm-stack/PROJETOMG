/**
 * Grupos de layout corporativo — apenas por tipo/flags do campo (sem nomes).
 * Grupo 1 (compacto): não ficam sozinhos na linha quando há espaço.
 * Grupo 2 (linha cheia): podem ocupar a linha inteira sozinhos.
 * @module empFormFieldLayoutGroups
 */

import { resolveFieldWidthTypePreset } from "./empFormFieldWidthPresets.js";

/** Grade lógica do card (12 colunas = 100% da largura útil). */
export const ROW_GRID_COLUMNS = 12;

/** Tipos de largura que ocupam linha inteira por natureza. */
const LINE_FILL_WIDTH_TYPES = new Set(["MULTILINE", "LONG_TEXT", "IMAGE", "ATTACHMENT"]);

/** Tipos de campo (field.type) do Grupo 2 — expansíveis / linha cheia. */
const LINE_FILL_FIELD_TYPES = new Set([
  "textarea",
  "html",
  "richtext",
  "rich_text",
  "memo",
  "markdown",
  "image",
  "imagem",
  "file",
  "gallery",
  "galeria",
  "attachment",
  "attachments",
  "signature",
  "assinatura",
  "document",
  "documents",
]);

/** Pesos mínimos em colunas (1–12) para empacotamento e redistribuição. */
export const COLUMN_WEIGHT_BY_WIDTH_TYPE = {
  SHORT_TEXT: 2,
  NUMBER: 2,
  DATE: 2,
  DATETIME: 3,
  SELECT: 2,
  LOOKUP: 4,
  MEDIUM_TEXT: 4,
  LONG_TEXT: 6,
  IMAGE: 12,
  ATTACHMENT: 12,
  MULTILINE: 12,
};

/**
 * Grupo 2 — pode ficar sozinho na linha e preencher 100% do card.
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function isLineFillLayoutField(field, fieldWidthTypes = {}) {
  if (!field) return false;

  const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
  if (preset.fullRow || LINE_FILL_WIDTH_TYPES.has(preset.type)) return true;

  const type = String(field.type || "").toLowerCase();
  if (LINE_FILL_FIELD_TYPES.has(type)) return true;

  return false;
}

/**
 * Grupo 1 — compactos; o motor tenta preencher a linha (máx. 6 campos).
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function isCompactLayoutField(field, fieldWidthTypes = {}) {
  return !isLineFillLayoutField(field, fieldWidthTypes);
}

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function getFieldColumnWeight(field, fieldWidthTypes = {}) {
  const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
  const weight = COLUMN_WEIGHT_BY_WIDTH_TYPE[preset.type];
  if (Number.isFinite(weight) && weight > 0) return weight;
  return COLUMN_WEIGHT_BY_WIDTH_TYPE.SHORT_TEXT;
}

/**
 * Orçamento de colunas da linha conforme colSpan do card.
 * @param {number} colSpan
 */
export function getRowColumnBudget(colSpan = 12) {
  const span = Math.max(1, Math.min(ROW_GRID_COLUMNS, Number(colSpan) || ROW_GRID_COLUMNS));
  return span;
}
