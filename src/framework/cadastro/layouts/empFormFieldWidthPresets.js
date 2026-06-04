/**
 * Larguras corporativas — min-width e flex-grow por categoria técnica.
 * Campos principais (texto, select, lookup, e-mail, etc.) compartilham o mesmo preset.
 * @module empFormFieldWidthPresets
 */

/** @typedef {'CAMPO_PRINCIPAL'|'CODIGO'|'SIM_NAO'|'TEXTO_CURTO'|'NUMERO'|'DATA'|'DATA_HORA'|'IMAGEM'|'ANEXO'} FieldWidthType */

/**
 * @typedef {Object} FieldWidthTypePreset
 * @property {number} min
 * @property {number} grow
 */

/** @type {Record<string, FieldWidthTypePreset>} */
export const FIELD_WIDTH_TYPE_PRESETS = {
  CAMPO_PRINCIPAL: { min: 260, grow: 3 },
  CODIGO: { min: 120, grow: 0.5 },
  SIM_NAO: { min: 120, grow: 0.5 },
  TEXTO_CURTO: { min: 140, grow: 1 },
  NUMERO: { min: 120, grow: 1 },
  DATA: { min: 140, grow: 1 },
  DATA_HORA: { min: 180, grow: 1 },
  IMAGEM: { min: 180, grow: 1 },
  ANEXO: { min: 220, grow: 1 },
};

export const FIELD_WIDTH_TYPE_OPTIONS = [
  { value: "CAMPO_PRINCIPAL", label: "Campo principal (texto, select, lookup, e-mail)" },
  { value: "CODIGO", label: "Código" },
  { value: "SIM_NAO", label: "Sim/Não / Status" },
  { value: "TEXTO_CURTO", label: "Texto curto (CEP, UF, telefone)" },
  { value: "NUMERO", label: "Número" },
  { value: "DATA", label: "Data" },
  { value: "DATA_HORA", label: "Data e hora" },
  { value: "IMAGEM", label: "Imagem" },
  { value: "ANEXO", label: "Anexo" },
];

/** XS–XL legado → categorias atuais */
const LEGACY_SIZE_TO_WIDTH_TYPE = {
  XS: "TEXTO_CURTO",
  SM: "TEXTO_CURTO",
  MD: "CAMPO_PRINCIPAL",
  LG: "CAMPO_PRINCIPAL",
  XL: "CAMPO_PRINCIPAL",
  FULL: "CAMPO_PRINCIPAL",
};

/** Tipos de largura anteriores → categorias atuais */
const LEGACY_WIDTH_TYPE_ALIASES = {
  SHORT_TEXT: "CAMPO_PRINCIPAL",
  MEDIUM_TEXT: "CAMPO_PRINCIPAL",
  LONG_TEXT: "CAMPO_PRINCIPAL",
  TEXTO_MEDIO: "CAMPO_PRINCIPAL",
  TEXTO_LONGO: "CAMPO_PRINCIPAL",
  EMAIL: "CAMPO_PRINCIPAL",
  LOOKUP: "CAMPO_PRINCIPAL",
  LOOKUP_RELACAO: "CAMPO_PRINCIPAL",
  SELECT: "CAMPO_PRINCIPAL",
  MULTILINE: "CAMPO_PRINCIPAL",
  TEXTAREA: "CAMPO_PRINCIPAL",
  NUMBER: "NUMERO",
  DATE: "DATA",
  DATETIME: "DATA_HORA",
  TIME: "DATA",
  PHONE: "TEXTO_CURTO",
  UF: "TEXTO_CURTO",
  CEP: "TEXTO_CURTO",
  IMAGE: "IMAGEM",
  ATTACHMENT: "ANEXO",
  IMAGE_EXPAND: "IMAGEM",
  ATTACHMENT_EXPAND: "ANEXO",
  CODE: "CODIGO",
  BOOLEAN: "SIM_NAO",
  YES_NO: "SIM_NAO",
  STATUS: "SIM_NAO",
};

