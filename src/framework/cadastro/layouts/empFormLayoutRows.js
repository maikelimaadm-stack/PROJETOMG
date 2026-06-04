import {
  buildBalancedRows,
  computeRowFieldBalance,
  packFieldsByRowBudget,
} from "./empFormRowBalance.js";
import {
  normalizeFieldWidthTypes,
  resolveFieldWidthTypePreset,
} from "./empFormFieldWidthPresets.js";

/**
 * @typedef {Object} LayoutRowV3
 * @property {string} id
 * @property {number} [order]
 * @property {string[]} fieldIds
 * @property {Record<string, { flex: string, minWidth: string, flexGrow?: number, flexBasis?: string, maxWidth?: string, growWeight?: number, targetWidthPx?: number }>} [fieldBalance]
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

const cardHasExplicitRows = (card) =>
  Array.isArray(card?.rows) &&
  card.rows.length > 0 &&
  card.rows.some((row) => (row.fieldIds || []).filter(Boolean).length > 0);

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
  const fieldBalance =
    source.fieldBalance && typeof source.fieldBalance === "object" ? { ...source.fieldBalance } : undefined;

  return {
    id,
    order,
    fieldIds,
    ...(fieldBalance ? { fieldBalance } : {}),
  };
};

/**
 * Empacota campos na ordem configurada (quebra por largura útil do card; teto 6/4).
 * @param {string[]} fieldIds
 * @param {{ fieldSizes?: Record<string, string>, fields?: object[], card?: object, containerWidthPx?: number }} [options]
 */
export const packFieldIdsIntoRows = (fieldIds = [], options = {}) => {
  const { fieldSizes = {}, fields = [], card = {}, containerWidthPx } = options;
  const normalizedSizes = normalizeFieldWidthTypes(fieldSizes);
  return buildBalancedRows(fieldIds, { fields, card, fieldSizes: normalizedSizes, containerWidthPx });
};

/** @deprecated Empacotamento legado por grid 12 */
export const packFieldIdsIntoGridRows = (fieldIds = [], fieldSizes = {}, fields = []) => {
  const rows = [];
  let current = { fieldIds: [] };
  let used = 0;

  const resolveSpan = (fieldId) => {
    const field = fields.find((item) => item.id === fieldId);
    const preset = field ? resolveFieldWidthTypePreset(field, fieldSizes) : { min: 140 };
    return Math.min(12, Math.max(1, Math.ceil((preset.min || 140) / 80)));
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
 * @param {Record<string, string>} [fieldWidthTypes]
 * @param {object[]} [fields]
 * @param {number} [containerWidthPx]
 */
export const normalizeCardRows = (card = {}, fieldWidthTypes = {}, fields = [], containerWidthPx) => {
  const cardId = card.id || "card";
  const colSpan = Number(card.colSpan) || 12;
  const normalizedSizes = normalizeFieldWidthTypes(fieldWidthTypes);

  let packed;

  if (cardHasExplicitRows(card)) {
    packed = [];
    [...card.rows]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((row) => {
        const fieldIds = (row.fieldIds || []).filter(Boolean);
        if (!fieldIds.length) return;
        const rowLists = packFieldsByRowBudget(
          fieldIds,
          fields,
          { colSpan },
          normalizedSizes,
          containerWidthPx
        );
        rowLists.forEach((ids) => {
          packed.push({
            fieldIds: ids,
            fieldBalance: computeRowFieldBalance(
              ids,
              fields,
              colSpan,
              normalizedSizes,
              containerWidthPx
            ),
          });
        });
      });
  } else {
    const fieldIds = flattenRowsToFieldIds(card);
    packed = packFieldIdsIntoRows(fieldIds, {
      fields,
      card,
      fieldSizes: normalizedSizes,
      containerWidthPx,
    });
  }

  const rows = packed.map((row, index) =>
    normalizeLayoutRowV3(
      {
        id: createRowId(cardId, index + 1),
        fieldIds: row.fieldIds,
        fieldBalance: row.fieldBalance,
      },
      index,
      cardId
    )
  );

  return { ...card, rows, fieldIds: flattenRowsToFieldIds({ rows }) };
};

export const getCardRowsForRender = (card, fieldWidthTypes = {}, fields = [], containerWidthPx) => {
  const normalized = normalizeCardRows(
    card,
    normalizeFieldWidthTypes(fieldWidthTypes),
    fields,
    containerWidthPx
  );
  return normalized.rows || [];
};

export const removeFieldFromRows = (rows = [], fieldId) =>
  rows.map((row) => ({
    ...row,
    fieldIds: (row.fieldIds || []).filter((id) => id !== fieldId),
  }));

export const addFieldToRow = (rows = [], rowId, fieldId) => {
  const cleaned = removeFieldFromRows(rows, fieldId);
  return cleaned.map((row) =>
    row.id === rowId ? { ...row, fieldIds: [...(row.fieldIds || []), fieldId] } : row
  );
};

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

export const moveLayoutRow = (rows = [], rowId, direction) => {
  const list = [...rows].sort((a, b) => a.order - b.order);
  const index = list.findIndex((row) => row.id === rowId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return rows;
  const [moved] = list.splice(index, 1);
  list.splice(target, 0, moved);
  return list.map((row, orderIndex) => ({ ...row, order: orderIndex + 1 }));
};

export const createEmptyLayoutRow = (cardId, existingRows = []) => ({
  id: createRowId(cardId, existingRows.length + 1),
  order: existingRows.length + 1,
  fieldIds: [],
});

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
