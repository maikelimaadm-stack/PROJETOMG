import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  LIST_DEFAULT_PAGE_SIZE,
  LIST_QUERY_GC_MS,
  LIST_QUERY_STALE_MS,
} from "@/shared/listing/listQueryConfig";

const DEFAULT_LIST_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  pageSize: LIST_DEFAULT_PAGE_SIZE,
  totalPages: 1,
};

/**
 * Listagem paginada no servidor com acúmulo de páginas (scroll infinito).
 */
export function useServerInfiniteListQuery({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = LIST_QUERY_STALE_MS,
  gcTime = LIST_QUERY_GC_MS,
  defaultResponse = DEFAULT_LIST_RESPONSE,
}) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = Number(lastPage?.page || 1);
      const totalPages = Number(lastPage?.totalPages || 1);
      return page < totalPages ? page + 1 : undefined;
    },
    enabled,
    placeholderData: (previous) => previous,
    staleTime,
    gcTime,
  });

  const items = useMemo(
    () => query.data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [query.data]
  );

  const firstPage = query.data?.pages?.[0] ?? defaultResponse;
  const total = Number(firstPage?.total || 0);

  const isInitialLoading = query.isLoading && items.length === 0;
  const isLoadingMore = query.isFetchingNextPage;
  const isPageFetching = query.isFetching && !isInitialLoading && !isLoadingMore;

  return {
    ...query,
    items,
    total,
    isInitialLoading,
    isLoadingMore,
    isPageFetching,
    hasMore: Boolean(query.hasNextPage),
    response: firstPage,
  };
}

export { DEFAULT_LIST_RESPONSE };
