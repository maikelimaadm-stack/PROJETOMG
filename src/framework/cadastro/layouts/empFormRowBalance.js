/**
 * Motor de balanceamento de linhas — grade 12 colunas, máx. 6 campos, grupos compacto/linha cheia.
 * @module empFormRowBalance
 */

import {
  getMaxFieldsPerRow,
  resolveFieldWidthTypePreset,
} from "./empFormFieldWidthPresets.js";
import {
  getFieldColumnWeight,
  getRowColumnBudget,
  isCompactLayoutField,
  isLineFillLayoutField,
  ROW_GRID_COLUMNS,
} from "./empFormFieldLayoutGroups.js";

/** Largura de referência (px) para cálculo de ocupação da linha. */
export const CARD_ROW_REFERENCE_WIDTH = {
  full: 920,
  half: 450,
  small: 300,
};

export const ROW_GAP_PX = 8;

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
 * @param {object} field
 * @param {Record<string, string>} [fieldWidthTypes]
 */
export function getFieldRowMetrics(field, fieldWidthTypes = {}) {
  const preset = resolveFieldWidthTypePreset(field, fieldWidthTypes);
  const lineFill = isLineFillLayoutField(field, fieldWidthTypes);
  const colWeight = lineFill ? ROW_GRID_COLUMNS : getFieldColumnWeight(field, fieldWidthTypes);

  return {
    fieldId: field.id,
    type: preset.type,
    minPx: preset.min || 140,
    colWeight,
    lineFill,
    compact: !lineFill,
    fullRow: Boolean(preset.fullRow) || lineFill,
  };
}

/**
 * Soma de colunas ocupadas na linha.
 * @param {string[]} fieldIds
 * @param {object[]} fields
 * @param {Record<string, string>} fieldWidthTypes
 */
function rowContentColumns(fieldIds, fields, fieldWidthTypes) {
  return fieldIds.reduce((sum, id) => {
    const field = fields.find((f) => f.id === id) || { id };
    return sum + getFieldRowMetrics(field, fieldWidthTypes).colWeight;
  }, 0);
}

/**
 * Evita linha com um único campo **compacto** (Grupo 1).
 * Campos de linha cheia (Grupo 2) podem permanecer sozinhos.
 * @param {string[][]} rows
 * @param {object[]} fields
 * @param {Record<string, string>} fieldWidthTypes
 */
/**
 * @param {string[]} rowIds
 * @param {string} fieldId
 * @param {object[]} fields
 * @param {Record<string, string>} fieldWidthTypes
 * @param {number} colSpan
 */
function canFitFieldInRow(rowIds, fieldId, fields, fieldWidthTypes, colSpan) {
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const columnBudget = getRowColumnBudget(colSpan);
  const nextIds = [...rowIds, fieldId];
  return (
    nextIds.length <= maxPerRow &&
    rowContentColumns(nextIds, fields, fieldWidthTypes) <= columnBudget
  );
}

export function fixOrphanCompactRows(rows, fields = [], fieldWidthTypes = {}, card = {}) {
  if (rows.length < 2) return rows;
  const colSpan = Number(card.colSpan) || 12;

  const isCompactOrphanRow = (row) => {
    if (row.length !== 1) return false;
    const field = fields.find((f) => f.id === row[0]) || { id: row[0] };
    return isCompactLayoutField(field, fieldWidthTypes);
  };

  let changed = true;
  let guard = 0;

  while (changed && guard < 50) {
    guard += 1;
    changed = false;

    for (let i = 0; i < rows.length; i += 1) {
      if (!isCompactOrphanRow(rows[i])) continue;
      const orphanId = rows[i][0];

      if (i > 0 && rows[i - 1].length >= 1) {
        const candidate = rows[i - 1][rows[i - 1].length - 1];
        if (canFitFieldInRow(rows[i], candidate, fields, fieldWidthTypes, colSpan)) {
          const moved = rows[i - 1].pop();
          if (moved) {
            rows[i].unshift(moved);
            changed = true;
            continue;
          }
        }
      }

      if (i < rows.length - 1 && rows[i + 1].length >= 1) {
        const candidate = rows[i + 1][0];
        if (canFitFieldInRow(rows[i], candidate, fields, fieldWidthTypes, colSpan)) {
          const moved = rows[i + 1].shift();
          if (moved) {
            rows[i].push(moved);
            changed = true;
          }
        } else if (canFitFieldInRow(rows[i + 1], orphanId, fields, fieldWidthTypes, colSpan)) {
          rows[i + 1].unshift(orphanId);
          rows[i].length = 0;
          changed = true;
        }
      }
    }

    for (let i = rows.length - 1; i >= 0; i -= 1) {
      if (!rows[i].length) rows.splice(i, 1);
    }
  }

  return rows;
}

/** @deprecated Use fixOrphanCompactRows */
export function fixOrphanRows(rows, fields = [], fieldWidthTypes = {}, card = {}) {
  return fixOrphanCompactRows(rows, fields, fieldWidthTypes, card);
}

/**
 * Empacota campos compactos (Grupo 1) por colunas + máximo de campos por linha.
 * @param {string[]} compactFieldIds
 * @param {object[]} fields
 * @param {object} card
 * @param {Record<string, string>} fieldWidthTypes
 * @returns {string[][]}
 */
