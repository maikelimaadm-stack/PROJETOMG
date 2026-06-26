import { useEffect } from "react";

export default function useMgSegSlider(containerRef, sliderRef, activeSelector, deps = []) {
  useEffect(() => {
    const container = containerRef.current;
    const slider = sliderRef.current;
    if (!container || !slider) return undefined;

    const updateSlider = () => {
      const activeEl = container.querySelector(activeSelector);
      if (!activeEl) {
        slider.style.width = "0px";
        slider.style.transform = "translateX(0px)";
        return;
      }

      slider.style.width = `${activeEl.offsetWidth}px`;
      slider.style.transform = `translateX(${activeEl.offsetLeft}px)`;
    };

    const scheduleUpdate = () => {
      requestAnimationFrame(updateSlider);
    };

    scheduleUpdate();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;
    resizeObserver?.observe(container);

    window.addEventListener("resize", scheduleUpdate);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, deps);
}
