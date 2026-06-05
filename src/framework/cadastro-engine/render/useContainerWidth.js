import { useEffect, useRef, useState } from "react";

/**
 * Mede largura real do container via ResizeObserver (layout adaptativo).
 */
const resolveFallbackWidth = () => {
  if (typeof window === "undefined") return 1280;
  return Math.max(640, Math.round(window.innerWidth * 0.92));
};

const measureContainerWidth = (element) => {
  if (!element) return 0;
  const rect = element.getBoundingClientRect?.().width ?? 0;
  const client = element.clientWidth ?? 0;
  const parent = element.parentElement?.clientWidth ?? 0;
  return Math.max(rect, client, parent);
};

export function useContainerWidth(defaultWidth = resolveFallbackWidth()) {
  const ref = useRef(null);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const applyWidth = () => {
      const next = measureContainerWidth(element);
      if (next > 0) {
        setWidth(Math.round(next));
        return;
      }
      setWidth(resolveFallbackWidth());
    };

    applyWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", applyWidth);
      return () => window.removeEventListener("resize", applyWidth);
    }

    const observer = new ResizeObserver(() => applyWidth());
    observer.observe(element);
    if (element.parentElement) observer.observe(element.parentElement);

    window.addEventListener("resize", applyWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyWidth);
    };
  }, []);

  return { ref, width };
}

export default useContainerWidth;
