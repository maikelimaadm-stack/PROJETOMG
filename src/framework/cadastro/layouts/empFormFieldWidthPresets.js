/**
 * Larguras corporativas — apenas min-width por categoria técnica.
 * O motor não decide layout; só aplica min-width + flex-grow na linha.
 * @module empFormFieldWidthPresets
 */

/** @typedef {'TEXTO_CURTO'|'NUMERO'|'DATA'|'DATA_HORA'|'TEXTO_MEDIO'|'TEXTO_LONGO'|'EMAIL'|'LOOKUP_RELACAO'|'IMAGEM'|'ANEXO'|'TEXTAREA'} FieldWidthType */

/**
 * @typedef {Object} FieldWidthTypePreset
 * @property {number} min
 */

/** @type {Record<string, FieldWidthTypePreset>} */
export const FIELD_WIDTH_TYPE_PRESETS = {
  TEXTO_CURTO: { min: 140 },
  NUMERO: { min: 120 },
  DATA: { min: 140 },
  DATA_HORA: { min: 180 },
  TEXTO_MEDIO: { min: 220 },
  TEXTO_LONGO: { min: 320 },
  EMAIL: { min: 260 },
  LOOKUP_RELACAO: { min: 260 },
  IMAGEM: { min: 180 },
  ANEXO: { min: 220 },
  TEXTAREA: { min: 320 },
};

export const FIELD_WIDTH_TYPE_OPTIONS = [
  { value: "TEXTO_CURTO", label: "Texto curto" },
  { value: "NUMERO", label: "Número" },
  { value: "DATA", label: "Data" },
  { value: "DATA_HORA", label: "Data e hora" },
  { value: "TEXTO_MEDIO", label: "Texto médio" },
  { value: "TEXTO_LONGO", label: "Texto longo" },
  { value: "EMAIL", label: "E-mail" },
  { value: "LOOKUP_RELACAO", label: "Lookup / relação" },
  { value: "IMAGEM", label: "Imagem" },
  { value: "ANEXO", label: "Anexo" },
  { value: "TEXTAREA", label: "Textarea" },
];

/** XS–XL legado → categorias técnicas */
const LEGACY_SIZE_TO_WIDTH_TYPE = {
  XS: "TEXTO_CURTO",
  SM: "TEXTO_CURTO",
  MD: "TEXTO_MEDIO",
  LG: "TEXTO_MEDIO",
  XL: "TEXTO_LONGO",
  FULL: "TEXTAREA",
};

/** Tipos de largura anteriores → categorias atuais */
const LEGACY_WIDTH_TYPE_ALIASES = {
  SHORT_TEXT: "TEXTO_CURTO",
  NUMBER: "NUMERO",
  DATE: "DATA",
  DATETIME: "DATA_HORA",
  TIME: "DATA",
  SELECT: "TEXTO_MEDIO",
  LOOKUP: "LOOKUP_RELACAO",
  PHONE: "TEXTO_CURTO",
  MEDIUM_TEXT: "TEXTO_MEDIO",
  LONG_TEXT: "TEXTO_LONGO",
  MULTILINE: "TEXTAREA",
  IMAGE: "IMAGEM",
  ATTACHMENT: "ANEXO",
  IMAGE_EXPAND: "IMAGEM",
  ATTACHMENT_EXPAND: "ANEXO",
};

const LOOKUP_TYPES = new Set(["autocomplete", "relation"]);
const SELECT_TYPES = new Set(["select", "option_list", "multiselect", "multi_select"]);
const DATE_TYPES = new Set(["date"]);
const DATETIME_TYPES = new Set(["datetime", "datetime-local"]);
const TIME_TYPES = new Set(["time"]);
const NUMBER_TYPES = new Set(["number", "decimal", "moeda", "percentual", "integer", "calculado"]);
const MULTILINE_TYPES = new Set(["textarea", "html", "richtext", "rich_text", "memo", "markdown"]);
const IMAGE_TYPES = new Set(["image", "imagem"]);
const ATTACHMENT_TYPES = new Set(["file", "attachment", "attachments", "document", "documents"]);
const EMAIL_TYPES = new Set(["email", "e-mail", "mail"]);

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
  if (LEGACY_WIDTH_TYPE_ALIASES[raw]) return LEGACY_WIDTH_TYPE_ALIASES[raw];
  if (LEGACY_SIZE_TO_WIDTH_TYPE[raw]) return LEGACY_SIZE_TO_WIDTH_TYPE[raw];
  return null;
}

/**
 * Inferência apenas pelo tipo nativo do campo (sem wide/medium/heurística de nome).
 * @param {object} field
 * @returns {FieldWidthType}
 */
export function inferFieldWidthType(field) {
  if (!field) return "TEXTO_CURTO";

  const type = String(field.type || "text").toLowerCase();

  if (MULTILINE_TYPES.has(type)) return "TEXTAREA";
  if (IMAGE_TYPES.has(type)) return "IMAGEM";
  if (ATTACHMENT_TYPES.has(type)) return "ANEXO";
  if (NUMBER_TYPES.has(type)) return "NUMERO";
  if (DATETIME_TYPES.has(type)) return "DATA_HORA";
  if (DATE_TYPES.has(type)) return "DATA";
  if (TIME_TYPES.has(type)) return "DATA";
  if (EMAIL_TYPES.has(type)) return "EMAIL";
  if (SELECT_TYPES.has(type)) return "TEXTO_MEDIO";
  if (LOOKUP_TYPES.has(type) || field.lookup === true) return "LOOKUP_RELACAO";
  if (type === "checkbox" || type === "switch") return "TEXTO_CURTO";

  return "TEXTO_CURTO";
}

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function resolveFieldWidthTypePreset(field, fieldWidthTypes = {}) {
  const stored = resolveStoredWidthType(field, fieldWidthTypes);
  const typeKey = stored || inferFieldWidthType(field);
  const preset = FIELD_WIDTH_TYPE_PRESETS[typeKey] || FIELD_WIDTH_TYPE_PRESETS.TEXTO_CURTO;

  return {
    type: /** @type {FieldWidthType} */ (typeKey),
    min: preset.min,
  };
}

/** Máximo de campos por linha (única regra automática de quebra). */
export function getMaxFieldsPerRow(colSpan = 12) {
  const span = Number(colSpan) || 12;
  if (span >= 12) return 6;
  if (span >= 6) return 4;
  return 2;
}

/**
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

/** @deprecated */
export function resolveFieldWidthPreset(field, fieldSizes = {}) {
  const preset = resolveFieldWidthTypePreset(field, fieldSizes);
  return {
    key: preset.type,
    min: preset.min,
    ideal: preset.min,
    max: Number.MAX_SAFE_INTEGER,
  };
}

/** @deprecated */
export function getFieldPackWidth(field, fieldSizes = {}) {
  return resolveFieldWidthTypePreset(field, fieldSizes).min || 140;
}

/** @deprecated */
export const isTextareaField = (field) => inferFieldWidthType(field) === "TEXTAREA";
