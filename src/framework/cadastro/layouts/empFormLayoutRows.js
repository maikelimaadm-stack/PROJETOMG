import { resolveFieldGridSpan } from "./empFormFieldGrid.js";
import {
  getCardRowWidthBudget,
  getFieldPackWidth,
  getMaxFieldsPerRow,
  isTextareaField,
} from "./empFormFieldWidthPresets.js";

/**
 * @typedef {Object} LayoutRowV3
 * @property {string} id
 * @property {number} [order]
 * @property {string[]} fieldIds
 * @property {boolean} [fullWidth]
 */

const GRID_COLUMNS = 12;

export const createRowId = (cardId = "card", index = 1) => {
  const base = `row_${String(cardId).replace(/[^a-zA-Z0-9_]/g, "_")}`;
  return `${base}_${index}`;
};

/**
 * @param {import('./layoutConfigV3.js').LayoutCardV3 | object} card
 */
export const flattenRowsToFieldIds = (card) => {
  if (Array.isArray(card?.rows) && card.rows.length) {
    const sorted = [...card.rows].sort((a, b) => (a.order || 0) - (b.order || 0));
    const ids = [];
    const seen = new Set();
    sorted.forEach((row) => {
      (row.fieldIds || []).forEach((fieldId) => {
        if (!fieldId || seen.has(fieldId)) return;
        seen.add(fieldId);
        ids.push(fieldId);
      });
    });
    return ids;
  }
  return Array.isArray(card?.fieldIds) ? [...card.fieldIds] : [];
};

/**
 * @param {LayoutRowV3} source
 * @param {number} index
 * @param {string} [cardId]
 */
export const normalizeLayoutRowV3 = (source = {}, index = 0, cardId = "card") => {
  const id =
    typeof source.id === "string" && source.id.trim()
      ? source.id.trim()
      : createRowId(cardId, index + 1);
  const order = Number.isFinite(Number(source.order)) ? Number(source.order) : index + 1;
  const fieldIds = Array.isArray(source.fieldIds)
    ? source.fieldIds.filter((fieldId) => typeof fieldId === "string" && fieldId)
    : [];
  return {
    id,
    order,
    fieldIds,
    fullWidth: Boolean(source.fullWidth),
  };
};

/**
 * Empacota campos em linhas: largura ideal/max, limite por card, textarea por último.
 * @param {string[]} fieldIds
 * @param {{ fieldSizes?: Record<string, string>, fields?: object[], card?: object }} [options]
 */
export const packFieldIdsIntoRows = (fieldIds = [], options = {}) => {
  const { fieldSizes = {}, fields = [], card = {} } = options;
  const colSpan = Number(card.colSpan) || 12;
  const maxPerRow = getMaxFieldsPerRow(colSpan);
  const budget = getCardRowWidthBudget(colSpan);

  const regular = [];
  const textareas = [];

  fieldIds.forEach((fieldId) => {
    if (!fieldId) return;
    const field = fields.find((item) => item.id === fieldId) || { id: fieldId };
    if (isTextareaField(field)) textareas.push(fieldId);
    else regular.push(fieldId);
  });

  const rows = [];
  let current = [];
  let usedWidth = 0;

  const flush = () => {
    if (!current.length) return;
    rows.push({ fieldIds: [...current], fullWidth: false });
    current = [];
    usedWidth = 0;
  };

  regular.forEach((fieldId) => {
    const field = fields.find((item) => item.id === fieldId) || { id: fieldId };
    const pack = getFieldPackWidth(field, fieldSizes);

    const exceedsCount = current.length >= maxPerRow;
    const exceedsWidth = current.length > 0 && usedWidth + pack > budget;

    if (exceedsCount || exceedsWidth) flush();

    current.push(fieldId);
    usedWidth += pack;

    if (current.length >= maxPerRow) flush();
  });

  flush();

  textareas.forEach((fieldId) => {
    rows.push({ fieldIds: [fieldId], fullWidth: true });
  });

  if (!rows.length && fieldIds.length) {
    return [{ fieldIds: [...fieldIds], fullWidth: false }];
  }

  return rows.filter((row) => row.fieldIds.length);
};

/** @deprecated Empacotamento legado por grid 12 — preferir packFieldIdsIntoRows com card. */
export const packFieldIdsIntoGridRows = (fieldIds = [], fieldSizes = {}, fields = []) => {
  const rows = [];
  let current = { fieldIds: [] };
  let used = 0;

  const resolveSpan = (fieldId) => {
    const field = fields.find((item) => item.id === fieldId);
    return resolveFieldGridSpan(field || { id: fieldId }, fieldSizes);
  };

  fieldIds.forEach((fieldId) => {
    if (!fieldId) return;
    const span = resolveSpan(fieldId);
    if (used > 0 && used + span > GRID_COLUMNS) {
      rows.push(current);
      current = { fieldIds: [] };
      used = 0;
    }
    current.fieldIds.push(fieldId);
    used += span;
    if (used >= GRID_COLUMNS) {
      rows.push(current);
      current = { fieldIds: [] };
      used = 0;
    }
  });

  if (current.fieldIds.length) rows.push(current);
  return rows.filter((row) => row.fieldIds.length);
};

