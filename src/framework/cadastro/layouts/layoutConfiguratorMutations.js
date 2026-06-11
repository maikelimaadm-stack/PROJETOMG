import {
  createEmptyLayoutRow,
  flattenRowsToFieldIds,
  insertFieldsIntoRowAtEdge,
  insertFieldsRelativeToTarget,
  placeFieldInCardRows,
  previewReorderFieldsAtTarget,
  removeFieldFromRows,
  resolveConfiguredCardRows,
} from "./empFormLayoutRows.js";
import { resolveCardColSpan } from "./empFormFieldWidthPresets.js";
import { normalizeLayoutCardV3 } from "./layoutConfigV3.js";

export const ensureCardRows = (card) => {
  const rows = resolveConfiguredCardRows(card);
  return rows.length ? rows : [createEmptyLayoutRow(card?.id || "card")];
};

/** Remove campos de todos os painéis/cards sem re-normalizar cards inteiros. */
export const stripFieldsFromAllCards = (cardsByPanel, fieldIds) => {
  const ids = (Array.isArray(fieldIds) ? fieldIds : [fieldIds]).filter(Boolean);
  if (!ids.length) return cardsByPanel;
  const idSet = new Set(ids);
  const next = { ...cardsByPanel };

  Object.keys(next).forEach((panelId) => {
    next[panelId] = {
      cards: (next[panelId]?.cards || []).map((card) => {
        const rows = ensureCardRows(card).map((row) => ({
          ...row,
          fieldIds: (row.fieldIds || []).filter((fieldId) => !idSet.has(fieldId)),
        }));
        return {
          ...card,
          rows,
          fieldIds: flattenRowsToFieldIds({ rows }),
        };
      }),
    };
  });

  return next;
};

export const stripFieldFromAllCards = (cardsByPanel, fieldId) =>
  stripFieldsFromAllCards(cardsByPanel, [fieldId]);

export const placeFieldsOnCard = ({
  cardsByPanel,
  panelId,
  cardId,
  fieldIds,
  card,
  preferredRowId = null,
}) => {
  const ids = (fieldIds || []).filter(Boolean);
  let next = stripFieldsFromAllCards(cardsByPanel, ids);
  const cards = (next[panelId]?.cards || []).map((item) => {
    if (item.id !== cardId) return item;
    let rows = ensureCardRows(item);
    ids.forEach((fieldId, index) => {
      const result = placeFieldInCardRows(rows, fieldId, {
        preferredRowId: index === 0 ? preferredRowId : null,
        card: card || item,
        cardId: item.id,
        colSpan: card?.colSpan || item.colSpan,
      });
      rows = result.rows;
    });
    return {
      ...item,
      rows,
      fieldIds: flattenRowsToFieldIds({ rows }),
    };
  });
  next[panelId] = { cards };
  return next;
};

export const updateCardRowsOnly = ({
  cardsByPanel,
  panelId,
  cardId,
  rows,
  fieldIds,
}) => {
  const next = { ...cardsByPanel };
  next[panelId] = {
    cards: (next[panelId]?.cards || []).map((card) =>
      card.id === cardId ? { ...card, rows, fieldIds } : card
    ),
  };
  return next;
};

/** Reordena cards ao vivo (splice, igual painéis). */
export const previewReorderCardsAtTarget = (
  cards = [],
  draggedCardId,
  targetCardId,
  edge = "auto"
) => {
  if (!draggedCardId || !targetCardId || draggedCardId === targetCardId) return null;
  const list = [...cards].sort((a, b) => (a.order || 0) - (b.order || 0));
  const from = list.findIndex((card) => card.id === draggedCardId);
  const to = list.findIndex((card) => card.id === targetCardId);
  if (from < 0 || to < 0 || from === to) return null;

  const [moved] = list.splice(from, 1);
  let insertAt = to;
  if (edge === "before") {
    insertAt = list.findIndex((card) => card.id === targetCardId);
  } else if (edge === "after") {
    insertAt = list.findIndex((card) => card.id === targetCardId) + 1;
  }
  if (insertAt < 0) return null;
  list.splice(insertAt, 0, moved);
  return list.map((card, orderIndex) => ({ ...card, order: orderIndex + 1 }));
};

