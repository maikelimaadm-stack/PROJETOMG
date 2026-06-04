/**
 * Motor de balanceamento — largura medida do container (ResizeObserver).
 * @module empFormRowBalance
 */

import { getMaxFieldsPerRow, resolveFieldWidthTypePreset } from "./empFormFieldWidthPresets.js";
import {
  isCompactLayoutField,
  isExpansiveLayoutField,
} from "./empFormFieldLayoutGroups.js";

export const ROW_GAP_PX = 8;

const MIN_ROW_BUDGET_PX = 160;
const DEFAULT_CONTAINER_WIDTH_PX = 360;

/**
 * @param {number} colSpan
 * @param {number} [containerWidthPx] — largura do slot do card
 */
export function getRowBudgetPx(colSpan = 12, containerWidthPx) {
  const span = Math.min(12, Math.max(1, Number(colSpan) || 12));
  const container = Number(containerWidthPx);
  const baseWidth =
    Number.isFinite(container) && container > 0 ? container : DEFAULT_CONTAINER_WIDTH_PX;
  const cardWidth = (baseWidth * span) / 12;
  return Math.max(MIN_ROW_BUDGET_PX, Math.floor(cardWidth - ROW_GAP_PX));
}

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

export function rowContentWidthPx(fieldIds, fields, fieldWidthTypes) {
  if (!fieldIds.length) return 0;
  const gaps = Math.max(0, fieldIds.length - 1) * ROW_GAP_PX;
  const mins = fieldIds.reduce((sum, id) => {
    const field = fields.find((f) => f.id === id) || { id };
    return sum + getFieldRowMetrics(field, fieldWidthTypes).minPx;
  }, 0);
  return mins + gaps;
}

function canFitFieldInRow(rowIds, fieldId, fields, fieldWidthTypes, colSpan, containerWidthPx) {
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const budgetPx = getRowBudgetPx(colSpan, containerWidthPx);
  const nextIds = [...rowIds, fieldId];
  return (
    nextIds.length <= maxPerRow && rowContentWidthPx(nextIds, fields, fieldWidthTypes) <= budgetPx
  );
}

export function fixOrphanCompactRows(rows, fields = [], fieldWidthTypes = {}, card = {}, containerWidthPx) {
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
        if (canFitFieldInRow(rows[i], candidate, fields, fieldWidthTypes, colSpan, containerWidthPx)) {
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
        if (canFitFieldInRow(rows[i], candidate, fields, fieldWidthTypes, colSpan, containerWidthPx)) {
          const moved = rows[i + 1].shift();
          if (moved) {
            rows[i].push(moved);
            changed = true;
          }
        } else if (canFitFieldInRow(rows[i + 1], orphanId, fields, fieldWidthTypes, colSpan, containerWidthPx)) {
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
export function fixOrphanRows(rows, fields = [], fieldWidthTypes = {}, card = {}, containerWidthPx) {
  return fixOrphanCompactRows(rows, fields, fieldWidthTypes, card, containerWidthPx);
}

export function packCompactRows(compactFieldIds, fields, card, fieldWidthTypes = {}, containerWidthPx) {
  const colSpan = Number(card.colSpan) || 12;
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const budgetPx = getRowBudgetPx(colSpan, containerWidthPx);

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

  return fixOrphanCompactRows(rows, fields, fieldWidthTypes, card, containerWidthPx);
}

/** @deprecated */
export function packCompactRowsByColumns(...args) {
  return packCompactRows(...args);
}

/** @deprecated */
export function packRowsByWidth(...args) {
  return packCompactRows(...args);
}

export function computeRowFieldBalance(fieldIds, fields, colSpan, fieldWidthTypes = {}, containerWidthPx) {
  if (!fieldIds.length) return {};

  const budgetPx = getRowBudgetPx(colSpan, containerWidthPx);
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

export function buildBalancedRows(fieldIds = [], options = {}) {
  const { fields = [], card = {}, fieldSizes = {}, containerWidthPx } = options;
  const colSpan = Number(card.colSpan) || 12;

  const rows = [];
  let compactBuffer = [];

  const flushCompact = () => {
    if (!compactBuffer.length) return;
    packCompactRows(compactBuffer, fields, card, fieldSizes, containerWidthPx).forEach((ids) => {
      rows.push({
        fieldIds: ids,
        fullWidth: false,
        fieldBalance: computeRowFieldBalance(ids, fields, colSpan, fieldSizes, containerWidthPx),
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
        fieldBalance: computeRowFieldBalance(fieldIds, fields, colSpan, fieldSizes, containerWidthPx),
      },
    ];
  }

  return rows;
}
