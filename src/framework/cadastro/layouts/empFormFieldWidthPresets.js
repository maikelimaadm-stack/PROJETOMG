/**
 * Presets corporativos de largura (min / ideal / max em px).
 * Genérico para qualquer módulo — inferência por tipo e nome do campo.
 * @module empFormFieldWidthPresets
 */

/** @typedef {{ min: number, ideal: number, max: number, fullRow?: boolean }} FieldWidthPreset */

/** @type {Record<string, FieldWidthPreset>} */
export const FIELD_WIDTH_PRESETS = {
  UF: { min: 60, ideal: 70, max: 90 },
  CEP: { min: 90, ideal: 110, max: 130 },
  DATE: { min: 110, ideal: 130, max: 150 },
  CODE: { min: 70, ideal: 90, max: 120 },
  PHONE: { min: 130, ideal: 160, max: 200 },
  CPF: { min: 180, ideal: 220, max: 260 },
  CNPJ: { min: 220, ideal: 260, max: 320 },
  NUMBER: { min: 70, ideal: 90, max: 120 },
  SELECT: { min: 140, ideal: 180, max: 240 },
  IMAGE: { min: 70, ideal: 90, max: 120 },
  EMAIL: { min: 280, ideal: 350, max: 500 },
  NAME: { min: 300, ideal: 450, max: 700 },
  ADDRESS: { min: 400, ideal: 600, max: 1000 },
  TEXT: { min: 200, ideal: 280, max: 400 },
  OBSERVATION: { min: 0, ideal: 0, max: 0, fullRow: true },
};

export const FIELD_WIDTH_PRESET_KEYS = Object.keys(FIELD_WIDTH_PRESETS);

/** Orçamento de largura (px) para empacotar linhas dentro do card. */
export const CARD_ROW_WIDTH_BUDGET = {
  full: 2400,
  half: 1200,
  small: 800,
};

/** Máximo de campos por linha conforme largura do card (colSpan). */
export function getMaxFieldsPerRow(colSpan = 12) {
  const span = Number(colSpan) || 12;
  if (span >= 12) return 5;
  if (span >= 6) return 3;
  return 2;
}

export function getCardRowWidthBudget(colSpan = 12) {
  const span = Number(colSpan) || 12;
  if (span >= 12) return CARD_ROW_WIDTH_BUDGET.full;
  if (span >= 6) return CARD_ROW_WIDTH_BUDGET.half;
  return CARD_ROW_WIDTH_BUDGET.small;
}

const UF_NAMES = new Set(["uf", "estado", "sigla_uf", "uf_emissor"]);
const CODE_NAMES = /^(cod|codigo|id_|nr_|numero_documento)/;
const NAME_NAMES = /(razao|nome|fantasia|social|titulo|descricao_curta)/;
const ADDRESS_NAMES = /(endereco|logradouro|rua|avenida|complemento)/;

const isTextareaField = (field) => {
  const type = String(field?.type || "").toLowerCase();
  return type === "textarea" || type === "option_list";
};

/**
 * @param {object} field
 * @returns {string}
 */
export function inferFieldWidthPresetKey(field) {
  if (!field) return "TEXT";
  if (field.widthPreset && FIELD_WIDTH_PRESETS[field.widthPreset]) {
    return String(field.widthPreset).toUpperCase();
  }

  const type = String(field.type || "text").toLowerCase();
  const name = String(field.name || field.field_name || field.dataField || field.id || "").toLowerCase();

  if (isTextareaField(field) || field.wide && type === "textarea") return "OBSERVATION";
  if (type === "textarea" || type === "option_list") return "OBSERVATION";

  if (type === "image" || type === "file" || type === "imagem") return "IMAGE";
  if (["select", "autocomplete", "relation"].includes(type)) return "SELECT";
  if (["date", "datetime", "datetime-local"].includes(type) || name.includes("data")) return "DATE";
  if (UF_NAMES.has(name) || name === "uf" || name.endsWith("_uf")) return "UF";
  if (name.includes("cep")) return "CEP";
  if (name.includes("cnpj")) return "CNPJ";
  if (name.includes("cpf")) return "CPF";
  if (name.includes("email") || name.includes("e_mail")) return "EMAIL";
  if (name.includes("telefone") || name.includes("whatsapp") || name.includes("celular") || name.includes("fone")) {
    return "PHONE";
  }
  if (CODE_NAMES.test(name) || name.includes("codempresa") || name === "codigo") return "CODE";
  if (ADDRESS_NAMES.test(name)) return "ADDRESS";
  if (NAME_NAMES.test(name)) return "NAME";
  if (type === "number" || type === "decimal" || type === "moeda" || type === "percentual") return "NUMBER";
  if (field.compact) return "CODE";
  if (field.medium) return "SELECT";

  return "TEXT";
}

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldSizes]
 */
export function resolveFieldWidthPreset(field, fieldSizes = {}) {
  const sizeKey = String(fieldSizes?.[field?.id] || field?.fieldSize || "")
    .trim()
    .toUpperCase();

  const SIZE_TO_PRESET = {
    XS: "UF",
    SM: "CODE",
    MD: "CPF",
    LG: "NAME",
    XL: "EMAIL",
    FULL: "OBSERVATION",
  };

  const presetKey = SIZE_TO_PRESET[sizeKey] || inferFieldWidthPresetKey(field);
  const preset = FIELD_WIDTH_PRESETS[presetKey] || FIELD_WIDTH_PRESETS.TEXT;
  return { key: presetKey, ...preset };
}

/** Unidade de empacotamento (largura ideal em px). */
export function getFieldPackWidth(field, fieldSizes = {}) {
  const preset = resolveFieldWidthPreset(field, fieldSizes);
  if (preset.fullRow) return CARD_ROW_WIDTH_BUDGET.full;
  return preset.ideal;
}

export { isTextareaField };
