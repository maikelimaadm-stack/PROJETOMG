import { useCallback, useEffect, useState } from "react";

const SCROLL_EPS = 2;

export function usePanelTabsScroll(scrollRef, deps = []) {
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    hasOverflow: false,
  });

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setScrollState({ canScrollLeft: false, canScrollRight: false, hasOverflow: false });
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    const hasOverflow = scrollWidth - clientWidth > SCROLL_EPS;

    setScrollState({
      hasOverflow,
      canScrollLeft: hasOverflow && scrollLeft > SCROLL_EPS,
      canScrollRight: hasOverflow && scrollLeft + clientWidth < scrollWidth - SCROLL_EPS,
    });
  }, [scrollRef]);

  useEffect(() => {
    updateScrollState();
    const element = scrollRef.current;
    if (!element) return undefined;

    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);
    Array.from(element.children).forEach((child) => resizeObserver.observe(child));

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [scrollRef, updateScrollState, ...deps]);

  return scrollState;
}
