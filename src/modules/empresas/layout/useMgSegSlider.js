import { useEffect } from "react";

const DEFAULT_OPTIONS = {
  insetX: 0,
  bottom: 0,
};

/**
 * Posiciona um indicador deslizante sob a aba ativa (seg-tab).
 */
export default function useMgSegSlider(
  containerRef,
  sliderRef,
  activeSelector,
  deps = [],
  options = DEFAULT_OPTIONS
) {
  useEffect(() => {
    const container = containerRef.current;
    const slider = sliderRef.current;
    if (!container || !slider) return undefined;

    const { insetX = 0, bottom = 0 } = options;

    const scheduleUpdate = () => {
      requestAnimationFrame(updateSlider);
    };

    let observedActive = null;

    const updateSlider = () => {
      const activeEl = container.querySelector(activeSelector);
      if (activeEl !== observedActive) {
        if (observedActive) resizeObserver?.unobserve(observedActive);
        if (activeEl) resizeObserver?.observe(activeEl);
        observedActive = activeEl;
      }

      if (!activeEl) {
        slider.style.width = "0px";
        slider.style.transform = "translateX(0px)";
        slider.style.opacity = "0";
        return;
      }

      const width = Math.max(0, activeEl.offsetWidth - insetX * 2);
      const left = activeEl.offsetLeft + insetX;

      slider.style.width = `${width}px`;
      slider.style.transform = `translateX(${left}px)`;
      slider.style.bottom = `${bottom}px`;
      slider.style.opacity = width > 0 ? "1" : "0";
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;
    resizeObserver?.observe(container);

    scheduleUpdate();

    container.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      resizeObserver?.disconnect();
      container.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, deps);
}
