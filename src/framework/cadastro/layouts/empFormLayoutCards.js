import {
  DEFAULT_VIRTUAL_CARD_ID,
  normalizePanelLayoutV3,
  normalizeLayoutCardV3,
  isPanelLayoutV3,
  flattenV3LayoutToV2,
  coerceLayoutToV3,
  getPanelFieldIdsFromLayout,
} from "./layoutConfigV3.js";

/**
 * Cards do painel para renderização (layout canônico V3).
 * @param {{ layout?: Record<string, unknown>, panelId: string, defaultLayout?: Record<string, string[]> }} params
 */
const resolveDefaultFieldIds = (defaultLayout, panelId) => {
  const raw = defaultLayout?.[panelId];
  if (Array.isArray(raw)) return raw;
  return getPanelFieldIdsFromLayout(defaultLayout, panelId);
};

export function getPanelCardsForRender({ layout = {}, panelId, defaultLayout = {} }) {
  const layoutV3 = coerceLayoutToV3(layout);
  const panelV3 = layoutV3[panelId];
  const defaultFieldIds = resolveDefaultFieldIds(defaultLayout, panelId);

  if (panelV3 && isPanelLayoutV3(panelV3)) {
    return normalizePanelLayoutV3(panelV3, {
      panelId,
      defaultFieldIds,
    }).cards.map((card) => normalizeLayoutCardV3(card));
  }

  return normalizePanelLayoutV3(defaultFieldIds, { panelId, defaultFieldIds }).cards;
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
    layoutV3[panelId] = {
      cards: (panel.cards || []).map((card, index) => normalizeLayoutCardV3(card, index)),
    };
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
 * Inicializa cards por painel a partir do layout V3 canônico.
 */
export function initCardsByPanel({ panels = [], layout = {}, defaultLayout = {} }) {
  const layoutV3 = coerceLayoutToV3(layout);
  const cardsByPanel = {};
  const panelIds = new Set([
    ...panels.map((p) => p.id),
    ...Object.keys(layoutV3 || {}),
    ...Object.keys(defaultLayout || {}),
  ]);

  panelIds.forEach((panelId) => {
    cardsByPanel[panelId] = {
      cards: getPanelCardsForRender({ layout: layoutV3, panelId, defaultLayout }),
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
