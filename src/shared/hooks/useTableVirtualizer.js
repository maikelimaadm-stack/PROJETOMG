import { useVirtualizer } from "@tanstack/react-virtual";
import { EMP_TABLE_ROW_HEIGHT } from "@/shared/constants/erpLayout";

const DEFAULT_OVERSCAN = 8;

/**
 * Virtualiza linhas de tabela — altura fixa alinhada ao CSS (--emp-table-data-height).
 */
export function useTableVirtualizer({
  scrollRef,
  count = 0,
  estimateSize = EMP_TABLE_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
  scrollMargin = 0,
  enabled = true,
}) {
  const safeCount = enabled ? Math.max(0, count) : 0;

  const virtualizer = useVirtualizer({
    count: safeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    scrollMargin,
    isScrollingResetDelay: 150,
  });

  if (!enabled) {
    return {
      virtualizer: null,
      virtualItems: [],
      totalSize: 0,
    };
  }

  return {
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
