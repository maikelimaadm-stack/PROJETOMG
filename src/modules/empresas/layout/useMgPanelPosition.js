import { useLayoutEffect, useState } from "react";

export function closeMgPanels(exceptEl = null) {
  window.dispatchEvent(new CustomEvent("mg-close-panels", { detail: { except: exceptEl } }));
}

export function useMgPanelCoordinator(rootRef, setOpen) {
  useLayoutEffect(() => {
    const handler = (event) => {
      if (event.detail?.except !== rootRef.current) setOpen(false);
    };
    window.addEventListener("mg-close-panels", handler);
    return () => window.removeEventListener("mg-close-panels", handler);
  }, [rootRef, setOpen]);
}

export function useMgPanelPosition(
  open,
  rootRef,
  panelRef,
  {
    minWidth = 0,
    width = null,
    estimatedHeight = 280,
    scrollable = true,
    observePanelResize = true,
    align = "left",
  } = {},
  repositionKey = null
) {
  const [style, setStyle] = useState({ visibility: "hidden" });

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setStyle({ visibility: "hidden" });
      return undefined;
    }

    const update = () => {
      const anchor = rootRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const panelWidth = width ?? Math.max(rect.width, minWidth);
      const measured = panelRef?.current?.offsetHeight ?? 0;
      const panelHeight = !scrollable
        ? estimatedHeight
        : measured > 0
          ? measured
          : estimatedHeight;
      const padding = 8;
      const gap = 4;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = align === "right" ? rect.right - panelWidth : rect.left;
      if (left + panelWidth > viewportWidth - padding) {
        left = Math.max(padding, viewportWidth - panelWidth - padding);
      }
      if (left < padding) left = padding;

      let top = rect.bottom + gap;
      const fitsBelow = top + panelHeight <= viewportHeight - padding;
      const aboveTop = rect.top - panelHeight - gap;
      const fitsAbove = aboveTop >= padding;

      if (!fitsBelow && fitsAbove) {
        top = aboveTop;
      } else if (!fitsBelow) {
        top = Math.max(padding, viewportHeight - panelHeight - padding);
      }

      const nextStyle = {
        position: "fixed",
        top,
        left,
        width: panelWidth,
        zIndex: 10000,
        visibility: "visible",
        pointerEvents: "auto",
      };

      if (scrollable) {
        nextStyle.maxHeight = `calc(100vh - ${padding * 2}px)`;
        nextStyle.overflowY = "auto";
      } else {
        nextStyle.height = estimatedHeight;
        nextStyle.overflow = "hidden";
      }

      setStyle(nextStyle);
    };

    update();
    const raf1 = requestAnimationFrame(update);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(update));

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(update);
      if (observePanelResize && panelRef?.current) resizeObserver.observe(panelRef.current);
      resizeObserver.observe(rootRef.current);
    }

    window.addEventListener("resize", update);
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        update();
      });
    };
    window.addEventListener("scroll", onScroll, true);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, rootRef, panelRef, minWidth, width, estimatedHeight, scrollable, observePanelResize, align, repositionKey]);

  return style;
}
