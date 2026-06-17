import { useCallback, useEffect, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

export const EMP_INFINITE_PAGE_SIZE = 100;
export const EMP_INFINITE_MAX_ROWS = Math.max(
  EMP_INFINITE_PAGE_SIZE,
  Number(import.meta.env.VITE_EMP_INFINITE_MAX_ROWS || 3000)
);

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
}) {
  const listFiltersKey = useMemo(() => JSON.stringify(listFilters ?? {}), [listFilters]);

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
      EMP_INFINITE_PAGE_SIZE,
      searchTerm,
      querySort.key,
      querySort.direction,
      listFiltersKey,
    ],
    queryFn: async ({ pageParam = { page: 1, cursor: null } }) => {
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
          pageSize: EMP_INFINITE_PAGE_SIZE,
          totalPages: 1,
          nextCursor: null,
        };
      }
      return repository.listPage({
        page: pageNumber,
        pageSize: EMP_INFINITE_PAGE_SIZE,
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
        if (!item?.id || seen.has(item.id)) return;
        seen.add(item.id);
        merged.push(item);
      });
    });
    return merged.slice(0, EMP_INFINITE_MAX_ROWS);
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
  const canLoadMoreRows = empresas.length < EMP_INFINITE_MAX_ROWS;

  const handleLoadMoreEmpresas = useCallback(() => {
    if (!hasNextEmpresasPage || !canLoadMoreRows || isFetchingNextEmpresasPage || empresasLoading) return;
    void fetchNextEmpresasPage();
  }, [
    hasNextEmpresasPage,
    canLoadMoreRows,
    isFetchingNextEmpresasPage,
    empresasLoading,
    fetchNextEmpresasPage,
  ]);

  useEffect(() => {
    if (queryPage <= loadedPagesCount) return;
    if (!hasNextEmpresasPage || !canLoadMoreRows || isFetchingNextEmpresasPage || empresasLoading) return;
    void fetchNextEmpresasPage();
  }, [
    queryPage,
    loadedPagesCount,
    hasNextEmpresasPage,
    canLoadMoreRows,
    isFetchingNextEmpresasPage,
    empresasLoading,
    fetchNextEmpresasPage,
  ]);

  useEffect(() => {
    if (canLoadMoreRows) return;
    if (queryPage > loadedPagesCount) {
      setQueryPage(loadedPagesCount);
    }
  }, [canLoadMoreRows, queryPage, loadedPagesCount, setQueryPage]);

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
    hasNextEmpresasPage,
    isFetchingNextEmpresasPage,
    handleLoadMoreEmpresas,
  };
}
