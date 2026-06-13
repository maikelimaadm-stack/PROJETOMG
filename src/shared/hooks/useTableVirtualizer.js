import { useVirtualizer } from "@tanstack/react-virtual";

const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_OVERSCAN = 10;

/**
 * Virtualiza linhas de tabela — renderiza apenas itens visíveis na viewport.
 */
export function useTableVirtualizer({
  scrollRef,
  count = 0,
  estimateSize = DEFAULT_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
  enabled = true,
}) {
  const safeCount = enabled ? Math.max(0, count) : 0;

  const virtualizer = useVirtualizer({
    count: safeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    isScrollingResetDelay: 0,
  });

  if (!enabled) {
    return {
      virtualizer: null,
      virtualItems: [],
      totalSize: 0,
      paddingTop: 0,
      paddingBottom: 0,
    };
  }

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  return {
    virtualizer,
    virtualItems,
    totalSize: virtualizer.getTotalSize(),
    paddingTop,
    paddingBottom,
  };
}