/**
 * @param {import('./layoutConfigV3.js').LayoutCardV3} card
 * @param {Record<string, string>} [fieldSizes]
 * @param {object[]} [fields]
 */
export const normalizeCardRows = (card = {}, fieldSizes = {}, fields = []) => {
  const cardId = card.id || "card";
  const fieldIds = flattenRowsToFieldIds(card);
  const packed = packFieldIdsIntoRows(fieldIds, { fieldSizes, fields, card });

  const rows = packed.map((row, index) =>
    normalizeLayoutRowV3(
      {
        id: createRowId(cardId, index + 1),
        fieldIds: row.fieldIds,
        fullWidth: row.fullWidth,
      },
      index,
      cardId
    )
  );

  return { ...card, rows, fieldIds };
};

/**
 * Linhas do card para render (Card → Linha → Campo).
 */
export const getCardRowsForRender = (card, fieldSizes = {}, fields = []) => {
  const normalized = normalizeCardRows(card, fieldSizes, fields);
  return normalized.rows || [];
};

/**
 * @param {LayoutRowV3[]} rows
 * @param {string} fieldId
 */
export const removeFieldFromRows = (rows = [], fieldId) =>
  rows.map((row) => ({
    ...row,
    fieldIds: (row.fieldIds || []).filter((id) => id !== fieldId),
  }));

/**
 * @param {LayoutRowV3[]} rows
 * @param {string} fieldId
 * @param {string} rowId
 */
export const addFieldToRow = (rows = [], rowId, fieldId) => {
  const cleaned = removeFieldFromRows(rows, fieldId);
  return cleaned.map((row) =>
    row.id === rowId ? { ...row, fieldIds: [...(row.fieldIds || []), fieldId] } : row
  );
};

/**
 * @param {LayoutRowV3[]} rows
 * @param {string} draggedFieldId
 * @param {string} targetFieldId
 */
export const reorderFieldWithinRows = (rows = [], draggedFieldId, targetFieldId) => {
  if (!draggedFieldId || draggedFieldId === targetFieldId) return rows;
  let sourceRowIndex = -1;
  let targetRowIndex = -1;
  rows.forEach((row, index) => {
    if ((row.fieldIds || []).includes(draggedFieldId)) sourceRowIndex = index;
    if ((row.fieldIds || []).includes(targetFieldId)) targetRowIndex = index;
  });
  if (sourceRowIndex < 0 || targetRowIndex < 0) return rows;

  const next = rows.map((row) => ({ ...row, fieldIds: [...(row.fieldIds || [])] }));
  const sourceIds = next[sourceRowIndex].fieldIds;
  const from = sourceIds.indexOf(draggedFieldId);
  if (from < 0) return rows;
  sourceIds.splice(from, 1);

  const to = next[targetRowIndex].fieldIds.indexOf(targetFieldId);
  next[targetRowIndex].fieldIds.splice(to >= 0 ? to : next[targetRowIndex].fieldIds.length, 0, draggedFieldId);
  return next;
};

/**
 * @param {LayoutRowV3[]} rows
 * @param {string} rowId
 * @param {number} direction
 */
export const moveLayoutRow = (rows = [], rowId, direction) => {
  const list = [...rows].sort((a, b) => a.order - b.order);
  const index = list.findIndex((row) => row.id === rowId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return rows;
  const [moved] = list.splice(index, 1);
  list.splice(target, 0, moved);
  return list.map((row, orderIndex) => ({ ...row, order: orderIndex + 1 }));
};

/**
 * @param {string} cardId
 * @param {LayoutRowV3[]} [existingRows]
 */
export const createEmptyLayoutRow = (cardId, existingRows = []) => ({
  id: createRowId(cardId, existingRows.length + 1),
  order: existingRows.length + 1,
  fieldIds: [],
  fullWidth: false,
});

/**
 * @param {LayoutRowV3[]} rows
 * @param {string} rowId
 */
export const deleteLayoutRow = (rows = [], rowId) => {
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  if (sorted.length <= 1) return sorted;
  const index = sorted.findIndex((row) => row.id === rowId);
  if (index < 0) return sorted;
  const removed = sorted[index];
  const fallbackIndex = index > 0 ? index - 1 : 1;
  const next = sorted.filter((row) => row.id !== rowId);
  if (removed?.fieldIds?.length && next[fallbackIndex]) {
    next[fallbackIndex] = {
      ...next[fallbackIndex],
      fieldIds: [...new Set([...(next[fallbackIndex].fieldIds || []), ...removed.fieldIds])],
    };
  }
  return next.map((row, orderIndex) => ({ ...row, order: orderIndex + 1 }));
};
