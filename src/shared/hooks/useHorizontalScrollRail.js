import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SCROLL_STEP = 240;

/**
 * Rail horizontal com botões prev/next — oculta scrollbar nativa.
 */
export function useHorizontalScrollRail({
  enabled = true,
  scrollStep = DEFAULT_SCROLL_STEP,
} = {}) {
  const viewportRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !enabled) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setHasOverflow(false);
      return;
    }

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    setCanScrollLeft(viewport.scrollLeft > 1);
    setCanScrollRight(viewport.scrollLeft < maxScrollLeft - 1);
    setHasOverflow(maxScrollLeft > 1);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    updateScrollState();

    const onScroll = () => updateScrollState();
    viewport.addEventListener("scroll", onScroll, { passive: true });

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScrollState());
      resizeObserver.observe(viewport);
      if (viewport.firstElementChild) {
        resizeObserver.observe(viewport.firstElementChild);
      }
    } else {
      window.addEventListener("resize", updateScrollState);
    }

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [enabled, updateScrollState]);

  const scrollByStep = useCallback(
    (direction) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollBy({
        left: direction * scrollStep,
        behavior: "smooth",
      });
    },
    [scrollStep]
  );

  return {
    viewportRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollLeft: () => scrollByStep(-1),
    scrollRight: () => scrollByStep(1),
    updateScrollState,
  };
}
