import { createMakListCache } from "@/framework/mak/data/createMakListCache";
import { EMP_INFINITE_PAGE_SIZE } from "@/modules/empresas/hooks/useEmpresasInfiniteData";

export const EMPRESAS_LIST_QUERY_KEY = ["emp-cadastro"];

export const patchEmpresasCache = createMakListCache({
  queryKey: EMPRESAS_LIST_QUERY_KEY,
  defaultPageSize: EMP_INFINITE_PAGE_SIZE,
});
