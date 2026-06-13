import { useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export const CARD_GRID_GAP = 12;
const DEFAULT_CARD_ROW_HEIGHT = 140;
const DEFAULT_OVERSCAN = 4;

/** Estima altura de uma linha virtual de cards com base nos campos visíveis. */
export function estimateCardRowHeight(detailFieldCount = 0, fieldsPerRow = 1) {
  const safeFieldsPerRow = Math.max(1, Number(fieldsPerRow) || 1);
  const safeFieldCount = Math.max(0, Number(detailFieldCount) || 0);
  const headerBlock = 72;
  const verticalPadding = 32;
  const fieldRowHeight = safeFieldsPerRow >= 2 ? 38 : 24;
  const detailRows = Math.ceil(safeFieldCount / safeFieldsPerRow);
  return verticalPadding + headerBlock + detailRows * fieldRowHeight + 4;
}

/**
 * Virtualiza grid de cards por linhas (cardsPerRow itens por linha virtual).
 */
export function useGridVirtualizer({
  scrollRef,
  itemCount = 0,
  columnsPerRow = 3,
  estimateRowHeight,
  detailFieldCount = 0,
  fieldsPerRow = 1,
  rowGap = CARD_GRID_GAP,
  overscan = DEFAULT_OVERSCAN,
  enabled = true,
}) {
  const safeColumns = Math.max(1, Number(columnsPerRow) || 1);
  const rowCount = enabled ? Math.ceil(Math.max(0, itemCount) / safeColumns) : 0;

  const resolvedEstimate = useMemo(() => {
    if (typeof estimateRowHeight === "number" && estimateRowHeight > 0) {
      return estimateRowHeight;
    }
    return estimateCardRowHeight(detailFieldCount, fieldsPerRow);
  }, [estimateRowHeight, detailFieldCount, fieldsPerRow]);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => resolvedEstimate,
    overscan,
    gap: rowGap,
  });

  if (!enabled) {
    return {
      virtualizer: null,
      virtualRows: [],
      paddingTop: 0,
      paddingBottom: 0,
      columnsPerRow: safeColumns,
      estimateSize: resolvedEstimate,
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
    estimateSize: resolvedEstimate,
  };
}
