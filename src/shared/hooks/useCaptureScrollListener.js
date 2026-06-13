import { useLayoutEffect, useRef } from "react";

/**
 * Capture-phase scroll/resize listener with rAF coalescing (one callback per frame).
 */
export function useCaptureScrollListener(enabled, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    if (!enabled) return undefined;

    let rafId = 0;
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        callbackRef.current();
      });
    };

    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);
}
