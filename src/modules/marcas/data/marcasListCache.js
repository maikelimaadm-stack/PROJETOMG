import { createMakListCache } from "@/framework/mak/data/createMakListCache.js";

export const MARCAS_LIST_QUERY_KEY = ["mar-cadastro"];

export const patchMarcasCache = createMakListCache({
  queryKey: MARCAS_LIST_QUERY_KEY,
  defaultPageSize: 50,
});
