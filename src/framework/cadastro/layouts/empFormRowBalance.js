/**
 * Motor de balanceamento de linhas — empacotamento + órfãos + flex proporcional.
 * @module empFormRowBalance
 */

import {
  getMaxFieldsPerRow,
  isTextareaField,
  resolveFieldWidthTypePreset,
} from "./empFormFieldWidthPresets.js";

/** Largura de referência (px) para cálculo de ocupação da linha. */
export const CARD_ROW_REFERENCE_WIDTH = {
  full: 920,
  half: 450,
  small: 300,
};

export const ROW_GAP_PX = 8;
export const TARGET_OCCUPANCY_MIN = 0.9;
export const TARGET_OCCUPANCY_MAX = 1;

/** Tipos que não devem absorver sobra (permanecem na largura mínima). */
const FIXED_WIDTH_TYPES = new Set(["NUMBER", "DATE", "DATETIME"]);

/** Peso de crescimento proporcional na sobra. */
const GROW_WEIGHT_BY_TYPE = {
  LONG_TEXT: 5,
  MEDIUM_TEXT: 4,
  LOOKUP: 3,
  ATTACHMENT: 3,
  IMAGE: 2,
  SELECT: 2,
  SHORT_TEXT: 1,
  NUMBER: 0,
  DATE: 0,
  DATETIME: 0,
  MULTILINE: 0,
};

/**
 * @param {string} type
 */
export const isExpandableWidthType = (type) => !FIXED_WIDTH_TYPES.has(type);

/**
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function getFieldRowMetrics(field, fieldWidthTypes = {}) {
  const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
  const type = preset.type;
  const expandable = isExpandableWidthType(type) && !preset.fullRow;
  const growWeight = expandable ? GROW_WEIGHT_BY_TYPE[type] ?? 1 : 0;
  return {
    fieldId: field.id,
    type,
    minPx: preset.min || 140,
    expandable,
    growWeight,
    fullRow: Boolean(preset.fullRow),
  };
}

/**
 * @param {number} colSpan
 */
export function getRowBudgetPx(colSpan = 12) {
  const span = Number(colSpan) || 12;
  if (span >= 12) return CARD_ROW_REFERENCE_WIDTH.full;
  if (span >= 6) return CARD_ROW_REFERENCE_WIDTH.half;
  return CARD_ROW_REFERENCE_WIDTH.small;
}

/**
 * @param {string[]} fieldIds
 * @param {object[]} fields
 * @param {Record<string, string>} fieldWidthTypes
 */
function rowContentWidthPx(fieldIds, fields, fieldWidthTypes) {
  if (!fieldIds.length) return 0;
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const mins = fieldIds.reduce((sum, id) => {
    const field = fields.find((f) => f.id === id) || { id };
    return sum + getFieldRowMetrics(field, fieldWidthTypes).minPx;
  }, 0);
  return mins + gaps;
}

/**
 * @param {string[][]} rows
 */
export function fixOrphanRows(rows) {
  if (rows.length < 2) return rows;
  let changed = true;
  let guard = 0;

  while (changed && guard < 50) {
    guard += 1;
    changed = false;

    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].length !== 1) continue;

      if (i > 0 && rows[i - 1].length >= 2) {
        rows[i].unshift(rows[i - 1].pop());
        changed = true;
        continue;
      }

      if (i < rows.length - 1 && rows[i + 1].length >= 2) {
        rows[i].push(rows[i + 1].shift());
        changed = true;
      }
    }
  }

  return rows;
}

/**
 * Empacota por largura mínima acumulada + limite de quantidade.
 * @param {string[]} regularFieldIds
 * @param {object[]} fields
 * @param {object} card
 * @param {Record<string, string>} fieldWidthTypes
 * @returns {string[][]}
 */
