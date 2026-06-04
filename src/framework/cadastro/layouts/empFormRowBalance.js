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

export function getFieldGrowWeight(field, fieldWidthTypes = {}) {
  return resolveFieldWidthTypePreset(field, fieldWidthTypes).grow ?? 1;
}

/**
 * Soma min-widths + gaps de uma linha candidata.
 */
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
  const maxPerRow = getMaxFieldsPerRow(colSpan);

  const rows = [];
  let current = [];

  fieldIds.forEach((fieldId) => {
    if (!fieldId) return;

    const candidate = [...current, fieldId];
    const widthFits = rowContentWidthPx(candidate, fields, fieldWidthTypes) <= budgetPx;
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
 * Balanceamento flex: flex-grow por categoria, flex-basis = min-width.
 * Se a soma dos mínimos exceder a linha, reduz proporcionalmente para evitar overflow.
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
  const balance = {};

  if (sumMin > availablePx) {
    const scale = availablePx / sumMin;
    items.forEach((item) => {
      const scaledMin = Math.max(1, Math.floor(item.minPx * scale));
      balance[item.fieldId] = {
        growWeight: item.growWeight,
        minWidth: `${scaledMin}px`,
        flexBasis: `${scaledMin}px`,
        flexGrow: item.growWeight,
        flexShrink: 1,
        flex: `${item.growWeight} 1 ${scaledMin}px`,
        maxWidth: "100%",
        targetWidthPx: scaledMin,
      };
    });
    return balance;
  }

  const slack = Math.max(0, availablePx - sumMin);

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
      maxWidth: "100%",
      targetWidthPx: finalPx,
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
