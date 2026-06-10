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
  { minWidth = 0, width = null, estimatedHeight = 280 } = {}
) {
  const [style, setStyle] = useState({});

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setStyle({});
      return undefined;
    }

    const update = () => {
      const rect = rootRef.current.getBoundingClientRect();
      const panelWidth = width ?? Math.max(rect.width, minWidth);
      const panelHeight = panelRef?.current?.offsetHeight || estimatedHeight;
      const padding = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.left;
      if (left + panelWidth > viewportWidth - padding) {
        left = Math.max(padding, viewportWidth - panelWidth - padding);
      }
      if (left < padding) left = padding;

      const gap = 4;
      const spaceBelow = viewportHeight - rect.bottom - padding;
      const spaceAbove = rect.top - padding;
      let top = rect.bottom + gap;

      if (panelHeight > spaceBelow && spaceAbove >= spaceBelow) {
        top = rect.top - panelHeight - gap;
      }

      if (top + panelHeight > viewportHeight - padding) {
        top = Math.max(padding, viewportHeight - panelHeight - padding);
      }
      if (top < padding) top = padding;

      setStyle({
        position: "fixed",
        top,
        left,
        width: panelWidth,
        maxHeight: `calc(100vh - ${padding * 2}px)`,
        overflowY: "auto",
        zIndex: 10000,
      });
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, rootRef, panelRef, minWidth, width, estimatedHeight]);

  return style;
}
