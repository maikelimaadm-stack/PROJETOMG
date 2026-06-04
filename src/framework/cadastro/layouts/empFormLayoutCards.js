import {
  DEFAULT_VIRTUAL_CARD_ID,
  normalizePanelLayoutV3,
  normalizeLayoutCardV3,
  isPanelLayoutV3,
  flattenV3LayoutToV2,
  isLayoutStructureV2,
} from "./layoutConfigV3.js";

/**
 * Cards do painel para renderização (com card virtual "Geral" quando necessário).
 * @param {{ layout?: Record<string, unknown>, layoutV3?: Record<string, unknown>, panelId: string, defaultLayout?: Record<string, string[]> }} params
 */
export function getPanelCardsForRender({ layout = {}, layoutV3 = {}, panelId, defaultLayout = {} }) {
  const panelV3 = layoutV3?.[panelId];
  if (panelV3 && isPanelLayoutV3(panelV3)) {
    return normalizePanelLayoutV3(panelV3, {
      panelId,
      defaultFieldIds: defaultLayout[panelId] || [],
    }).cards.map((card) => normalizeLayoutCardV3(card));
  }

  const panelLayout = layout?.[panelId];
  if (isPanelLayoutV3(panelLayout)) {
    return normalizePanelLayoutV3(panelLayout, {
      panelId,
      defaultFieldIds: defaultLayout[panelId] || [],
    }).cards.map((card) => normalizeLayoutCardV3(card));
  }

  const fieldIds = Array.isArray(panelLayout)
    ? panelLayout
    : defaultLayout[panelId] || [];

  return normalizePanelLayoutV3(fieldIds, { panelId, defaultFieldIds: fieldIds }).cards;
}

/**
 * Agrupa cards em linhas conforme colSpan (12 = linha inteira, 6 = metade).
 * @param {import('./layoutConfigV3.js').LayoutCardV3[]} cards
 */
export function groupCardsIntoRows(cards = []) {
  const sorted = [...cards].sort((a, b) => a.order - b.order);
  const rows = [];
  let currentRow = [];
  let used = 0;

  sorted.forEach((card) => {
    const span = Math.min(12, Math.max(1, Number(card.colSpan) || 12));
    if (used > 0 && used + span > 12) {
      rows.push(currentRow);
      currentRow = [];
      used = 0;
    }
    currentRow.push({ ...card, colSpan: span });
    used += span;
    if (used >= 12) {
      rows.push(currentRow);
      currentRow = [];
      used = 0;
    }
  });

  if (currentRow.length) rows.push(currentRow);
  return rows;
}

/**
 * Monta layout V3 a partir de cards por painel.
 * @param {Record<string, { cards: import('./layoutConfigV3.js').LayoutCardV3[] }>} cardsByPanel
 */
export function buildLayoutV3FromCards(cardsByPanel = {}) {
  const layoutV3 = {};
  Object.entries(cardsByPanel).forEach(([panelId, panel]) => {
    layoutV3[panelId] = { cards: panel.cards || [] };
  });
  return layoutV3;
}

/**
 * @param {Record<string, { cards: import('./layoutConfigV3.js').LayoutCardV3[] }>} cardsByPanel
 */
export function flattenLayoutFromCards(cardsByPanel = {}) {
  return flattenV3LayoutToV2(buildLayoutV3FromCards(cardsByPanel));
}

/**
 * Inicializa cards por painel a partir de layout flat ou V3.
 */
export function initCardsByPanel({ panels = [], layout = {}, layoutV3 = {}, defaultLayout = {} }) {
  const cardsByPanel = {};
  const panelIds = new Set([
    ...panels.map((p) => p.id),
    ...Object.keys(layout || {}),
    ...Object.keys(layoutV3 || {}),
    ...Object.keys(defaultLayout || {}),
  ]);

  panelIds.forEach((panelId) => {
    cardsByPanel[panelId] = {
      cards: getPanelCardsForRender({ layout, layoutV3, panelId, defaultLayout }),
    };
  });

  return cardsByPanel;
}

export function createNewCardId(panelId, existingCards = []) {
  const base = `card_${panelId}`;
  let index = existingCards.length + 1;
  let id = `${base}_${index}`;
  while (existingCards.some((card) => card.id === id)) {
    index += 1;
    id = `${base}_${index}`;
  }
  return id;
}

export { DEFAULT_VIRTUAL_CARD_ID };