export const updatePanelCardsOnly = ({ cardsByPanel, panelId, cards }) => ({
  ...cardsByPanel,
  [panelId]: { cards },
});

/**
 * Preview ao vivo: move campos para painel/card/linha/campo alvo.
 * Retorna null se não houve mudança.
 */
export const previewMoveFieldsAtTarget = ({
  cardsByPanel,
  panelId,
  cardId,
  fieldIds,
  card = null,
  targetFieldId = null,
  targetRowId = null,
  edge = "auto",
  reorderOnly = false,
}) => {
  const ids = (Array.isArray(fieldIds) ? fieldIds : [fieldIds]).filter(Boolean);
  if (!ids.length || !panelId || !cardId) return null;

  const panelCards = cardsByPanel[panelId]?.cards || [];
  const targetCard = panelCards.find((item) => item.id === cardId);
  if (!targetCard) return null;

  const cardMeta = card || targetCard;
  const colSpan = resolveCardColSpan(cardMeta.colSpan);
  const rowsBefore = ensureCardRows(targetCard);
  const flatBefore = flattenRowsToFieldIds({ rows: rowsBefore });

  if (
    reorderOnly &&
    targetFieldId &&
    ids.every((id) => flatBefore.includes(id)) &&
    !ids.includes(targetFieldId)
  ) {
    const reordered = previewReorderFieldsAtTarget(rowsBefore, ids, targetFieldId, edge);
    if (!reordered) return null;
    const flatAfter = flattenRowsToFieldIds({ rows: reordered });
    if (flatBefore.join("|") === flatAfter.join("|")) return null;
    return updateCardRowsOnly({
      cardsByPanel,
      panelId,
      cardId,
      rows: reordered,
      fieldIds: flatAfter,
    });
  }

  let next = stripFieldsFromAllCards(cardsByPanel, ids);
  const updatedCard = (next[panelId]?.cards || []).find((item) => item.id === cardId);
  if (!updatedCard) return null;

  let rows = ensureCardRows(updatedCard);
  const insertEdge = edge === "before" ? "before" : edge === "after" ? "after" : "after";

  if (targetFieldId && !ids.includes(targetFieldId)) {
    rows = insertFieldsRelativeToTarget(rows, ids, targetFieldId, insertEdge);
  } else if (targetRowId) {
    rows = insertFieldsIntoRowAtEdge(rows, ids, targetRowId, insertEdge);
  } else {
    ids.forEach((fieldId, index) => {
      const result = placeFieldInCardRows(rows, fieldId, {
        cardId,
        colSpan,
        preferredRowId: index === 0 ? targetRowId : null,
        card: cardMeta,
      });
      rows = result.rows;
    });
  }

  const fieldIdsFlat = flattenRowsToFieldIds({ rows });
  const result = updateCardRowsOnly({
    cardsByPanel: next,
    panelId,
    cardId,
    rows,
    fieldIds: fieldIdsFlat,
  });

  const snapshot = (cbp) =>
    Object.keys(cbp || {})
      .sort()
      .map((pid) =>
        (cbp[pid]?.cards || [])
          .map((item) => {
            const itemRows = ensureCardRows(item);
            return `${item.id}:${flattenRowsToFieldIds({ rows: itemRows }).join(",")}`;
          })
          .join("|")
      )
      .join("::");

  if (snapshot(cardsByPanel) === snapshot(result)) return null;
  return result;
};

export const createEmptyCardForPanel = (panelId, existingCards = []) => {
  const id = `card_${panelId}_${Date.now()}`;
  return normalizeLayoutCardV3({
    id,
    label: `Card ${existingCards.length + 1}`,
    order: existingCards.length + 1,
    colSpan: 6,
    collapsible: true,
    columns: 12,
    rows: [createEmptyLayoutRow(id)],
    fieldIds: [],
  });
};
