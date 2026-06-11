import React, { useEffect, useState } from "react";

const MOTION_MS = 220;

export default function MgMotionPanel({
  panelKey,
  children,
  className = "",
  instant = false,
}) {
  const [renderKey, setRenderKey] = useState(panelKey);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (panelKey === renderKey) return undefined;

    if (instant) {
      setRenderKey(panelKey);
      setVisible(true);
      return undefined;
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setRenderKey(panelKey);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, MOTION_MS);

    return () => window.clearTimeout(timer);
  }, [panelKey, renderKey, instant]);

  return (
    <div className={`mg-motion-panel${className ? ` ${className}` : ""}`}>
      <div
        className={`mg-motion-panel__content${
          visible || instant ? " mg-motion-panel--visible" : ""
        }${instant ? " mg-motion-panel--instant" : ""}`}
      >
        {typeof children === "function" ? children(renderKey) : children}
      </div>
    </div>
  );
}
