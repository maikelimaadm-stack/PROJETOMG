import { EMP_TABLE_ROW_HEIGHT } from "@/shared/constants/erpLayout";

/**
 * Rola o mínimo necessário para manter a linha visível (listas virtualizadas).
 * Evita saltos completos do viewport a cada tecla — principal causa de delay ao descer.
 */
export function scrollVirtualRowIntoView(
  scrollEl,
  index,
  {
    itemSize = EMP_TABLE_ROW_HEIGHT,
    rowSize = itemSize,
    scrollOffset = 0,
    direction = null,
    stickyHeaderOffset = 0,
    edgePadding = 0,
  } = {}
) {
  if (!scrollEl || index < 0) return;

  const viewport = scrollEl.clientHeight;
  if (viewport <= 0) return;

  const maxScroll = Math.max(0, scrollEl.scrollHeight - viewport);
  const rowStart = scrollOffset + index * itemSize;
  const rowEnd = rowStart + rowSize;
  const scrollTop = scrollEl.scrollTop;
  const visibleStart = scrollTop + stickyHeaderOffset + edgePadding;
  const visibleEnd = scrollTop + viewport - edgePadding;

  const needsScrollUp = rowStart < visibleStart;
  const needsScrollDown = rowEnd > visibleEnd;

  let nextTop = scrollTop;

  if (direction === "up") {
    if (!needsScrollUp) return;
    nextTop = rowStart - stickyHeaderOffset - edgePadding;
  } else if (direction === "down") {
    if (!needsScrollDown) return;
    nextTop = rowEnd - viewport + edgePadding;
  } else if (needsScrollUp) {
    nextTop = rowStart - stickyHeaderOffset - edgePadding;
  } else if (needsScrollDown) {
    nextTop = rowEnd - viewport + edgePadding;
  } else {
    return;
  }

  scrollEl.scrollTop = Math.min(maxScroll, Math.max(0, nextTop));
}

/** Direção da navegação por teclado (↑/↓) a partir de dois índices consecutivos. */
export function resolveSelectionScrollDirection(previousIndex, nextIndex) {
  if (previousIndex == null || nextIndex == null || previousIndex === nextIndex) {
    return null;
  }
  return nextIndex < previousIndex ? "up" : "down";
}
