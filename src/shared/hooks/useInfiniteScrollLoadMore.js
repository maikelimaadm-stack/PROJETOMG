import { useEffect, useRef } from "react";

const DEFAULT_THRESHOLD_PX = 320;

/**
 * Dispara onLoadMore quando o usuário rola perto do fim do container.
 */
export function useInfiniteScrollLoadMore({
  containerRef,
  enabled = true,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  thresholdPx = DEFAULT_THRESHOLD_PX,
}) {
  const lockRef = useRef(false);

  useEffect(() => {
    if (!isLoading) lockRef.current = false;
  }, [isLoading]);

  useEffect(() => {
    const element = containerRef?.current;
    if (!element || !enabled || !hasMore || !onLoadMore) return undefined;

    const handleScroll = () => {
      if (lockRef.current || isLoading) return;
      const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining > thresholdPx) return;
      lockRef.current = true;
      onLoadMore();
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => element.removeEventListener("scroll", handleScroll);
  }, [containerRef, enabled, hasMore, isLoading, onLoadMore, thresholdPx]);
}
