/**
 * Motor de balanceamento — px mínimos, máx. campos/linha, redistribuição proporcional.
 * @module empFormRowBalance
 */

import { getMaxFieldsPerRow, resolveFieldWidthTypePreset } from "./empFormFieldWidthPresets.js";
import {
  isCompactLayoutField,
  isExpansiveLayoutField,
} from "./empFormFieldLayoutGroups.js";

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
  const expansive = isExpansiveLayoutField(field, fieldWidthTypes);

  return {
    fieldId: field.id,
    type: preset.type,
    minPx: expansive ? 0 : preset.min || 140,
    expansive,
    compact: !expansive,
    fullRow: expansive,
  };
}

/**
 * @param {string[]} fieldIds
 * @param {object[]} fields
 * @param {Record<string, string>} fieldWidthTypes
 */
export function rowContentWidthPx(fieldIds, fields, fieldWidthTypes) {
  if (!fieldIds.length) return 0;
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const mins = fieldIds.reduce((sum, id) => {
    const field = fields.find((f) => f.id === id) || { id };
    return sum + getFieldRowMetrics(field, fieldWidthTypes).minPx;
  }, 0);
  return mins + gaps;
}

/**
 * @param {string[]} rowIds
 * @param {string} fieldId
 * @param {object[]} fields
 * @param {Record<string, string>} fieldWidthTypes
 * @param {number} colSpan
 */
function canFitFieldInRow(rowIds, fieldId, fields, fieldWidthTypes, colSpan) {
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const budgetPx = getRowBudgetPx(colSpan);
  const nextIds = [...rowIds, fieldId];
  return (
    nextIds.length <= maxPerRow && rowContentWidthPx(nextIds, fields, fieldWidthTypes) <= budgetPx
  );
}

/**
 * Compactos não permanecem sozinhos na linha.
 */
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

/** @deprecated */
export function fixOrphanRows(rows, fields = [], fieldWidthTypes = {}, card = {}) {
  return fixOrphanCompactRows(rows, fields, fieldWidthTypes, card);
}

/**
 * Empacota compactos por largura mínima (px) + limite de quantidade.
 */
export function packCompactRows(compactFieldIds, fields, card, fieldWidthTypes = {}) {
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

  compactFieldIds.forEach((fieldId) => {
    const nextIds = [...current, fieldId];
    const nextWidth = rowContentWidthPx(nextIds, fields, fieldWidthTypes);
    const exceedsWidth = current.length > 0 && nextWidth > budgetPx;
    const exceedsCount = current.length >= maxPerRow;

    if (exceedsWidth || exceedsCount) flush();

    current.push(fieldId);
    if (current.length >= maxPerRow) flush();
  });

  flush();

  return fixOrphanCompactRows(rows, fields, fieldWidthTypes, card);
}

/** @deprecated */
export function packCompactRowsByColumns(...args) {
  return packCompactRows(...args);
}

/** @deprecated */
export function packRowsByWidth(...args) {
  return packCompactRows(...args);
}

/**
 * Redistribui sobra proporcionalmente aos mínimos (preenche 100% da linha).
 * Ex.: 6×140px → partes iguais; 200+220+140 → 380+400+260 em ~1040px.
 */
export function computeRowFieldBalance(fieldIds, fields, colSpan, fieldWidthTypes = {}) {
  if (!fieldIds.length) return {};

  const budgetPx = getRowBudgetPx(colSpan);
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const availablePx = Math.max(budgetPx - gaps, 1);

  const items = fieldIds.map((id) => {
    const field = fields.find((f) => f.id === id) || { id };
    const metrics = getFieldRowMetrics(field, fieldWidthTypes);
    return { fieldId: id, minPx: metrics.minPx };
  });

  const sumMin = items.reduce((s, item) => s + item.minPx, 0) || 1;
  const slack = Math.max(0, availablePx - sumMin);

  const balance = {};

  items.forEach((item) => {
    const finalPx = Math.max(item.minPx, Math.round(item.minPx + (slack * item.minPx) / sumMin));

    balance[item.fieldId] = {
      compact: true,
      growWeight: item.minPx,
      minWidth: `${item.minPx}px`,
      flex: `1 1 ${finalPx}px`,
      flexBasis: `${finalPx}px`,
      targetWidthPx: finalPx,
    };
  });

  return balance;
}

export function computeLineFillFieldBalance(fieldId, fields, fieldWidthTypes = {}) {
  const field = fields.find((f) => f.id === fieldId) || { id: fieldId };
  const metrics = getFieldRowMetrics(field, fieldWidthTypes);
  return {
    [fieldId]: {
      expansive: true,
      growWeight: 1,
      minWidth: "0",
      flex: "1 1 100%",
      flexBasis: "100%",
      lineFill: true,
      targetWidthPx: metrics.minPx,
    },
  };
}

/**
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
    packCompactRows(compactBuffer, fields, card, fieldSizes).forEach((ids) => {
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

    if (isExpansiveLayoutField(field, fieldSizes)) {
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
