/** Padrão ERP MAK — paginação server-side em listagens. */
export const LIST_PAGE_SIZE_OPTIONS = Object.freeze([25, 50, 100, 150, 200]);

export const LIST_DEFAULT_PAGE_SIZE = 50;

/** Limite máximo de registros por página (server e client). */
export const LIST_MAX_PAGE_SIZE = 200;

/** @deprecated Use LIST_DEFAULT_PAGE_SIZE — mantido para compatibilidade de imports legados. */
export const EMP_LIST_CHUNK_SIZE = LIST_DEFAULT_PAGE_SIZE;

export const LIST_SEARCH_DEBOUNCE_MS = 350;

export const LIST_QUERY_STALE_MS = 30_000;

export const LIST_QUERY_GC_MS = 5 * 60_000;

export function clampListPageSize(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return LIST_DEFAULT_PAGE_SIZE;
  const rounded = Math.floor(parsed);
  if (rounded <= LIST_PAGE_SIZE_OPTIONS[0]) return LIST_PAGE_SIZE_OPTIONS[0];
  if (rounded >= LIST_MAX_PAGE_SIZE) return LIST_MAX_PAGE_SIZE;
  return LIST_PAGE_SIZE_OPTIONS.includes(rounded)
    ? rounded
    : LIST_PAGE_SIZE_OPTIONS.reduce((best, size) =>
        Math.abs(size - rounded) < Math.abs(best - rounded) ? size : best
      );
}

export function readStoredListPageSize(storageKey, fallback = LIST_DEFAULT_PAGE_SIZE) {
  if (typeof window === "undefined") return fallback;
  const saved = Number(window.localStorage.getItem(storageKey));
  return LIST_PAGE_SIZE_OPTIONS.includes(saved) ? saved : fallback;
}
