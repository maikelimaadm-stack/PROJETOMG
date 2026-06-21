import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

export const EMP_INFINITE_PAGE_SIZE = 100;
export const EMP_LOAD_BATCH_OPTIONS = Object.freeze([100, 200, 300, 400, 500, 1000]);
export const EMP_LOAD_BATCH_STORAGE_KEY = "emp_infinite_batch_size";
export const EMP_MAX_LOADED_ROWS = Math.max(
  1000,
  Number(import.meta.env.VITE_EMP_MAX_LOADED_ROWS) || 10000
);

export function readStoredEmpLoadBatchSize(fallback = EMP_LOAD_BATCH_OPTIONS[0]) {
  if (typeof window === "undefined") return fallback;
  const saved = Number(window.localStorage.getItem(EMP_LOAD_BATCH_STORAGE_KEY));
  return EMP_LOAD_BATCH_OPTIONS.includes(saved) ? saved : fallback;
}

const DEFAULT_EMPRESAS_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  pageSize: EMP_INFINITE_PAGE_SIZE,
  totalPages: 1,
};

export function useEmpresasInfiniteData({
  repository,
  searchTerm,
  querySort,
  listFilters,
  searchFavoritesOnly,
  favoriteIds,
  queryPage,
  setQueryPage,
  loadBatchSize = EMP_LOAD_BATCH_OPTIONS[0],
}) {
  const listFiltersKey = useMemo(() => JSON.stringify(listFilters ?? {}), [listFilters]);
  const loadBatchSizeRef = useRef(loadBatchSize);
  loadBatchSizeRef.current = loadBatchSize;

  const {
    data: empresasPagesData,
    fetchNextPage: fetchNextEmpresasPage,
    hasNextPage: hasNextEmpresasPage,
    isFetchingNextPage: isFetchingNextEmpresasPage,
    isPending: isEmpresasPending,
    isFetching: isEmpresasFetchingAny,
    isLoading: isEmpresasLoadingCompat,
  } = useInfiniteQuery({
    queryKey: [
      "emp-cadastro",
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
        typeof pageParam === "number"
          ? pageParam
          : Number(pageParam?.page) || 1;
      const cursor = typeof pageParam === "object" ? pageParam?.cursor || null : null;
      if (searchFavoritesOnly && favoriteIds.length === 0) {
        return {
          ...DEFAULT_EMPRESAS_RESPONSE,
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

  const empresasPages = empresasPagesData?.pages || [];
  const empresas = useMemo(() => {
    const seen = new Set();
    const merged = [];
    empresasPages.forEach((page) => {
      (page?.items || []).forEach((item) => {
        if (merged.length >= EMP_MAX_LOADED_ROWS) return;
        if (!item?.id || seen.has(item.id)) return;
        seen.add(item.id);
        merged.push(item);
      });
    });
    return merged;
  }, [empresasPages]);
  const empresasResponseTotal = Number(empresasPages[0]?.total || 0);
  const empresasLoading =
    (isEmpresasPending || isEmpresasLoadingCompat) && empresas.length === 0;
  const empresasFetching = isEmpresasFetchingAny && !empresasLoading;
  const isLoading = empresasLoading;
  const isFetching = isEmpresasFetchingAny;
  const loadedPagesCount = Math.max(
    1,
    empresasPages.length || (empresasLoading ? 0 : 1)
  );
  const loadedRowsLimitReached = empresas.length >= EMP_MAX_LOADED_ROWS;
  const canLoadMoreRows = Boolean(hasNextEmpresasPage) && !loadedRowsLimitReached;

  const handleLoadMoreEmpresas = useCallback(() => {
    if (!canLoadMoreRows || isFetchingNextEmpresasPage || empresasLoading) return;
    void fetchNextEmpresasPage();
  }, [canLoadMoreRows, isFetchingNextEmpresasPage, empresasLoading, fetchNextEmpresasPage]);

  useEffect(() => {
    if (hasNextEmpresasPage) return;
    if (queryPage > loadedPagesCount) {
      setQueryPage(loadedPagesCount);
    }
  }, [hasNextEmpresasPage, queryPage, loadedPagesCount, setQueryPage]);

  return {
    empresas,
    empresasPages,
    empresasResponseTotal,
    empresasLoading,
    empresasFetching,
    isLoading,
    isFetching,
    loadedPagesCount,
    canLoadMoreRows,
    loadedRowsLimitReached,
    maxLoadedRows: EMP_MAX_LOADED_ROWS,
    hasNextEmpresasPage,
    isFetchingNextEmpresasPage,
    handleLoadMoreEmpresas,
  };
}
