import { useEffect, useRef, useState } from "react";

/**
 * Mede largura real do container via ResizeObserver (layout adaptativo).
 */
export function useContainerWidth(defaultWidth = 360) {
  const ref = useRef(null);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const next = entry?.contentRect?.width ?? element.clientWidth;
      if (next > 0) setWidth(Math.round(next));
    });

    observer.observe(element);
    const initial = element.clientWidth;
    if (initial > 0) setWidth(Math.round(initial));

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export default useContainerWidth;
