/**
 * Larguras corporativas por TIPO DE CAMPO (min-width + flex).
 * Sem XS/SM/MD/LG/XL no layout — apenas categorias compacto/expansível.
 * @module empFormFieldWidthPresets
 */

/** @typedef {'SHORT_TEXT'|'NUMBER'|'DATE'|'DATETIME'|'TIME'|'SELECT'|'LOOKUP'|'PHONE'|'EMAIL'|'MEDIUM_TEXT'|'LONG_TEXT'|'IMAGE'|'ATTACHMENT'|'MULTILINE'} FieldWidthType */

/**
 * @typedef {Object} FieldWidthTypePreset
 * @property {number} [min]
 * @property {boolean} [fullRow]
 * @property {'compact'|'expansive'} [layoutGroup]
 * @property {number} [textareaMinHeight]
 * @property {number} [textareaMaxHeight]
 */

/** @type {Record<string, FieldWidthTypePreset>} */
export const FIELD_WIDTH_TYPE_PRESETS = {
  SHORT_TEXT: { min: 140, layoutGroup: "compact" },
  NUMBER: { min: 120, layoutGroup: "compact" },
  DATE: { min: 140, layoutGroup: "compact" },
  DATETIME: { min: 180, layoutGroup: "compact" },
  TIME: { min: 140, layoutGroup: "compact" },
  SELECT: { min: 180, layoutGroup: "compact" },
  LOOKUP: { min: 220, layoutGroup: "compact" },
  PHONE: { min: 160, layoutGroup: "compact" },
  EMAIL: { min: 240, layoutGroup: "compact" },
  MEDIUM_TEXT: { min: 260, layoutGroup: "compact" },
  LONG_TEXT: { min: 0, layoutGroup: "expansive", fullRow: true },
  MULTILINE: {
    min: 0,
    layoutGroup: "expansive",
    fullRow: true,
    textareaMinHeight: 80,
    textareaMaxHeight: 200,
  },
  IMAGE: { min: 140, layoutGroup: "compact" },
  ATTACHMENT: { min: 140, layoutGroup: "compact" },
  IMAGE_EXPAND: { min: 0, layoutGroup: "expansive", fullRow: true },
  ATTACHMENT_EXPAND: { min: 0, layoutGroup: "expansive", fullRow: true },
};

export const FIELD_WIDTH_TYPE_OPTIONS = [
  { value: "SHORT_TEXT", label: "Texto curto" },
  { value: "NUMBER", label: "Número" },
  { value: "DATE", label: "Data" },
  { value: "DATETIME", label: "Data e hora" },
  { value: "TIME", label: "Hora" },
  { value: "SELECT", label: "Seleção" },
  { value: "LOOKUP", label: "Lookup / pesquisa" },
  { value: "PHONE", label: "Telefone" },
  { value: "EMAIL", label: "E-mail" },
  { value: "MEDIUM_TEXT", label: "Texto médio" },
  { value: "LONG_TEXT", label: "Texto longo (linha exclusiva)" },
  { value: "IMAGE", label: "Imagem (compacta)" },
  { value: "IMAGE_EXPAND", label: "Imagem (expandir)" },
  { value: "ATTACHMENT", label: "Anexo (compacto)" },
  { value: "ATTACHMENT_EXPAND", label: "Anexo (expandir)" },
  { value: "MULTILINE", label: "Observação / multilinha" },
];

/** @deprecated XS–XL → tipo de largura (compatibilidade persistência) */
const LEGACY_SIZE_TO_WIDTH_TYPE = {
  XS: "SHORT_TEXT",
  SM: "SHORT_TEXT",
  MD: "MEDIUM_TEXT",
  LG: "MEDIUM_TEXT",
  XL: "LONG_TEXT",
  FULL: "MULTILINE",
};

const LOOKUP_TYPES = new Set(["autocomplete", "relation"]);
const SELECT_TYPES = new Set(["select"]);
const DATE_TYPES = new Set(["date"]);
const DATETIME_TYPES = new Set(["datetime", "datetime-local"]);
const TIME_TYPES = new Set(["time"]);
const NUMBER_TYPES = new Set(["number", "decimal", "moeda", "percentual", "integer", "calculado"]);
const MULTILINE_TYPES = new Set(["textarea"]);
const MULTISELECT_TYPES = new Set(["option_list", "multiselect", "multi_select"]);
const IMAGE_TYPES = new Set(["image", "imagem"]);
const ATTACHMENT_TYPES = new Set(["file"]);
const PHONE_TYPES = new Set(["tel", "phone", "telefone", "whatsapp", "mobile", "celular"]);
const EMAIL_TYPES = new Set(["email", "e-mail", "mail"]);

