import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Navegação prev/next entre registros respeitando paginação server-side.
 * Calcula índice global (0..total-1) e troca de página quando necessário.
 */
export function useServerRecordNavigation({
  items = [],
  total = 0,
  page = 1,
  pageSize = 50,
  onPageChange,
  pinnedRecord = null,
  disabled = false,
  cumulativeMode = false,
  hasMore = false,
  onLoadMore = null,
}) {
  const [localIndex, setLocalIndex] = useState(0);
  const pendingLocalIndexRef = useRef(null);

  const effectiveTotal = pinnedRecord ? 1 : Math.max(0, Number(total) || 0);
  const effectiveItems = pinnedRecord ? [pinnedRecord] : items;
  const safePageSize = Math.max(1, Number(pageSize) || 50);

  const globalIndex = useMemo(() => {
    if (effectiveTotal === 0) return 0;
    if (pinnedRecord) return 0;
    if (cumulativeMode) {
      return Math.min(Math.max(localIndex, 0), effectiveTotal - 1);
    }
    const raw = (Math.max(1, Number(page) || 1) - 1) * safePageSize + localIndex;
    return Math.min(Math.max(raw, 0), effectiveTotal - 1);
  }, [effectiveTotal, pinnedRecord, cumulativeMode, page, safePageSize, localIndex]);

  useEffect(() => {
    if (cumulativeMode) return;
    if (pendingLocalIndexRef.current == null) return;
    const targetLocal = pendingLocalIndexRef.current;
    pendingLocalIndexRef.current = null;
    const maxLocal = Math.max(effectiveItems.length - 1, 0);
    setLocalIndex(Math.min(Math.max(targetLocal, 0), maxLocal));
  }, [cumulativeMode, effectiveItems, page]);

  useEffect(() => {
    if (!cumulativeMode || pendingLocalIndexRef.current == null) return;
    const targetLocal = pendingLocalIndexRef.current;
    if (targetLocal < effectiveItems.length) {
      pendingLocalIndexRef.current = null;
      setLocalIndex(targetLocal);
    } else if (hasMore) {
      onLoadMore?.();
    }
  }, [cumulativeMode, effectiveItems.length, hasMore, onLoadMore]);

  useEffect(() => {
    if (pinnedRecord || effectiveItems.length === 0) return;
    if (localIndex > effectiveItems.length - 1) {
      setLocalIndex(Math.max(effectiveItems.length - 1, 0));
    }
  }, [effectiveItems.length, localIndex, pinnedRecord]);

  const navigateToGlobalIndex = useCallback(
    (targetGlobal) => {
      if (disabled || pinnedRecord || effectiveTotal === 0) return null;
      const clamped = Math.min(Math.max(targetGlobal, 0), effectiveTotal - 1);

      if (cumulativeMode) {
        if (clamped >= effectiveItems.length && hasMore) {
          onLoadMore?.();
          pendingLocalIndexRef.current = clamped;
          return { page: 1, localIndex: clamped, pending: true };
        }
        const nextLocal = Math.min(clamped, Math.max(effectiveItems.length - 1, 0));
        setLocalIndex(nextLocal);
        return { page: 1, localIndex: nextLocal, pending: false };
      }

      const targetPage = Math.floor(clamped / safePageSize) + 1;
      const targetLocal = clamped % safePageSize;

      if (targetPage !== page) {
        pendingLocalIndexRef.current = targetLocal;
        onPageChange?.(targetPage);
        return { page: targetPage, localIndex: targetLocal, pending: true };
      }

      setLocalIndex(targetLocal);
      return { page: targetPage, localIndex: targetLocal, pending: false };
    },
    [
      disabled,
      pinnedRecord,
      effectiveTotal,
      cumulativeMode,
      effectiveItems.length,
      hasMore,
      onLoadMore,
      safePageSize,
      page,
      onPageChange,
    ]
  );

  const syncLocalIndexFromRecord = useCallback(
    (record) => {
      if (!record?.id) {
        setLocalIndex(0);
        return;
      }
      if (pinnedRecord) {
        setLocalIndex(0);
        return;
      }
      const idx = effectiveItems.findIndex((item) => item.id === record.id);
      if (idx >= 0) setLocalIndex(idx);
    },
    [effectiveItems, pinnedRecord]
  );

  const currentRecord = effectiveItems[localIndex] ?? effectiveItems[0] ?? null;

  return {
    globalIndex,
    displayIndex: effectiveTotal === 0 ? 0 : globalIndex + 1,
    localIndex,
    setLocalIndex,
    effectiveTotal,
    effectiveItems,
    currentRecord,
    navigateFirst: () => navigateToGlobalIndex(0),
    navigateLast: () => navigateToGlobalIndex(effectiveTotal - 1),
    navigatePrevious: () => navigateToGlobalIndex(globalIndex - 1),
    navigateNext: () => navigateToGlobalIndex(globalIndex + 1),
    navigateToGlobalIndex,
    syncLocalIndexFromRecord,
  };
}
