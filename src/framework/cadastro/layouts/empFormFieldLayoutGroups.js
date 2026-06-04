/**
 * Utilitários de layout — sem classificação automática compacto/expansivo.
 * @module empFormFieldLayoutGroups
 */

const IMAGE_TYPES = new Set(["image", "imagem"]);
const FILE_TYPES = new Set(["file", "attachment", "attachments", "document", "documents"]);

/**
 * Imagem/anexo na mesma altura visual dos demais controles.
 * @param {object} field
 */
export function isInlineMediaField(field) {
  const type = String(field?.type || "").toLowerCase();
  return IMAGE_TYPES.has(type) || FILE_TYPES.has(type);
}

/** @deprecated Sempre falso — o motor não força linha exclusiva. */
export function isExpansiveLayoutField() {
  return false;
}

/** @deprecated */
export const isLineFillLayoutField = isExpansiveLayoutField;

/** @deprecated Todos os campos participam da mesma distribuição. */
export function isCompactLayoutField() {
  return true;
}
