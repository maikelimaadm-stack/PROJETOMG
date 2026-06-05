/**
 * Motor de linha corporativo V3 — distribui espaço nas linhas configuradas pelo usuário.
 * Não cria nem move linhas/campos; estrutura vem do configurador (Aba → Card → Linha → Campo).
 * @module empFormRowBalance
 */

import {
  getMaxFieldsPerRow,
  resolveCardColSpan,
  resolveFieldWidthTypePreset,
} from "./empFormFieldWidthPresets.js";

export const ROW_GAP_PX = 8;

/** padding horizontal do .emp-form-card-body (8px + 8px) */
export const CARD_BODY_PADDING_X_PX = 16;

const MIN_ROW_BUDGET_PX = 160;
const DEFAULT_CONTAINER_WIDTH_PX = 360;
const MOBILE_PACK_MAX_WIDTH_PX = 640;
const MOBILE_COMPACT_MIN_PX = 120;
const MOBILE_PAIR_MIN_PX = 150;

const isMobilePackWidth = (containerWidthPx) => {
  const width = Number(containerWidthPx);
  return Number.isFinite(width) && width > 0 && width <= MOBILE_PACK_MAX_WIDTH_PX;
};

/**
 * Largura útil para campos dentro do card (sem padding interno do card-body).
 * @param {number} colSpan
 * @param {number} [containerWidthPx]
 */
export function getRowBudgetPx(colSpan = 12, containerWidthPx) {
  const span = Math.min(12, Math.max(1, Number(colSpan) || 12));
  const container = Number(containerWidthPx);
  const baseWidth =
    Number.isFinite(container) && container > 0 ? container : DEFAULT_CONTAINER_WIDTH_PX;
  const cardWidth = (baseWidth * span) / 12;
  return Math.max(MIN_ROW_BUDGET_PX, Math.floor(cardWidth - CARD_BODY_PADDING_X_PX));
}

export function getFieldMinWidthPx(field, fieldWidthTypes = {}) {
  return resolveFieldWidthTypePreset(field, fieldWidthTypes).min || 140;
}

export function getFieldPackMinWidthPx(field, fieldWidthTypes = {}, containerWidthPx) {
  if (!isMobilePackWidth(containerWidthPx)) {
    return getFieldMinWidthPx(field, fieldWidthTypes);
  }

  const fieldType = String(field?.type || "").toLowerCase();
  if (fieldType === "textarea" || field?.wide) return 9999;
  if (field?.compact) return MOBILE_COMPACT_MIN_PX;

  const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
  if (["TEXTO_CURTO", "CODIGO", "NUMERO", "SIM_NAO"].includes(preset.type)) {
    return Math.min(preset.min, MOBILE_PAIR_MIN_PX);
  }
  if (preset.type === "CAMPO_PRINCIPAL") {
    return MOBILE_PAIR_MIN_PX;
  }

  return Math.min(getFieldMinWidthPx(field, fieldWidthTypes), MOBILE_PAIR_MIN_PX);
}

export function getFieldGrowWeight(field, fieldWidthTypes = {}) {
  return resolveFieldWidthTypePreset(field, fieldWidthTypes).grow ?? 1;
}

/**
 * Soma min-widths + gaps de uma linha candidata.
 */
export function rowContentWidthPx(fieldIds, fields, fieldWidthTypes, containerWidthPx) {
  if (!fieldIds.length) return 0;
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const mins = fieldIds.reduce((sum, id) => {
    const field = fields.find((f) => f.id === id) || { id };
    return sum + getFieldPackMinWidthPx(field, fieldWidthTypes, containerWidthPx);
  }, 0);
  return mins + gaps;
}

/**
 * Empacota campos na ordem recebida respeitando largura útil e teto de contagem.
 * @param {string[]} fieldIds
 * @param {object[]} [fields]
 * @param {{ colSpan?: number }} [card]
 * @param {Record<string, string>} [fieldWidthTypes]
 * @param {number} [containerWidthPx]
 */
