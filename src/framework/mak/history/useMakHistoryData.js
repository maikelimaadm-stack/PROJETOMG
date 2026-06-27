import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { createMakHistoryEngine } from "./createMakHistoryEngine.js";
import { buildMakHistoryMetadata } from "./buildMakHistoryMetadata.js";
import { createMakHistoryNoopBackendAdapter } from "./createMakHistoryBackendAdapter.js";

export function buildMakHistoryQueryKey(moduleId, recordId, entityName) {
  return ["mak-history", moduleId, entityName, recordId];
}

/**
 * Hook de dados do History Engine — consumido por MakMasterHistory.
 */
export function useMakHistoryData({
  moduleId,
  entityName = null,
  recordId = null,
  recordCode = null,
  enabled = false,
  metadata = null,
  backendAdapter = null,
} = {}) {
  const engine = useMemo(
    () =>
      createMakHistoryEngine({
        moduleId,
        entityName,
        metadata: metadata ?? buildMakHistoryMetadata(),
        backendAdapter: backendAdapter ?? createMakHistoryNoopBackendAdapter(),
      }),
    [backendAdapter, entityName, metadata, moduleId]
  );

  const query = useQuery({
    queryKey: buildMakHistoryQueryKey(moduleId, recordId, entityName),
    queryFn: () =>
      engine.fetchHistory({
        entityName,
        recordId,
        recordCode,
      }),
    enabled: Boolean(enabled && moduleId && (recordId || recordCode)),
    staleTime: 30_000,
    retry: false,
  });

  const entries = query.data?.entries ?? [];
  const backendPending = Boolean(query.data?.backendPending ?? !engine.isBackendAvailable());

  return {
    engine,
    entries,
    backendPending,
    isBackendAvailable: engine.isBackendAvailable(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useMakHistoryData;