export function packRowsByWidth(regularFieldIds, fields, card, fieldWidthTypes = {}) {
  const colSpan = Number(card.colSpan) || 12;
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const budgetPx = getRowBudgetPx(colSpan);

  const rows = [];
  let current = [];

  const flush = () => {
    if (current.length) {
      rows.push([...current]);
      current = [];
    }
  };

  regularFieldIds.forEach((fieldId) => {
    const field = fields.find((f) => f.id === fieldId) || { id: fieldId };
    const minPx = getFieldRowMetrics(field, fieldWidthTypes).minPx;
    const nextIds = [...current, fieldId];
    const nextWidth = rowContentWidthPx(nextIds, fields, fieldWidthTypes);
    const exceedsWidth = current.length > 0 && nextWidth > budgetPx * TARGET_OCCUPANCY_MAX;
    const exceedsCount = current.length >= maxPerRow;

    if (exceedsWidth || exceedsCount) flush();

    current.push(fieldId);
    if (current.length >= maxPerRow) flush();
  });

  flush();

  return fixOrphanRows(rows);
}

/**
 * Calcula flex por campo para preencher 90–100% da linha.
 * @param {string[]} fieldIds
 * @param {object[]} fields
 * @param {number} colSpan
 * @param {Record<string, string>} fieldWidthTypes
 * @returns {Record<string, { flex: string, minWidth: string, expandable: boolean, growWeight: number }>}
 */
export function computeRowFieldBalance(fieldIds, fields, colSpan, fieldWidthTypes = {}) {
  if (!fieldIds.length) return {};

  const budgetPx = getRowBudgetPx(colSpan);
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const available = Math.max(budgetPx - gaps, 1);

  const items = fieldIds.map((id) => {
    const field = fields.find((f) => f.id === id) || { id };
    return getFieldRowMetrics(field, fieldWidthTypes);
  });

  const sumMin = items.reduce((s, item) => s + item.minPx, 0);
  const slack = Math.max(0, available - sumMin);
  const expandableItems = items.filter((item) => item.expandable && item.growWeight > 0);
  const totalGrow = expandableItems.reduce((s, item) => s + item.growWeight, 0);

  const balance = {};

  items.forEach((item) => {
    if (!item.expandable || totalGrow === 0) {
      balance[item.fieldId] = {
        expandable: false,
        growWeight: 0,
        minWidth: `${item.minPx}px`,
        flex: `0 0 ${item.minPx}px`,
      };
      return;
    }

    const extra =
      slack > 0 && sumMin / available < TARGET_OCCUPANCY_MIN
        ? (slack * item.growWeight) / totalGrow
        : slack > 0
          ? (slack * item.growWeight) / totalGrow
          : 0;

    const basis = Math.round(item.minPx + extra);

    balance[item.fieldId] = {
      expandable: true,
      growWeight: item.growWeight,
      minWidth: `${item.minPx}px`,
      flex: `${item.growWeight} 1 ${basis}px`,
      flexBasis: `${basis}px`,
    };
  });

  return balance;
}

/**
 * Pipeline completo: empacotar + balancear linhas regulares + textareas ao final.
 * @param {string[]} fieldIds
 * @param {{ fields?: object[], card?: object, fieldSizes?: Record<string, string> }} [options]
 */
export function buildBalancedRows(fieldIds = [], options = {}) {
  const { fields = [], card = {}, fieldSizes = {} } = options;
  const colSpan = Number(card.colSpan) || 12;

  const regular = [];
  const textareas = [];

  fieldIds.forEach((fieldId) => {
    if (!fieldId) return;
    const field = fields.find((f) => f.id === fieldId) || { id: fieldId };
    if (isTextareaField(field)) textareas.push(fieldId);
    else regular.push(fieldId);
  });

  const packed = packRowsByWidth(regular, fields, card, fieldSizes);

  const rows = packed.map((ids) => ({
    fieldIds: ids,
    fullWidth: false,
    fieldBalance: computeRowFieldBalance(ids, fields, colSpan, fieldSizes),
  }));

  textareas.forEach((fieldId) => {
    rows.push({
      fieldIds: [fieldId],
      fullWidth: true,
      fieldBalance: {},
    });
  });

  if (!rows.length && fieldIds.length) {
    return [
      {
        fieldIds: [...fieldIds],
        fullWidth: false,
        fieldBalance: computeRowFieldBalance(fieldIds, fields, colSpan, fieldSizes),
      },
    ];
  }

  return rows;
}
