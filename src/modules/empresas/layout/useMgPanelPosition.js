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

export function useMgPanelPosition(open, rootRef, { minWidth = 0, width = null } = {}) {
  const [style, setStyle] = useState({});

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setStyle({});
      return undefined;
    }

    const update = () => {
      const rect = rootRef.current.getBoundingClientRect();
      const panelWidth = width ?? Math.max(rect.width, minWidth);
      setStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: panelWidth,
        zIndex: 1000,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, rootRef, minWidth, width]);

  return style;
}
