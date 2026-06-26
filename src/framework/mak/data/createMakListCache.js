import { patchInfiniteListCache } from "./patchInfiniteListCache.js";

/**
 * Factory para patch otimista de cache de listagem por módulo.
 * @param {{ queryKey: unknown[], defaultPageSize: number }} config
 */
export function createMakListCache({ queryKey, defaultPageSize }) {
  return function patchMakListCache(queryClient, updater) {
    patchInfiniteListCache(queryClient, {
      queryKey,
      defaultPageSize,
      updater,
    });
  };
}
