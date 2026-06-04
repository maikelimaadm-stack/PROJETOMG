/**
 * Motor de linha corporativo V3 — ordem do usuário, min-width e flex-grow.
 * Quebra de linha somente pelo limite de campos (6 inteiro / 4 meio).
 * @module empFormRowBalance
 */

import { getMaxFieldsPerRow, resolveFieldWidthTypePreset } from "./empFormFieldWidthPresets.js";

export const ROW_GAP_PX = 8;

const MIN_ROW_BUDGET_PX = 160;
const DEFAULT_CONTAINER_WIDTH_PX = 360;

/**
 * @param {number} colSpan
 * @param {number} [containerWidthPx]
 */
export function getRowBudgetPx(colSpan = 12, containerWidthPx) {
  const span = Math.min(12, Math.max(1, Number(colSpan) || 12));
  const container = Number(containerWidthPx);
  const baseWidth =
    Number.isFinite(container) && container > 0 ? container : DEFAULT_CONTAINER_WIDTH_PX;
  const cardWidth = (baseWidth * span) / 12;
  return Math.max(MIN_ROW_BUDGET_PX, Math.floor(cardWidth - ROW_GAP_PX));
}

export function getFieldMinWidthPx(field, fieldWidthTypes = {}) {
  return resolveFieldWidthTypePreset(field, fieldWidthTypes).min || 140;
}

export function getFieldGrowWeight(field, fieldWidthTypes = {}) {
  return resolveFieldWidthTypePreset(field, fieldWidthTypes).grow ?? 1;
}

export function rowContentWidthPx(fieldIds, fields, fieldWidthTypes) {
  if (!fieldIds.length) return 0;
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const mins = fieldIds.reduce((sum, id) => {
    const field = fields.find((f) => f.id === id) || { id };
    return sum + getFieldMinWidthPx(field, fieldWidthTypes);
  }, 0);
  return mins + gaps;
}

/**
 * Empacota campos na ordem recebida; quebra só ao atingir o máximo por linha.
 * @param {string[]} fieldIds
 * @param {{ colSpan?: number }} [card]
 */
export function packFieldsByMaxCount(fieldIds = [], card = {}) {
  const colSpan = Number(card.colSpan) || 12;
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const rows = [];
  let current = [];

  fieldIds.forEach((fieldId) => {
    if (!fieldId) return;
    if (current.length >= maxPerRow) {
      rows.push([...current]);
      current = [];
    }
    current.push(fieldId);
  });

  if (current.length) rows.push(current);
  return rows;
}

/**
 * Balanceamento flex: flex-grow por categoria, flex-basis = min-width.
 * O espaço extra é distribuído proporcionalmente ao peso de crescimento (grow).
 */
export function computeRowFieldBalance(fieldIds, fields, colSpan, fieldWidthTypes = {}, containerWidthPx) {
  if (!fieldIds.length) return {};

  const budgetPx = getRowBudgetPx(colSpan, containerWidthPx);
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const availablePx = Math.max(budgetPx - gaps, 1);

  const items = fieldIds.map((id) => {
    const field = fields.find((f) => f.id === id) || { id };
    const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
    return { fieldId: id, minPx: preset.min, growWeight: preset.grow };
  });

  const sumMin = items.reduce((s, item) => s + item.minPx, 0) || 1;
  const sumGrow = items.reduce((s, item) => s + item.growWeight, 0) || 1;
  const slack = Math.max(0, availablePx - sumMin);
  const balance = {};

  items.forEach((item) => {
    const finalPx = Math.max(
      item.minPx,
      Math.round(item.minPx + (slack * item.growWeight) / sumGrow)
    );

    balance[item.fieldId] = {
      growWeight: item.growWeight,
      minWidth: `${item.minPx}px`,
      flexBasis: `${item.minPx}px`,
      flexGrow: item.growWeight,
      flexShrink: 1,
      flex: `${item.growWeight} 1 ${item.minPx}px`,
      maxWidth: "none",
      targetWidthPx: finalPx,
    };
  });

  return balance;
}

/**
 * Monta linhas balanceadas a partir da ordem dos campos.
 * @param {string[]} fieldIds
 * @param {{ fields?: object[], card?: object, fieldSizes?: Record<string, string>, containerWidthPx?: number }} [options]
 */
export function buildBalancedRows(fieldIds = [], options = {}) {
  const { fields = [], card = {}, fieldSizes = {}, containerWidthPx } = options;
  const colSpan = Number(card.colSpan) || 12;
  const rowIdLists = packFieldsByMaxCount(fieldIds, card);

  return rowIdLists.map((ids) => ({
    fieldIds: ids,
    fullWidth: false,
    fieldBalance: computeRowFieldBalance(ids, fields, colSpan, fieldSizes, containerWidthPx),
  }));
}

/** @deprecated Mantido para compatibilidade de import — delega ao empacotamento por contagem. */
export function packCompactRows(fieldIds, fields, card, fieldWidthTypes = {}, containerWidthPx) {
  void fields;
  void fieldWidthTypes;
  void containerWidthPx;
  return packFieldsByMaxCount(fieldIds, card);
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
