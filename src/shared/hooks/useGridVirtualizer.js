import { useVirtualizer } from "@tanstack/react-virtual";

const DEFAULT_CARD_ROW_HEIGHT = 140;
const DEFAULT_OVERSCAN = 4;

/**
 * Virtualiza grid de cards por linhas (cardsPerRow itens por linha virtual).
 */
export function useGridVirtualizer({
  scrollRef,
  itemCount = 0,
  columnsPerRow = 3,
  estimateRowHeight = DEFAULT_CARD_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
  enabled = true,
}) {
  const safeColumns = Math.max(1, Number(columnsPerRow) || 1);
  const rowCount = enabled ? Math.ceil(Math.max(0, itemCount) / safeColumns) : 0;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  });

  if (!enabled) {
    return {
      virtualizer: null,
      virtualRows: [],
      paddingTop: 0,
      paddingBottom: 0,
      columnsPerRow: safeColumns,
    };
  }

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  return {
    virtualizer,
    virtualRows,
    paddingTop,
    paddingBottom,
    columnsPerRow: safeColumns,
  };
}
