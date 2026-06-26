import { useMakInfiniteListData } from "@/framework/mak/listing/useMakInfiniteListData";
import { readEmpPreferencesText } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { EMPRESAS_LIST_QUERY_KEY } from "@/modules/empresas/data/empresasListCache";

export const EMP_INFINITE_PAGE_SIZE = 100;
export const EMP_LOAD_BATCH_OPTIONS = Object.freeze([100, 200, 300, 400, 500, 1000]);
export const EMP_LOAD_BATCH_STORAGE_KEY = "emp_infinite_batch_size";
export const EMP_MAX_LOADED_ROWS = Math.max(
  1000,
  Number(import.meta.env.VITE_EMP_MAX_LOADED_ROWS) || 10000
);

export function readStoredEmpLoadBatchSize(fallback = EMP_LOAD_BATCH_OPTIONS[0]) {
  const saved = Number(readEmpPreferencesText(EMP_LOAD_BATCH_STORAGE_KEY, null));
  return EMP_LOAD_BATCH_OPTIONS.includes(saved) ? saved : fallback;
}

/** Wrapper Empresas — consumidor de useMakInfiniteListData. */
export function useEmpresasInfiniteData(options) {
  const result = useMakInfiniteListData({
    listQueryKey: EMPRESAS_LIST_QUERY_KEY,
    maxLoadedRows: EMP_MAX_LOADED_ROWS,
    defaultPageSize: EMP_INFINITE_PAGE_SIZE,
    ...options,
  });

  return {
    empresas: result.records,
    empresasPages: result.pages,
    empresasResponseTotal: result.responseTotal,
    empresasLoading: result.recordsLoading,
    empresasFetching: result.recordsFetching,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    loadedPagesCount: result.loadedPagesCount,
    canLoadMoreRows: result.canLoadMoreRows,
    loadedRowsLimitReached: result.loadedRowsLimitReached,
    maxLoadedRows: result.maxLoadedRows,
    hasNextEmpresasPage: result.hasNextPage,
    isFetchingNextEmpresasPage: result.isFetchingNextPage,
    handleLoadMoreEmpresas: result.handleLoadMore,
  };
}
