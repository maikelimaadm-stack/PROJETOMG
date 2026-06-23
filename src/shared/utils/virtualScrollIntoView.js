import { EMP_TABLE_ROW_HEIGHT } from "@/shared/constants/erpLayout";

/**
 * Rola listas virtualizadas até a linha `index`, respeitando direção e header sticky.
 * Preferível a scrollIntoView em tabelas com spacer + thead sticky.
 */
export function scrollVirtualRowIntoView(
  scrollEl,
  index,
  {
    itemSize = EMP_TABLE_ROW_HEIGHT,
    direction = null,
    stickyHeaderOffset = 0,
    edgePadding = 0,
  } = {}
) {
  if (!scrollEl || index < 0) return;

  const viewport = scrollEl.clientHeight;
  if (viewport <= 0) return;

  const maxScroll = Math.max(0, scrollEl.scrollHeight - viewport);
  const rowStart = index * itemSize;
  const rowEnd = rowStart + itemSize;
  const scrollTop = scrollEl.scrollTop;
  const visibleStart = scrollTop + stickyHeaderOffset + edgePadding;
  const visibleEnd = scrollTop + viewport - edgePadding;

  let nextTop = scrollTop;

  if (direction === "up") {
    nextTop = rowStart - stickyHeaderOffset - edgePadding;
  } else if (direction === "down") {
    nextTop = rowEnd - viewport + edgePadding;
  } else if (rowStart < visibleStart) {
    nextTop = rowStart - stickyHeaderOffset - edgePadding;
  } else if (rowEnd > visibleEnd) {
    nextTop = rowEnd - viewport + edgePadding;
  }

  const clamped = Math.min(maxScroll, Math.max(0, nextTop));
  if (clamped !== scrollTop) {
    scrollEl.scrollTop = clamped;
  }
}

/** Define alinhamento do scrollToIndex conforme direção da seleção. */
export function resolveVirtualScrollAlign(previousIndex, nextIndex) {
  if (previousIndex == null || nextIndex == null || previousIndex === nextIndex) {
    return "center";
  }
  const delta = nextIndex - previousIndex;
  if (Math.abs(delta) === 1) {
    return delta < 0 ? "start" : "end";
  }
  return "center";
}