const LOOKUP_TYPES = new Set([
  "autocomplete",
  "relation",
  "relacao",
  "lookup",
]);
const SELECT_TYPES = new Set([
  "select",
  "option_list",
  "multiselect",
  "multi_select",
  "lista",
  "lista_multipla",
]);
const DATE_TYPES = new Set(["date"]);
const DATETIME_TYPES = new Set(["datetime", "datetime-local", "data_hora", "datahora"]);
const TIME_TYPES = new Set(["time", "hora"]);
const NUMBER_TYPES = new Set(["number", "decimal", "moeda", "percentual", "integer", "calculado"]);
const MULTILINE_TYPES = new Set(["textarea", "html", "richtext", "rich_text", "memo", "markdown", "observacao"]);
const IMAGE_TYPES = new Set(["image", "imagem"]);
const ATTACHMENT_TYPES = new Set(["file", "attachment", "attachments", "document", "documents"]);
const EMAIL_TYPES = new Set(["email", "e-mail", "mail"]);
const MAIN_TEXT_TYPES = new Set(["text", "texto", "string", "url", "cpf_cnpj", "cpf", "cnpj"]);
const COMPACT_TEXT_TYPES = new Set(["cep", "tel", "phone", "telefone", "whatsapp", "mobile", "celular"]);
const CODE_TYPES = new Set(["code", "codigo"]);
const YES_NO_TYPES = new Set(["checkbox", "switch", "sim_nao", "yes_no", "boolean"]);

/**
 * @param {string|null} typeKey
 * @returns {FieldWidthType|null}
 */
function canonicalWidthType(typeKey) {
  if (!typeKey) return null;
  if (FIELD_WIDTH_TYPE_PRESETS[typeKey]) return /** @type {FieldWidthType} */ (typeKey);
  if (LEGACY_WIDTH_TYPE_ALIASES[typeKey]) return LEGACY_WIDTH_TYPE_ALIASES[typeKey];
  if (LEGACY_SIZE_TO_WIDTH_TYPE[typeKey]) return LEGACY_SIZE_TO_WIDTH_TYPE[typeKey];
  return null;
}

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function resolveStoredWidthType(field, fieldWidthTypes = {}) {
  const raw = String(fieldWidthTypes?.[field?.id] || field?.widthType || field?.fieldWidthType || "")
    .trim()
    .toUpperCase();
  if (!raw) return null;
  return canonicalWidthType(raw);
}

/**
 * Inferência pelo tipo do componente (sem heurística por nome/id).
 * @param {object} field
 * @returns {FieldWidthType}
 */
export function inferFieldWidthType(field) {
  if (!field) return "CAMPO_PRINCIPAL";

  const type = String(field.type || "text").toLowerCase();

  if (CODE_TYPES.has(type)) return "CODIGO";
  if (YES_NO_TYPES.has(type)) return "SIM_NAO";
  if (COMPACT_TEXT_TYPES.has(type)) return "TEXTO_CURTO";
  if (IMAGE_TYPES.has(type)) return "IMAGEM";
  if (ATTACHMENT_TYPES.has(type)) return "ANEXO";
  if (NUMBER_TYPES.has(type)) return "NUMERO";
  if (DATETIME_TYPES.has(type)) return "DATA_HORA";
  if (DATE_TYPES.has(type)) return "DATA";
  if (TIME_TYPES.has(type)) return "DATA";
  if (EMAIL_TYPES.has(type)) return "CAMPO_PRINCIPAL";
  if (MULTILINE_TYPES.has(type)) return "CAMPO_PRINCIPAL";
  if (SELECT_TYPES.has(type)) return "CAMPO_PRINCIPAL";
  if (LOOKUP_TYPES.has(type) || field.lookup === true) return "CAMPO_PRINCIPAL";
  if (MAIN_TEXT_TYPES.has(type)) return "CAMPO_PRINCIPAL";

  return "CAMPO_PRINCIPAL";
}

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function resolveFieldWidthTypePreset(field, fieldWidthTypes = {}) {
  const stored = resolveStoredWidthType(field, fieldWidthTypes);
  const typeKey = stored || inferFieldWidthType(field);
  const preset =
    FIELD_WIDTH_TYPE_PRESETS[typeKey] || FIELD_WIDTH_TYPE_PRESETS.CAMPO_PRINCIPAL;

  return {
    type: /** @type {FieldWidthType} */ (typeKey),
    min: preset.min,
    grow: preset.grow,
  };
}

/** Máximo de campos por linha conforme largura do card (colSpan 12 = inteiro, 6 = meio). */
export const MAX_FIELDS_PER_ROW_BY_COL_SPAN = Object.freeze({
  12: 6,
  6: 4,
});

/** Máximo de campos por linha (única regra automática de quebra). */
export function getMaxFieldsPerRow(colSpan = 12) {
  const span = Number(colSpan) || 12;
  if (span >= 12) return MAX_FIELDS_PER_ROW_BY_COL_SPAN[12];
  if (span >= 6) return MAX_FIELDS_PER_ROW_BY_COL_SPAN[6];
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
  return resolveFieldWidthTypePreset(field, fieldSizes).min || 260;
}

/** @deprecated */
export const isTextareaField = (field) =>
  MULTILINE_TYPES.has(String(field?.type || "").toLowerCase());
