import {
  createEmptyLayoutRow,
  flattenRowsToFieldIds,
  placeFieldInCardRows,
  removeFieldFromRows,
  resolveConfiguredCardRows,
} from "./empFormLayoutRows.js";
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
