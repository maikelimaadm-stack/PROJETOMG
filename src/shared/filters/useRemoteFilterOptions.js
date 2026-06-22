import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildEmpresaColumnFilters, mergeEmpresaListFilters } from "@/shared/listing/buildEmpresaListFilters";

export const FILTER_OPTIONS_PAGE_SIZE = 100;
export const FILTER_OPTIONS_REQUEST_TIMEOUT_MS = 45_000;
export const FILTER_OPTIONS_MODE_GLOBAL = "global";
export const FILTER_OPTIONS_MODE_CASCADE = "cascade";
export const REMOTE_DISTINCT_FILTER_TYPES = new Set(["text", "enum", "number", "money", "date"]);

export const normalizeFilterOptionsMode = (mode) =>
  String(mode || FILTER_OPTIONS_MODE_GLOBAL).toLowerCase() === FILTER_OPTIONS_MODE_CASCADE
    ? FILTER_OPTIONS_MODE_CASCADE
    : FILTER_OPTIONS_MODE_GLOBAL;

export const mergeFilterOptionsWithSelected = (options = [], selected = []) => {
  const merged = [];
  const seen = new Set();
  [...options, ...selected].forEach((value) => {
    const normalized = String(value ?? "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    merged.push(normalized);
  });
  return merged;
};

export const normalizeOptionValues = (values = []) =>
  values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

export function useRemoteFilterOptions({
  enabled = false,
  columnId = "",
  filterType = "text",
  optionSearch = "",
  selectedValues = [],
  onRequestDistinctColumnValues = null,
  contextFilters = undefined,
  cascadeFilters = undefined,
  optionsMode = FILTER_OPTIONS_MODE_CASCADE,
  serverSearchTerm = "",
}) {
  const normalizedFilterOptionsMode = normalizeFilterOptionsMode(optionsMode);
  const shouldUseRemote =
    enabled &&
    Boolean(columnId) &&
    typeof onRequestDistinctColumnValues === "function" &&
    REMOTE_DISTINCT_FILTER_TYPES.has(filterType);

  const filterOptionsCacheRef = useRef(new Map());
  const filterOptionsRequestIdRef = useRef(0);
  const activeFilterColumnRef = useRef("");
  const filterOptionsInFlightCountRef = useRef(0);

  const [remoteState, setRemoteState] = useState({
    columnId: "",
    cacheKey: "",
    items: [],
    nextCursor: null,
    loadingInitial: false,
    loadingMore: false,
  });

  useEffect(() => {
    activeFilterColumnRef.current = enabled ? columnId : "";
    if (!enabled) {
      filterOptionsRequestIdRef.current += 1;
      filterOptionsInFlightCountRef.current = 0;
      setRemoteState({
        columnId: "",
        cacheKey: "",
        items: [],
        nextCursor: null,
        loadingInitial: false,
        loadingMore: false,
      });
    }
  }, [enabled, columnId]);

  const resolveDistinctFilters = useCallback(() => {
    const baseContext =
      contextFilters && typeof contextFilters === "object" ? contextFilters : {};
    if (normalizedFilterOptionsMode !== FILTER_OPTIONS_MODE_CASCADE) {
      return baseContext;
    }
    const cascaded =
      cascadeFilters && typeof cascadeFilters === "object" ? cascadeFilters : undefined;
    return mergeEmpresaListFilters(baseContext, cascaded);
  }, [normalizedFilterOptionsMode, contextFilters, cascadeFilters]);

  const remoteRequest = useMemo(() => {
    if (!shouldUseRemote || !columnId) return null;
    const trimmedSearch = String(optionSearch || "").trim();
    const requestFilters = resolveDistinctFilters();
    const search =
      normalizedFilterOptionsMode === FILTER_OPTIONS_MODE_CASCADE
        ? String(serverSearchTerm || "").trim()
        : "";
    const params = {
      column: columnId,
      optionSearch: trimmedSearch,
      q: trimmedSearch,
      search,
      filters: requestFilters,
      limit: FILTER_OPTIONS_PAGE_SIZE,
      cursor: null,
    };
    const cacheKey = JSON.stringify({
      mode: normalizedFilterOptionsMode,
      ...params,
    });
    return { cacheKey, params };
  }, [
    shouldUseRemote,
    columnId,
    optionSearch,
    resolveDistinctFilters,
    normalizedFilterOptionsMode,
    serverSearchTerm,
  ]);

  const fetchRemoteFilterOptions = useCallback(
    async ({ cacheKey, params, append = false, baseItems = [] }) => {
      if (typeof onRequestDistinctColumnValues !== "function" || !params?.column) return;
      if (append && filterOptionsInFlightCountRef.current > 0) return;
      const requestId = ++filterOptionsRequestIdRef.current;
      const expectedColumn = params.column;
      filterOptionsInFlightCountRef.current += 1;
      setRemoteState((prev) => ({
        columnId: expectedColumn,
        cacheKey,
        items: append ? prev.items : prev.columnId === expectedColumn && prev.cacheKey === cacheKey ? prev.items : [],
        nextCursor: append ? prev.nextCursor : null,
        loadingInitial: !append,
        loadingMore: append,
      }));
      try {
        const payload = await Promise.race([
          onRequestDistinctColumnValues(params),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), FILTER_OPTIONS_REQUEST_TIMEOUT_MS)
          ),
        ]);
        if (
          requestId !== filterOptionsRequestIdRef.current ||
          activeFilterColumnRef.current !== expectedColumn
        ) {
          return;
        }
        const fetchedItems = normalizeOptionValues(payload?.items || []);
        const nextCursor = payload?.nextCursor || null;
        const mergedItems = append
          ? mergeFilterOptionsWithSelected(baseItems, fetchedItems)
          : fetchedItems;
        const noProgressOnAppend = append && mergedItems.length <= (baseItems?.length || 0);
        const resolvedNextCursor = noProgressOnAppend ? null : nextCursor;
        filterOptionsCacheRef.current.set(cacheKey, {
          items: mergedItems,
          nextCursor: resolvedNextCursor,
        });
        setRemoteState({
          columnId: expectedColumn,
          cacheKey,
          items: mergedItems,
          nextCursor: resolvedNextCursor,
          loadingInitial: false,
          loadingMore: false,
        });
      } catch {
        if (
          requestId !== filterOptionsRequestIdRef.current ||
          activeFilterColumnRef.current !== expectedColumn
        ) {
          return;
        }
        setRemoteState((prev) => ({
          ...prev,
          nextCursor: append ? null : prev.nextCursor,
          loadingInitial: false,
          loadingMore: false,
        }));
      } finally {
        filterOptionsInFlightCountRef.current = Math.max(
          0,
          filterOptionsInFlightCountRef.current - 1
        );
      }
    },
    [onRequestDistinctColumnValues]
  );

  useEffect(() => {
    if (!remoteRequest || !shouldUseRemote) return;
    const cached = filterOptionsCacheRef.current.get(remoteRequest.cacheKey);
    if (cached && Array.isArray(cached.items)) {
      setRemoteState({
        columnId,
        cacheKey: remoteRequest.cacheKey,
        items: cached.items,
        nextCursor: cached.nextCursor || null,
        loadingInitial: false,
        loadingMore: false,
      });
      return;
    }
    void fetchRemoteFilterOptions({
      cacheKey: remoteRequest.cacheKey,
      params: remoteRequest.params,
      append: false,
    });
  }, [remoteRequest, shouldUseRemote, columnId, fetchRemoteFilterOptions]);

  const handleLoadMore = useCallback(() => {
    if (!remoteRequest) return;
    if (filterOptionsInFlightCountRef.current > 0) return;
    if (remoteState.loadingMore || remoteState.loadingInitial) return;
    if (!remoteState.nextCursor) return;
    void fetchRemoteFilterOptions({
      cacheKey: remoteRequest.cacheKey,
      params: {
        ...remoteRequest.params,
        cursor: remoteState.nextCursor,
      },
      append: true,
      baseItems: remoteState.items,
    });
  }, [
    remoteRequest,
    remoteState.loadingMore,
    remoteState.loadingInitial,
    remoteState.nextCursor,
    remoteState.items,
    fetchRemoteFilterOptions,
  ]);

  const listOptions = useMemo(() => {
    if (!shouldUseRemote || remoteState.columnId !== columnId) return [];
    return mergeFilterOptionsWithSelected(remoteState.items, selectedValues);
  }, [shouldUseRemote, remoteState.columnId, remoteState.items, columnId, selectedValues]);

  const searchLoading =
    shouldUseRemote &&
    remoteState.columnId === columnId &&
    (remoteState.loadingInitial || remoteState.loadingMore);

  const hasMoreOptions =
    shouldUseRemote &&
    remoteState.columnId === columnId &&
    Boolean(remoteState.nextCursor);

  const loadingMoreOptions =
    shouldUseRemote &&
    remoteState.columnId === columnId &&
    remoteState.loadingMore;

  return {
    shouldUseRemote,
    listOptions,
    searchLoading,
    hasMoreOptions,
    loadingMoreOptions,
    onLoadMoreOptions: handleLoadMore,
  };
}

export function buildPanelCascadeFilters({
  activeFieldKey,
  appliedPanelValues = {},
  columnFilters = {},
  buildPanelFilters,
}) {
  const otherPanelValues = Object.fromEntries(
    Object.entries(appliedPanelValues || {}).filter(([key]) => key !== activeFieldKey)
  );
  const panelFilters =
    typeof buildPanelFilters === "function"
      ? buildPanelFilters(otherPanelValues)
      : undefined;
  const tableFilters = buildEmpresaColumnFilters(columnFilters);
  return mergeEmpresaListFilters(panelFilters, tableFilters);
}

export function buildColumnCascadeFilters({
  activeColumnId,
  filtrosColunas = {},
  contextFilters = undefined,
}) {
  const cascadedColumnFilters = Object.entries(filtrosColunas || {}).reduce((acc, [columnId, value]) => {
    if (columnId === activeColumnId) return acc;
    acc[columnId] = value;
    return acc;
  }, {});
  const cascadedFilters = buildEmpresaColumnFilters(cascadedColumnFilters);
  return mergeEmpresaListFilters(contextFilters, cascadedFilters);
}
