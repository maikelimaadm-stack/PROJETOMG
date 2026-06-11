import {
  computeRowFieldBalance,
  packFieldsByRowBudget,
} from "./empFormRowBalance.js";
import {
  getMaxFieldsPerRow,
  normalizeFieldWidthTypes,
  resolveCardColSpan,
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
const NARROW_LAYOUT_MAX_WIDTH_PX = 1024;

const repackRowsForNarrowViewport = (
  rows = [],
  card = {},
  fields = [],
  fieldWidthTypes = {},
  containerWidthPx
) => {
  const fieldIds = flattenRowsToFieldIds({ rows });
  if (!fieldIds.length) return rows;

  const packedIds = packFieldsByRowBudget(
    fieldIds,
    fields,
    card,
    fieldWidthTypes,
    containerWidthPx
  );

  const packedRows = packedIds.map((ids, index) => ({
    id: createRowId(card.id || "card", index + 1),
    order: index + 1,
    fieldIds: ids,
  }));

  return balanceConfiguredRows(packedRows, {
    card,
    fieldSizes: fieldWidthTypes,
    fields,
    containerWidthPx,
  });
};

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

/** Card com estrutura de linhas definida pelo usuário (inclui linhas vazias para arrastar campos). */
export const cardHasExplicitRows = (card) =>
  Array.isArray(card?.rows) && card.rows.length > 0;

/** Mantém `rows` no card quando o usuário configurou mais de uma linha. */
export const shouldPreserveCardRows = (card, rows = []) =>
  cardHasExplicitRows(card) || (rows || []).length > 1;

/**
 * Filtra linhas do card pelos IDs permitidos, preservando a estrutura configurada.
 * @param {import('./layoutConfigV3.js').LayoutCardV3 | object} card
 * @param {Iterable<string>} allowedFieldIds
 * @param {{ globalSeen?: Set<string> }} [options]
 */
export const filterCardRowsByAllowedFieldIds = (
  card = {},
  allowedFieldIds = [],
  { globalSeen = null } = {}
) => {
  const allowed =
    allowedFieldIds instanceof Set ? allowedFieldIds : new Set(allowedFieldIds);
  const rows = [];

  resolveConfiguredCardRows(card).forEach((row, rowIndex) => {
    const fieldIds = [];
    (row.fieldIds || []).forEach((fieldId) => {
      if (!fieldId || !allowed.has(fieldId)) return;
      if (globalSeen?.has(fieldId)) return;
      if (globalSeen) globalSeen.add(fieldId);
      fieldIds.push(fieldId);
    });
    if (fieldIds.length) {
      rows.push({
        id: row.id,
        order: row.order || rowIndex + 1,
        fieldIds,
      });
    }
  });

  return rows;
};

/**
 * Linhas configuradas pelo usuário — sem reempacotar.
 * @param {import('./layoutConfigV3.js').LayoutCardV3 | object} card
 */
export const resolveConfiguredCardRows = (card = {}) => {
  if (cardHasExplicitRows(card)) {
    return [...card.rows]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((row, index) => ({
        id: row.id,
        order: Number.isFinite(Number(row.order)) ? Number(row.order) : index + 1,
        fieldIds: (row.fieldIds || []).filter(Boolean),
      }));
  }

  const fieldIds = Array.isArray(card?.fieldIds) ? card.fieldIds.filter(Boolean) : [];
  if (!fieldIds.length) return [];

  return [
    {
      id: createRowId(card.id || "card", 1),
      order: 1,
      fieldIds: [...fieldIds],
    },
  ];
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
  };
};

/**
 * Aplica balanceamento flex às linhas existentes (estrutura intacta).
 */
export const balanceConfiguredRows = (
  rows = [],
  { card = {}, fieldSizes = {}, fields = [], containerWidthPx } = {}
) => {
  const colSpan = resolveCardColSpan(card.colSpan);
  const normalizedSizes = normalizeFieldWidthTypes(fieldSizes);

  return rows.map((row, index) => {
    const fieldIds = (row.fieldIds || []).filter(Boolean);
    const normalized = normalizeLayoutRowV3(row, index, card.id || "card");
    return {
      ...normalized,
      fullWidth: false,
      fieldBalance: computeRowFieldBalance(
        fieldIds,
        fields,
        colSpan,
        normalizedSizes,
        containerWidthPx
      ),
    };
  });
};

/**
 * @param {import('./layoutConfigV3.js').LayoutCardV3} card
 * @param {Record<string, string>} [fieldWidthTypes]
 * @param {object[]} [fields]
 * @param {number} [containerWidthPx]
 */
/**
 * Garante no máximo 7 campos (card inteiro) ou 4 (card meio) por linha.
 * @param {{ keepEmptyRows?: boolean }} [options] — true no configurador (linhas vazias para arrastar campos)
 */
export const enforceMaxFieldsPerCardRows = (
  rows = [],
  colSpan = 12,
  cardId = "card",
  { keepEmptyRows = false } = {}
) => {
  const max = getMaxFieldsPerRow(resolveCardColSpan(colSpan));
  const next = [];

  rows.forEach((row, rowIndex) => {
    const ids = (row.fieldIds || []).filter(Boolean);
    if (!ids.length) {
      if (keepEmptyRows) {
        next.push({
          ...row,
          id: row.id || createRowId(cardId, rowIndex + 1),
          order: next.length + 1,
          fieldIds: [],
        });
      }
      return;
    }

    if (ids.length <= max) {
      next.push({
        ...row,
        id: row.id || createRowId(cardId, rowIndex + 1),
        order: next.length + 1,
        fieldIds: ids,
      });
      return;
    }

    for (let offset = 0; offset < ids.length; offset += max) {
      const chunk = ids.slice(offset, offset + max);
      next.push({
        id: offset === 0 && row.id ? row.id : createRowId(cardId, next.length + 1),
        order: next.length + 1,
        fieldIds: chunk,
      });
    }
  });

  return next.length ? next : [createEmptyLayoutRow(cardId)];
};