export function packCompactRowsByColumns(compactFieldIds, fields, card, fieldWidthTypes = {}) {
  const colSpan = Number(card.colSpan) || 12;
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const columnBudget = getRowColumnBudget(colSpan);

  const rows = [];
  let current = [];

  const flush = () => {
    if (current.length) {
      rows.push([...current]);
      current = [];
    }
  };

  compactFieldIds.forEach((fieldId) => {
    const field = fields.find((f) => f.id === fieldId) || { id: fieldId };
    const nextIds = [...current, fieldId];
    const nextCols = rowContentColumns(nextIds, fields, fieldWidthTypes);
    const exceedsCols = current.length > 0 && nextCols > columnBudget;
    const exceedsCount = current.length >= maxPerRow;

    if (exceedsCols || exceedsCount) flush();

    current.push(fieldId);
    if (current.length >= maxPerRow) flush();
  });

  flush();

  return fixOrphanCompactRows(rows, fields, fieldWidthTypes, card);
}

/** @deprecated Use packCompactRowsByColumns */
export function packRowsByWidth(regularFieldIds, fields, card, fieldWidthTypes = {}) {
  return packCompactRowsByColumns(regularFieldIds, fields, card, fieldWidthTypes);
}

/**
 * Redistribui colunas restantes proporcionalmente (ex.: 8/12 → 12/12).
 * @param {string[]} fieldIds
 * @param {object[]} fields
 * @param {number} colSpan
 * @param {Record<string, string>} fieldWidthTypes
 */
export function computeRowFieldBalance(fieldIds, fields, colSpan, fieldWidthTypes = {}) {
  if (!fieldIds.length) return {};

  const columnBudget = getRowColumnBudget(colSpan);
  const budgetPx = getRowBudgetPx(colSpan);
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const availablePx = Math.max(budgetPx - gaps, 1);

  const items = fieldIds.map((id) => {
    const field = fields.find((f) => f.id === id) || { id };
    const metrics = getFieldRowMetrics(field, fieldWidthTypes);
    return {
      fieldId: id,
      colWeight: metrics.colWeight,
      minPx: metrics.minPx,
    };
  });

  const sumWeight = items.reduce((s, item) => s + item.colWeight, 0) || 1;
  const slackCols = Math.max(0, columnBudget - sumWeight);

  const balance = {};

  items.forEach((item) => {
    const finalCols = item.colWeight + (slackCols * item.colWeight) / sumWeight;
    const share = finalCols / columnBudget;
    const basisPx = Math.max(item.minPx, Math.round(share * availablePx));

    balance[item.fieldId] = {
      expandable: true,
      growWeight: item.colWeight,
      colSpan: finalCols,
      minWidth: `${item.minPx}px`,
      flex: `${item.colWeight} 1 ${basisPx}px`,
      flexBasis: `${basisPx}px`,
    };
  });

  return balance;
}

/**
 * Balanceamento para campo sozinho em linha cheia (Grupo 2).
 * @param {string} fieldId
 * @param {object[]} fields
 * @param {Record<string, string>} fieldWidthTypes
 */
export function computeLineFillFieldBalance(fieldId, fields, fieldWidthTypes = {}) {
  const field = fields.find((f) => f.id === fieldId) || { id: fieldId };
  const metrics = getFieldRowMetrics(field, fieldWidthTypes);
  return {
    [fieldId]: {
      expandable: true,
      growWeight: ROW_GRID_COLUMNS,
      colSpan: ROW_GRID_COLUMNS,
      minWidth: metrics.lineFill ? "100%" : `${metrics.minPx}px`,
      flex: "1 1 100%",
      flexBasis: "100%",
      lineFill: true,
    },
  };
}

/**
 * Pipeline: ordem preservada, compactos empacotados (máx. 6), linha cheia isolada.
 * @param {string[]} fieldIds
 * @param {{ fields?: object[], card?: object, fieldSizes?: Record<string, string> }} [options]
 */
export function buildBalancedRows(fieldIds = [], options = {}) {
  const { fields = [], card = {}, fieldSizes = {} } = options;
  const colSpan = Number(card.colSpan) || 12;

  const rows = [];
  let compactBuffer = [];

  const flushCompact = () => {
    if (!compactBuffer.length) return;
    const packed = packCompactRowsByColumns(compactBuffer, fields, card, fieldSizes);
    packed.forEach((ids) => {
      rows.push({
        fieldIds: ids,
        fullWidth: false,
        fieldBalance: computeRowFieldBalance(ids, fields, colSpan, fieldSizes),
      });
    });
    compactBuffer = [];
  };

  fieldIds.forEach((fieldId) => {
    if (!fieldId) return;
    const field = fields.find((f) => f.id === fieldId) || { id: fieldId };

    if (isLineFillLayoutField(field, fieldSizes)) {
      flushCompact();
      rows.push({
        fieldIds: [fieldId],
        fullWidth: true,
        fieldBalance: computeLineFillFieldBalance(fieldId, fields, fieldSizes),
      });
      return;
    }

    compactBuffer.push(fieldId);
  });

  flushCompact();

  if (!rows.length && fieldIds.length) {
    const onlyLineFill = fieldIds.every((id) => {
      const field = fields.find((f) => f.id === id) || { id };
      return isLineFillLayoutField(field, fieldSizes);
    });
    if (onlyLineFill) {
      return fieldIds.map((fieldId) => ({
        fieldIds: [fieldId],
        fullWidth: true,
        fieldBalance: computeLineFillFieldBalance(fieldId, fields, fieldSizes),
      }));
    }
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

/** @deprecated Grupo 2 usa linha cheia; compactos sempre participam da redistribuição */
export const isExpandableWidthType = () => true;