export function packFieldsByRowBudget(
  fieldIds = [],
  fields = [],
  card = {},
  fieldWidthTypes = {},
  containerWidthPx
) {
  const colSpan = resolveCardColSpan(card.colSpan);
  const budgetPx = getRowBudgetPx(colSpan, containerWidthPx);
  const maxPerRow = isMobilePackWidth(containerWidthPx)
    ? Math.min(2, getMaxFieldsPerRow(colSpan))
    : getMaxFieldsPerRow(colSpan);

  const rows = [];
  let current = [];

  fieldIds.forEach((fieldId) => {
    if (!fieldId) return;

    const candidate = [...current, fieldId];
    const widthFits = rowContentWidthPx(candidate, fields, fieldWidthTypes, containerWidthPx) <= budgetPx;
    const countFits = candidate.length <= maxPerRow;

    if (current.length > 0 && (!widthFits || !countFits)) {
      rows.push(current);
      current = [fieldId];
    } else {
      current = candidate;
    }
  });

  if (current.length) rows.push(current);
  return rows;
}

/**
 * @deprecated Use packFieldsByRowBudget — mantido como alias.
 */
export function packFieldsByMaxCount(
  fieldIds = [],
  card = {},
  fields = [],
  fieldWidthTypes = {},
  containerWidthPx
) {
  return packFieldsByRowBudget(fieldIds, fields, card, fieldWidthTypes, containerWidthPx);
}

/**
 * Balanceamento flex por linha: campos dividem 100% da largura útil (sem ultrapassar a borda).
 * flex-grow segue o peso da categoria; max-width limita cada slot a 1/N da linha.
 */
export function computeRowFieldBalance(fieldIds, fields, colSpan, fieldWidthTypes = {}, containerWidthPx) {
  if (!fieldIds.length) return {};

  const budgetPx = getRowBudgetPx(colSpan, containerWidthPx);
  const gapTotal = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const availablePx = Math.max(budgetPx - gapTotal, 1);
  const count = fieldIds.length;
  const maxWidth = `calc((100% - ${gapTotal}px) / ${count})`;

  const items = fieldIds.map((id) => {
    const field = fields.find((f) => f.id === id) || { id };
    const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
    return { fieldId: id, growWeight: preset.grow };
  });

  const sumGrow = items.reduce((s, item) => s + item.growWeight, 0) || 1;
  const balance = {};

  items.forEach((item) => {
    const field = fields.find((f) => f.id === item.fieldId) || { id: item.fieldId };
    const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
    const slotMinPx = Math.max(72, Math.min(preset.min || 120, Math.floor(availablePx / count)));
    const targetWidthPx = Math.max(1, Math.round((availablePx * item.growWeight) / sumGrow));
    balance[item.fieldId] = {
      growWeight: item.growWeight,
      minWidth: `${slotMinPx}px`,
      flexBasis: `${Math.max(slotMinPx, targetWidthPx)}px`,
      flexGrow: item.growWeight,
      flexShrink: 1,
      flex: `${item.growWeight} 1 ${slotMinPx}px`,
      maxWidth,
      targetWidthPx,
    };
  });

  return balance;
}

/**
 * Balanceia uma única linha configurada (sem alterar fieldIds).
 * @param {string[]} fieldIds
 * @param {{ fields?: object[], card?: object, fieldSizes?: Record<string, string>, containerWidthPx?: number }} [options]
 */
export function buildBalancedRows(fieldIds = [], options = {}) {
  const { fields = [], card = {}, fieldSizes = {}, containerWidthPx } = options;
  const colSpan = resolveCardColSpan(card.colSpan);
  const ids = fieldIds.filter(Boolean);
  if (!ids.length) return [];

  return [
    {
      fieldIds: ids,
      fullWidth: false,
      fieldBalance: computeRowFieldBalance(ids, fields, colSpan, fieldSizes, containerWidthPx),
    },
  ];
}

/** @deprecated */
export function packCompactRows(fieldIds, fields, card, fieldWidthTypes = {}, containerWidthPx) {
  return packFieldsByRowBudget(fieldIds, fields, card, fieldWidthTypes, containerWidthPx);
}

/** @deprecated Sem reorganização de órfãos. */
export function fixOrphanCompactRows(rows) {
  return rows;
}

/** @deprecated */
export function fixOrphanRows(rows) {
  return rows;
}

/** @deprecated */
export function packCompactRowsByColumns(...args) {
  return packCompactRows(...args);
}

/** @deprecated */
export function packRowsByWidth(...args) {
  return packCompactRows(...args);
}

/** @deprecated */
export function getFieldRowMetrics(field, fieldWidthTypes = {}) {
  const minPx = getFieldMinWidthPx(field, fieldWidthTypes);
  return {
    fieldId: field.id,
    minPx,
  };
}

/** @deprecated */
export function computeLineFillFieldBalance(fieldId, fields, fieldWidthTypes = {}) {
  return computeRowFieldBalance([fieldId], fields, 12, fieldWidthTypes);
}
