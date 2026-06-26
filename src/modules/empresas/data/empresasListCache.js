import { patchInfiniteListCache } from "@/framework/mak/data/patchInfiniteListCache";
import { EMP_INFINITE_PAGE_SIZE } from "@/modules/empresas/hooks/useEmpresasInfiniteData";

export const EMPRESAS_LIST_QUERY_KEY = ["emp-cadastro"];

export function patchEmpresasCache(queryClient, updater) {
  patchInfiniteListCache(queryClient, {
    queryKey: EMPRESAS_LIST_QUERY_KEY,
    defaultPageSize: EMP_INFINITE_PAGE_SIZE,
    updater,
  });
}
