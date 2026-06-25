import { useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export const CARD_GRID_GAP = 12;
export const CARDS_LIST_PADDING = 16;
// Mantém o início da rolagem dos cards alinhado ao topo da tabela.
export const CARDS_TOP_PADDING = 0;
export const CARD_VERTICAL_PADDING = 24;
export const CARD_HEADER_HEIGHT = 48;
export const CARD_FIELD_LINE_HEIGHT = 20;
export const CARD_FIELD_ROW_GAP = 4;
const DEFAULT_OVERSCAN = 3;

/** Altura fixa de card/linha virtual com base nos campos visíveis (1 linha por valor). */
export function estimateCardRowHeight(detailFieldCount = 0, fieldsPerRow = 1) {
  const safeFieldsPerRow = Math.max(1, Number(fieldsPerRow) || 1);
  const safeFieldCount = Math.max(0, Number(detailFieldCount) || 0);
  const detailRows = Math.ceil(safeFieldCount / safeFieldsPerRow);
  const fieldGridGap = detailRows > 1 ? (detailRows - 1) * CARD_FIELD_ROW_GAP : 0;
  const fieldsHeight =
    detailRows > 0 ? detailRows * CARD_FIELD_LINE_HEIGHT + fieldGridGap : 0;
  return CARD_VERTICAL_PADDING + CARD_HEADER_HEIGHT + fieldsHeight;
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
  scrollMargin = 0,
  overscan = DEFAULT_OVERSCAN,
  enabled = true,
  layoutKey = "",
}) {
  const safeColumns = Math.max(1, Number(columnsPerRow) || 1);
  const rowCount = enabled ? Math.ceil(Math.max(0, itemCount) / safeColumns) : 0;

  const resolvedEstimate = useMemo(() => {
    if (typeof estimateRowHeight === "number" && estimateRowHeight > 0) {
      return estimateRowHeight;
    }
    return estimateCardRowHeight(detailFieldCount, fieldsPerRow);
  }, [estimateRowHeight, detailFieldCount, fieldsPerRow]);

  const getItemKey = useCallback((index) => `${layoutKey}:${index}`, [layoutKey]);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => resolvedEstimate,
    getItemKey,
    overscan,
    gap: rowGap,
    scrollMargin,
    isScrollingResetDelay: 0,
  });

  if (!enabled) {
    return {
      virtualizer: null,
      virtualRows: [],
      paddingTop: 0,
      paddingBottom: 0,
      columnsPerRow: safeColumns,
      estimateSize: resolvedEstimate,
      totalSize: 0,
      scrollMargin,
    };
  }

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return {
    virtualizer,
    virtualRows,
    paddingTop: 0,
    paddingBottom: 0,
    columnsPerRow: safeColumns,
    estimateSize: resolvedEstimate,
    totalSize,
    scrollMargin,
  };
}
