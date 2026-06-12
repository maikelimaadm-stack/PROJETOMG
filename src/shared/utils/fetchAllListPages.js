import { LIST_MAX_PAGE_SIZE } from "@/shared/listing/listQueryConfig";

const DEFAULT_MAX_PAGES = 500;

/**
 * Busca todas as páginas de uma listagem server-side (para exportação).
 * Nunca carrega tudo de uma vez — itera pageSize=200 por página.
 */
export async function fetchAllListPages({
  listPage,
  params = {},
  pageSize = LIST_MAX_PAGE_SIZE,
  maxPages = DEFAULT_MAX_PAGES,
  onProgress,
}) {
  if (typeof listPage !== "function") {
    throw new Error("fetchAllListPages requer listPage.");
  }

  const allItems = [];
  let page = 1;
  let totalPages = 1;
  let total = 0;

  while (page <= totalPages && page <= maxPages) {
    const result = await listPage({ ...params, page, pageSize });
    const items = result?.items || [];
    allItems.push(...items);
    total = Number(result?.total || allItems.length);
    totalPages = Number(result?.totalPages || 1);
    onProgress?.({
      page,
      totalPages,
      loaded: allItems.length,
      total,
    });
    if (items.length === 0) break;
    page += 1;
  }

  return { items: allItems, total: total || allItems.length };
}
