import { createMakListCache } from "@/framework/mak/data/createMakListCache.js";

export const CADCPS_LIST_QUERY_KEY = ["cps-cadastro"];

export const patchCadcpsCache = createMakListCache({
  queryKey: CADCPS_LIST_QUERY_KEY,
  defaultPageSize: 50,
});
