import { useCallback } from "react";

function clampScroll(viewport, next) {
  if (!viewport) return;
  const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  viewport.scrollTop = Math.max(0, Math.min(maxScroll, next));
}

export function useScrollNavActions(viewportRef, stepSize = 32) {
  const getViewport = useCallback(() => viewportRef?.current ?? null, [viewportRef]);

  const scrollToStart = useCallback(() => {
    clampScroll(getViewport(), 0);
  }, [getViewport]);

  const scrollToEnd = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return;
    clampScroll(viewport, viewport.scrollHeight - viewport.clientHeight);
  }, [getViewport]);

  const scrollStepUp = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return;
    clampScroll(viewport, viewport.scrollTop - stepSize);
  }, [getViewport, stepSize]);

  const scrollStepDown = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return;
    clampScroll(viewport, viewport.scrollTop + stepSize);
  }, [getViewport, stepSize]);

  return {
    scrollToStart,
    scrollToEnd,
    scrollStepUp,
    scrollStepDown,
  };
}
