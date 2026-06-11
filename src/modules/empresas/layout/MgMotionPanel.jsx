import React, { useEffect, useState } from "react";

const MOTION_MS = 220;

export default function MgMotionPanel({ panelKey, children, className = "" }) {
  const [renderKey, setRenderKey] = useState(panelKey);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (panelKey === renderKey) return undefined;

    setVisible(false);
    const timer = window.setTimeout(() => {
      setRenderKey(panelKey);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, MOTION_MS);

    return () => window.clearTimeout(timer);
  }, [panelKey, renderKey]);

  return (
    <div
      className={`mg-motion-panel${visible ? " mg-motion-panel--visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {typeof children === "function" ? children(renderKey) : children}
    </div>
  );
}
