/**
 * Grupos de layout corporativo — somente tipo/flags do campo (sem nomes).
 * @module empFormFieldLayoutGroups
 */

import {
  resolveFieldWidthTypePreset,
  resolveStoredWidthType,
} from "./empFormFieldWidthPresets.js";

const EXPANSIVE_FIELD_TYPES = new Set([
  "textarea",
  "html",
  "richtext",
  "rich_text",
  "memo",
  "markdown",
]);

const IMAGE_TYPES = new Set(["image", "imagem"]);
const FILE_TYPES = new Set(["file", "attachment", "attachments", "document", "documents"]);

/**
 * Grupo expansível — linha exclusiva, 100% largura.
 * Imagem/anexo só entram aqui com layoutExpand ou tipo IMAGE_EXPAND / ATTACHMENT_EXPAND.
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function isExpansiveLayoutField(field, fieldWidthTypes = {}) {
  if (!field) return false;

  if (field.layoutExpand === true || field.expandLayout === true) return true;

  const stored = resolveStoredWidthType(field, fieldWidthTypes);
  if (stored === "IMAGE_EXPAND" || stored === "ATTACHMENT_EXPAND") return true;

  const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
  if (preset.layoutGroup === "expansive" || preset.fullRow) return true;

  const type = String(field.type || "").toLowerCase();
  if (EXPANSIVE_FIELD_TYPES.has(type)) return true;

  return false;
}

/** @alias */
export const isLineFillLayoutField = isExpansiveLayoutField;

/**
 * Grupo compacto — distribuição automática na linha (máx. 6 ou 4).
 */
export function isCompactLayoutField(field, fieldWidthTypes = {}) {
  return !isExpansiveLayoutField(field, fieldWidthTypes);
}

/**
 * Imagem/anexo no modo compacto (alinhado aos demais controles).
 */
export function isInlineMediaField(field, fieldWidthTypes = {}) {
  const type = String(field?.type || "").toLowerCase();
  if (!IMAGE_TYPES.has(type) && !FILE_TYPES.has(type)) return false;
  return isCompactLayoutField(field, fieldWidthTypes);
}