export const isTextareaField = (field) => {
  const type = String(field?.type || "").toLowerCase();
  return MULTILINE_TYPES.has(type);
};

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function resolveStoredWidthType(field, fieldWidthTypes = {}) {
  const raw = String(fieldWidthTypes?.[field?.id] || field?.widthType || field?.fieldWidthType || "")
    .trim()
    .toUpperCase();
  if (!raw) return null;
  if (FIELD_WIDTH_TYPE_PRESETS[raw]) return raw;
  if (LEGACY_SIZE_TO_WIDTH_TYPE[raw]) return LEGACY_SIZE_TO_WIDTH_TYPE[raw];
  return null;
}

/**
 * @param {object} field
 * @returns {FieldWidthType}
 */
export function inferFieldWidthType(field) {
  if (!field) return "SHORT_TEXT";

  const type = String(field.type || "text").toLowerCase();

  if (field.layoutExpand === true || field.expandLayout === true) {
    if (IMAGE_TYPES.has(type)) return "IMAGE_EXPAND";
    if (ATTACHMENT_TYPES.has(type)) return "ATTACHMENT_EXPAND";
  }

  if (MULTILINE_TYPES.has(type)) return "MULTILINE";
  if (MULTISELECT_TYPES.has(type)) return "SELECT";
  if (IMAGE_TYPES.has(type)) return "IMAGE";
  if (ATTACHMENT_TYPES.has(type)) return "ATTACHMENT";
  if (NUMBER_TYPES.has(type)) return "NUMBER";
  if (DATETIME_TYPES.has(type)) return "DATETIME";
  if (DATE_TYPES.has(type)) return "DATE";
  if (TIME_TYPES.has(type)) return "TIME";
  if (EMAIL_TYPES.has(type)) return "EMAIL";
  if (PHONE_TYPES.has(type)) return "PHONE";
  if (SELECT_TYPES.has(type)) return "SELECT";
  if (LOOKUP_TYPES.has(type) || field.lookup === true) return "LOOKUP";
  if (type === "checkbox" || type === "switch") return "SHORT_TEXT";

  if (field.wide) return "LONG_TEXT";
  if (field.medium) return "MEDIUM_TEXT";
  if (field.compact) return "SHORT_TEXT";

  return "SHORT_TEXT";
}

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function resolveFieldWidthTypePreset(field, fieldWidthTypes = {}) {
  const stored = resolveStoredWidthType(field, fieldWidthTypes);
  const typeKey = stored || inferFieldWidthType(field);
  const preset = FIELD_WIDTH_TYPE_PRESETS[typeKey] || FIELD_WIDTH_TYPE_PRESETS.SHORT_TEXT;

  return {
    type: /** @type {FieldWidthType} */ (typeKey),
    ...preset,
  };
}

/** Máximo de campos compactos por linha. */
export function getMaxFieldsPerRow(colSpan = 12) {
  const span = Number(colSpan) || 12;
  if (span >= 12) return 6;
  if (span >= 6) return 4;
  return 2;
}

/**
 * Normaliza fieldSizes: aceita tipos de largura ou XS–XL legado.
 * @param {Record<string, string>} source
 */
export function normalizeFieldWidthTypes(source = {}) {
  const next = {};
  Object.entries(source || {}).forEach(([fieldId, value]) => {
    const fakeField = { id: fieldId, widthType: value };
    const resolved = resolveStoredWidthType(fakeField, { [fieldId]: value });
    if (resolved) next[fieldId] = resolved;
  });
  return next;
}

/** @deprecated Use resolveFieldWidthTypePreset */
export function resolveFieldWidthPreset(field, fieldSizes = {}) {
  const preset = resolveFieldWidthTypePreset(field, fieldSizes);
  return {
    key: preset.type,
    min: preset.min,
    ideal: preset.min,
    max: Number.MAX_SAFE_INTEGER,
    fullRow: preset.fullRow,
    layoutGroup: preset.layoutGroup,
  };
}

/** @deprecated */
export function getFieldPackWidth(field, fieldSizes = {}) {
  const preset = resolveFieldWidthTypePreset(field, fieldSizes);
  if (preset.fullRow) return 9999;
  return preset.min || 140;
}
