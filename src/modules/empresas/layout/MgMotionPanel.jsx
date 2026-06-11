import React, { useEffect, useState } from "react";

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

    setRenderKey(panelKey);
    if (instant) {
      setVisible(true);
      return undefined;
    }

    setVisible(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    return () => cancelAnimationFrame(frame);
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
