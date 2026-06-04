/**
 * Larguras corporativas por TIPO DE CAMPO (min-width + flex-grow).
 * Sem regras por nome de campo (CPF, CEP, etc.).
 * @module empFormFieldWidthPresets
 */

/** @typedef {'SHORT_TEXT'|'NUMBER'|'DATE'|'DATETIME'|'SELECT'|'LOOKUP'|'MEDIUM_TEXT'|'LONG_TEXT'|'IMAGE'|'ATTACHMENT'|'MULTILINE'} FieldWidthType */

/**
 * @typedef {Object} FieldWidthTypePreset
 * @property {number} [min] — px; MULTILINE usa 100%
 * @property {number} [flexGrow]
 * @property {number} [flexBasis]
 * @property {boolean} [fullRow]
 * @property {number} [textareaMinHeight]
 * @property {number} [textareaMaxHeight]
 */

/** @type {Record<FieldWidthType, FieldWidthTypePreset>} */
export const FIELD_WIDTH_TYPE_PRESETS = {
  SHORT_TEXT: { min: 140, flexGrow: 1, flexBasis: 0 },
  NUMBER: { min: 140, flexGrow: 1, flexBasis: 0 },
  DATE: { min: 150, flexGrow: 1, flexBasis: 0 },
  DATETIME: { min: 190, flexGrow: 1, flexBasis: 0 },
  SELECT: { min: 180, flexGrow: 1, flexBasis: 0 },
  LOOKUP: { min: 280, flexGrow: 1, flexBasis: 0 },
  MEDIUM_TEXT: { min: 280, flexGrow: 1, flexBasis: 0 },
  LONG_TEXT: { min: 420, flexGrow: 1, flexBasis: 0 },
  IMAGE: { min: 220, flexGrow: 1, flexBasis: 0 },
  ATTACHMENT: { min: 320, flexGrow: 1, flexBasis: 0 },
  MULTILINE: {
    min: 0,
    flexGrow: 1,
    flexBasis: "100%",
    fullRow: true,
    textareaMinHeight: 80,
    textareaMaxHeight: 200,
  },
};

export const FIELD_WIDTH_TYPE_OPTIONS = [
  { value: "SHORT_TEXT", label: "Texto curto" },
  { value: "NUMBER", label: "Número" },
  { value: "DATE", label: "Data" },
  { value: "DATETIME", label: "Data e hora" },
  { value: "SELECT", label: "Seleção" },
  { value: "LOOKUP", label: "Lookup / pesquisa" },
  { value: "MEDIUM_TEXT", label: "Texto médio" },
  { value: "LONG_TEXT", label: "Texto longo" },
  { value: "IMAGE", label: "Imagem" },
  { value: "ATTACHMENT", label: "Anexos" },
  { value: "MULTILINE", label: "Texto multilinha" },
];

const LOOKUP_TYPES = new Set(["autocomplete", "relation"]);
const SELECT_TYPES = new Set(["select"]);
const DATE_TYPES = new Set(["date"]);
const DATETIME_TYPES = new Set(["datetime", "datetime-local"]);
const NUMBER_TYPES = new Set(["number", "decimal", "moeda", "percentual", "integer"]);
const MULTILINE_TYPES = new Set(["textarea", "option_list"]);
const IMAGE_TYPES = new Set(["image", "imagem"]);
const ATTACHMENT_TYPES = new Set(["file"]);

export const isTextareaField = (field) => {
  const type = String(field?.type || "").toLowerCase();
  return MULTILINE_TYPES.has(type);
};

/**
 * Inferência apenas por tipo e flags do campo (compact / medium / wide / widthType).
 * @param {object} field
 * @returns {FieldWidthType}
 */
export function inferFieldWidthType(field) {
  if (!field) return "SHORT_TEXT";

  const override = String(field.widthType || "").trim().toUpperCase();
  if (override && FIELD_WIDTH_TYPE_PRESETS[override]) return /** @type {FieldWidthType} */ (override);

  const type = String(field.type || "text").toLowerCase();

  if (MULTILINE_TYPES.has(type)) return "MULTILINE";
  if (IMAGE_TYPES.has(type)) return "IMAGE";
  if (ATTACHMENT_TYPES.has(type)) return "ATTACHMENT";
  if (NUMBER_TYPES.has(type)) return "NUMBER";
  if (DATETIME_TYPES.has(type)) return "DATETIME";
  if (DATE_TYPES.has(type)) return "DATE";
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
 * @param {Record<string, string>} [fieldWidthTypes] — override por id (ex-fieldSizes)
 */
export function resolveFieldWidthTypePreset(field, fieldWidthTypes = {}) {
  const stored = String(fieldWidthTypes?.[field?.id] || field?.fieldWidthType || "")
    .trim()
    .toUpperCase();

  const typeKey = stored && FIELD_WIDTH_TYPE_PRESETS[stored] ? stored : inferFieldWidthType(field);
  const preset = FIELD_WIDTH_TYPE_PRESETS[typeKey] || FIELD_WIDTH_TYPE_PRESETS.SHORT_TEXT;

  return {
    type: /** @type {FieldWidthType} */ (typeKey),
    ...preset,
  };
}

/** Máximo de campos por linha conforme largura do card (colSpan). */
export function getMaxFieldsPerRow(colSpan = 12) {
  const span = Number(colSpan) || 12;
  if (span >= 12) return 6;
  if (span >= 6) return 3;
  return 2;
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
  };
}

/** @deprecated Empacotamento por contagem apenas — não usa largura acumulada */
export function getFieldPackWidth(field, fieldSizes = {}) {
  const preset = resolveFieldWidthTypePreset(field, fieldSizes);
  if (preset.fullRow) return 9999;
  return preset.min || 140;
}
