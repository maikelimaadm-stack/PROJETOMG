import { useQuery } from "@tanstack/react-query";
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
 * Hook padrão para listagens paginadas no servidor (React Query).
 * Mantém página anterior visível durante refetch (placeholderData).
 */
export function useServerListQuery({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = LIST_QUERY_STALE_MS,
  gcTime = LIST_QUERY_GC_MS,
  defaultResponse = DEFAULT_LIST_RESPONSE,
}) {
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    placeholderData: (previous) => previous ?? defaultResponse,
    staleTime,
    gcTime,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const isInitialLoading = query.isLoading && items.length === 0;
  const isPageFetching = query.isFetching && !isInitialLoading;

  return {
    ...query,
    items,
    total,
    isInitialLoading,
    isPageFetching,
    response: query.data ?? defaultResponse,
  };
}

export { DEFAULT_LIST_RESPONSE };
