import { getCardRowsForRender } from "@/framework/cadastro/layouts/empFormLayoutRows.js";

const cardRowsCache = new Map();
const MAX_CACHE_ENTRIES = 500;

function hashFieldSizes(fieldSizes = {}) {
  const keys = Object.keys(fieldSizes).sort();
  if (!keys.length) return "";
  return keys.map((k) => `${k}:${fieldSizes[k]}`).join("|");
}

function hashCard(card) {
  const ids = Array.isArray(card?.fieldIds) ? card.fieldIds.join(",") : "";
  const rows = Array.isArray(card?.rows)
    ? card.rows.map((r) => (r.fieldIds || []).join(".")).join(";")
    : "";
  return `${card?.id || ""}|${card?.colSpan || 12}|${ids}|${rows}`;
}

/**
 * Cache de linhas normalizadas por card + largura do container.
 */
export function getCachedCardRows(card, fieldSizes = {}, fields = [], containerWidthPx = 0) {
  const widthKey = Math.round(Number(containerWidthPx) || 0);
  const cacheKey = `${hashCard(card)}#${hashFieldSizes(fieldSizes)}#${widthKey}`;

  if (cardRowsCache.has(cacheKey)) {
    return cardRowsCache.get(cacheKey);
  }

  const rows = getCardRowsForRender(card, fieldSizes, fields, widthKey || undefined);

  if (cardRowsCache.size >= MAX_CACHE_ENTRIES) {
    const first = cardRowsCache.keys().next().value;
    cardRowsCache.delete(first);
  }
  cardRowsCache.set(cacheKey, rows);
  return rows;
}

export function clearLayoutRenderCache() {
  cardRowsCache.clear();
}
