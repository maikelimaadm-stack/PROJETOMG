/**
 * Atualiza cache de listagem infinita (React Query) preservando paginação carregada.
 * Genérico para qualquer módulo de cadastro com shape pages/items ou items flat.
 */
export function patchInfiniteListCache(
  queryClient,
  { queryKey, defaultPageSize, updater }
) {
  queryClient.setQueriesData({ queryKey }, (previous) => {
    if (previous?.items) {
      return updater(previous);
    }

    if (!Array.isArray(previous?.pages)) {
      return previous;
    }

    const pageSize = Number(previous.pages[0]?.pageSize) || defaultPageSize;
    const mergedItems = previous.pages.flatMap((page) => page?.items || []);
    const mergedTotal = Number(previous.pages[0]?.total ?? mergedItems.length);
    const nextMerged = updater({
      items: mergedItems,
      total: mergedTotal,
      page: 1,
      pageSize,
      totalPages: Math.max(1, Math.ceil(mergedTotal / pageSize)),
    });

    if (!nextMerged?.items) return previous;

    const loadedPages = Math.max(previous.pages.length, 1);
    const maxLoadedItems = loadedPages * pageSize;
    const slicedItems = nextMerged.items.slice(0, maxLoadedItems);
    const total = Number(nextMerged.total ?? slicedItems.length);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const nextPages = Array.from({ length: loadedPages }, (_, index) => {
      const start = index * pageSize;
      const end = start + pageSize;
      const basePage = previous.pages[index] || {};
      return {
        ...basePage,
        items: slicedItems.slice(start, end),
        page: index + 1,
        pageSize,
        total,
        totalPages,
      };
    });
    const existingParams = Array.isArray(previous.pageParams)
      ? previous.pageParams.slice(0, loadedPages)
      : [];
    const pageParams =
      existingParams.length === loadedPages
        ? existingParams
        : Array.from({ length: loadedPages }, (_, index) => index + 1);

    return {
      ...previous,
      pages: nextPages,
      pageParams,
    };
  });
}
