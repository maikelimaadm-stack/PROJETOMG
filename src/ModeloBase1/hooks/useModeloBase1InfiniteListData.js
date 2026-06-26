import { useMakInfiniteListData } from "@/framework/mak/listing/useMakInfiniteListData";
import { useModeloBase1Config } from "@/ModeloBase1/config";

/**
 * Listagem infinita nativa do ModeloBase1 — config-driven por moduleId/runtime.
 */
export function useModeloBase1InfiniteListData(options = {}) {
  const config = useModeloBase1Config();
  const data = config.data ?? {};

  const result = useMakInfiniteListData({
    listQueryKey: data.listQueryKey ?? [config.moduleId, "cadastro"],
    maxLoadedRows: data.maxLoadedRows,
    defaultPageSize: data.infinitePageSize ?? 100,
    ...options,
  });

  return {
    records: result.records,
    recordsPages: result.pages,
    recordsResponseTotal: result.responseTotal,
    recordsLoading: result.recordsLoading,
    recordsFetching: result.recordsFetching,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    loadedPagesCount: result.loadedPagesCount,
    canLoadMoreRows: result.canLoadMoreRows,
    loadedRowsLimitReached: result.loadedRowsLimitReached,
    maxLoadedRows: result.maxLoadedRows,
    hasNextRecordsPage: result.hasNextPage,
    isFetchingNextRecordsPage: result.isFetchingNextPage,
    handleLoadMoreRecords: result.handleLoadMore,
  };
}

export default useModeloBase1InfiniteListData;
