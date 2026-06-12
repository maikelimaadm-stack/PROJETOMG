import { QueryClient } from "@tanstack/react-query";
import { LIST_QUERY_STALE_MS } from "@/shared/listing/listQueryConfig";

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: LIST_QUERY_STALE_MS,
    },
  },
});
