import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

const DEFAULT_LIST_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

/**
 * Listagem infinita genérica — infraestrutura MAK reutilizável por módulo.
 */
export function useMakInfiniteListData({
  listQueryKey,
  repository,
  searchTerm,
  querySort,
  listFilters,
  searchFavoritesOnly,
  favoriteIds,
  queryPage,
  setQueryPage,
  loadBatchSize = 100,
  maxLoadedRows = 10000,
  defaultPageSize = 100,
}) {
  const listFiltersKey = useMemo(() => JSON.stringify(listFilters ?? {}), [listFilters]);
  const loadBatchSizeRef = useRef(loadBatchSize);
  loadBatchSizeRef.current = loadBatchSize;

  const {
    data: pagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isFetching: isFetchingAny,
    isLoading: isLoadingCompat,
  } = useInfiniteQuery({
    queryKey: [
      ...listQueryKey,
      "infinite",
      loadBatchSize,
      searchTerm,
      querySort.key,
      querySort.direction,
      listFiltersKey,
    ],
    queryFn: async ({ pageParam = { page: 1, cursor: null } }) => {
      const batchSize = loadBatchSizeRef.current;
      const trimmedSearch = normalizeSearchQuery(searchTerm);
      const pageNumber =
        typeof pageParam === "number" ? pageParam : Number(pageParam?.page) || 1;
      const cursor = typeof pageParam === "object" ? pageParam?.cursor || null : null;
      if (searchFavoritesOnly && favoriteIds.length === 0) {
        return {
          ...DEFAULT_LIST_RESPONSE,
          page: pageNumber,
          pageSize: batchSize,
          totalPages: 1,
          nextCursor: null,
        };
      }
      return repository.listPage({
        page: pageNumber,
        pageSize: batchSize,
        search: trimmedSearch,
        sortBy: querySort.key,
        sortDir: querySort.direction,
        filters: listFilters,
        cursor,
        includeTotal: pageNumber === 1,
      });
    },
    initialPageParam: { page: 1, cursor: null },
    getNextPageParam: (lastPage) => {
      if (lastPage?.nextCursor) {
        return {
          page: (Number(lastPage.page) || 1) + 1,
          cursor: lastPage.nextCursor,
        };
      }
      return lastPage?.page < lastPage?.totalPages ? lastPage.page + 1 : undefined;
    },
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const pages = pagesData?.pages || [];
  const records = useMemo(() => {
    const seen = new Set();
    const merged = [];
    pages.forEach((page) => {
      (page?.items || []).forEach((item) => {
        if (merged.length >= maxLoadedRows) return;
        if (!item?.id || seen.has(item.id)) return;
        seen.add(item.id);
        merged.push(item);
      });
    });
    return merged;
  }, [pages, maxLoadedRows]);

  const responseTotal = Number(pages[0]?.total || 0);
  const recordsLoading = (isPending || isLoadingCompat) && records.length === 0;
  const recordsFetching = isFetchingAny && !recordsLoading;
  const isLoading = recordsLoading;
  const isFetching = isFetchingAny;
  const loadedPagesCount = Math.max(1, pages.length || (recordsLoading ? 0 : 1));
  const loadedRowsLimitReached = records.length >= maxLoadedRows;
  const canLoadMoreRows = Boolean(hasNextPage) && !loadedRowsLimitReached;

  const handleLoadMore = useCallback(() => {
    if (!canLoadMoreRows || isFetchingNextPage || recordsLoading) return;
    void fetchNextPage();
  }, [canLoadMoreRows, isFetchingNextPage, recordsLoading, fetchNextPage]);

  useEffect(() => {
    if (hasNextPage) return;
    if (queryPage > loadedPagesCount) {
      setQueryPage(loadedPagesCount);
    }
  }, [hasNextPage, queryPage, loadedPagesCount, setQueryPage]);

  return {
    records,
    pages,
    responseTotal,
    recordsLoading,
    recordsFetching,
    isLoading,
    isFetching,
    loadedPagesCount,
    canLoadMoreRows,
    loadedRowsLimitReached,
    maxLoadedRows,
    hasNextPage,
    isFetchingNextPage,
    handleLoadMore,
    defaultPageSize,
  };
}
