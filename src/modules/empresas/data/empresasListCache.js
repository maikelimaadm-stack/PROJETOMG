import { createMakListCache } from "@/framework/mak/data/createMakListCache";
import { EMP_INFINITE_PAGE_SIZE, EMPRESAS_LIST_QUERY_KEY } from "@/modules/empresas/data/empresasListConstants";

export { EMPRESAS_LIST_QUERY_KEY, EMP_INFINITE_PAGE_SIZE } from "@/modules/empresas/data/empresasListConstants";

export const patchEmpresasCache = createMakListCache({
  queryKey: EMPRESAS_LIST_QUERY_KEY,
  defaultPageSize: EMP_INFINITE_PAGE_SIZE,
});