export const normalizeCardRows = (card = {}, fieldWidthTypes = {}, fields = [], containerWidthPx) => {
  const colSpan = resolveCardColSpan(card.colSpan);
  const configured = enforceMaxFieldsPerCardRows(
    resolveConfiguredCardRows(card),
    colSpan,
    card.id || "card"
  );
  const balanced = balanceConfiguredRows(configured, {
    card,
    fieldSizes: fieldWidthTypes,
    fields,
    containerWidthPx,
  });

  return {
    ...card,
    rows: balanced,
    fieldIds: flattenRowsToFieldIds({ rows: balanced }),
  };
};

/**
 * Mantém as linhas do card; apenas recalcula balanceamento (alias legado).
 */
export const packFieldIdsIntoRows = (fieldIds = [], options = {}) => {
  const { fieldSizes = {}, fields = [], card = {}, containerWidthPx } = options;
  const configured = resolveConfiguredCardRows({
    ...card,
    fieldIds: fieldIds.filter(Boolean),
    rows: card.rows,
  });
  return balanceConfiguredRows(configured, {
    card,
    fieldSizes,
    fields,
    containerWidthPx,
  });
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

export const getCardRowsForRender = (card, fieldWidthTypes = {}, fields = [], containerWidthPx) => {
  const normalizedSizes = normalizeFieldWidthTypes(fieldWidthTypes);
  const normalized = normalizeCardRows(card, normalizedSizes, fields, containerWidthPx);
  const rows = normalized.rows || [];
  const width = Number(containerWidthPx) || 0;

  if (width > 0 && width <= NARROW_LAYOUT_MAX_WIDTH_PX) {
    return repackRowsForNarrowViewport(rows, normalized, fields, normalizedSizes, width);
  }

  return rows;
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

export const swapFieldsInRows = (rows = [], fieldA, fieldB) => {
  if (!fieldA || !fieldB || fieldA === fieldB) return rows;
  const next = rows.map((row) => ({ ...row, fieldIds: [...(row.fieldIds || [])] }));
  let posA = null;
  let posB = null;

  next.forEach((row, rowIndex) => {
    (row.fieldIds || []).forEach((fieldId, fieldIndex) => {
      if (fieldId === fieldA) posA = { rowIndex, fieldIndex };
      if (fieldId === fieldB) posB = { rowIndex, fieldIndex };
    });
  });

  if (!posA || !posB) return rows;

  const a = next[posA.rowIndex].fieldIds[posA.fieldIndex];
  const b = next[posB.rowIndex].fieldIds[posB.fieldIndex];
  next[posA.rowIndex].fieldIds[posA.fieldIndex] = b;
  next[posB.rowIndex].fieldIds[posB.fieldIndex] = a;
  return next;
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

export const moveFieldBetweenRows = (rows = [], fieldId, targetRowId) => {
  if (!fieldId || !targetRowId) return rows;
  const cleaned = removeFieldFromRows(rows, fieldId);
  return addFieldToRow(cleaned, targetRowId, fieldId);
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

export const rowHasRoomForField = (row, colSpan = 12, fieldId = null) => {
  const ids = row?.fieldIds || [];
  if (fieldId && ids.includes(fieldId)) return true;
  return ids.length < getMaxFieldsPerRow(resolveCardColSpan(colSpan));
};

/**
 * Insere campos nas linhas existentes; cria nova linha quando a atual atinge o máximo (7/4).
 */
export const appendFieldIdsToCardRows = (rows = [], fieldIds = [], cardId = "card", colSpan = 12) => {
  const max = getMaxFieldsPerRow(resolveCardColSpan(colSpan));
  const list = [...fieldIds].filter(Boolean);
  let nextRows = rows.map((row) => ({ ...row, fieldIds: [...(row.fieldIds || [])] }));

  list.forEach((fieldId) => {
    nextRows = removeFieldFromRows(nextRows, fieldId);
    let placed = false;
    for (const row of nextRows) {
      if ((row.fieldIds || []).length < max) {
        nextRows = addFieldToRow(nextRows, row.id, fieldId);
        placed = true;
        break;
      }
    }
    if (!placed) {
      const newRow = createEmptyLayoutRow(cardId, nextRows);
      nextRows = addFieldToRow([...nextRows, newRow], newRow.id, fieldId);
    }
  });

  return nextRows;
};

/**
 * Coloca um campo nas linhas do card (respeita linha preferida e limite por colSpan).
 */
export const placeFieldInCardRows = (
  rows = [],
  fieldId,
  { cardId = "card", colSpan = 12, preferredRowId = null } = {}
) => {
  if (!fieldId) return { rows, placed: false };
  const cleaned = removeFieldFromRows(rows, fieldId);
  const max = getMaxFieldsPerRow(resolveCardColSpan(colSpan));

  const tryRow = (rowId) => {
    const row = cleaned.find((item) => item.id === rowId);
    if (!row || (row.fieldIds || []).length >= max) return null;
    return addFieldToRow(cleaned, rowId, fieldId);
  };

  if (preferredRowId) {
    const preferred = tryRow(preferredRowId);
    if (preferred) return { rows: preferred, placed: true };
  }

  for (const row of cleaned) {
    if ((row.fieldIds || []).length < max) {
      return { rows: addFieldToRow(cleaned, row.id, fieldId), placed: true };
    }
  }

  const newRow = createEmptyLayoutRow(cardId, cleaned);
  return {
    rows: addFieldToRow([...cleaned, newRow], newRow.id, fieldId),
    placed: true,
  };
};

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
