import React, { useEffect, useRef, useState } from "react";

export default function MgMotionPanel({
  panelKey,
  children,
  className = "",
  instant = false,
}) {
  const [renderKey, setRenderKey] = useState(panelKey);
  const contentRef = useRef(null);

  useEffect(() => {
    if (panelKey === renderKey) return undefined;

    setRenderKey(panelKey);
    if (instant) return undefined;

    const frame = requestAnimationFrame(() => {
      const node = contentRef.current;
      if (!node) return;
      node.style.animation = "none";
      // Force reflow so CSS animation restarts cleanly without remount flicker.
      void node.offsetHeight;
      node.style.animation = "";
    });

    return () => cancelAnimationFrame(frame);
  }, [panelKey, renderKey, instant]);

  return (
    <div className={`mg-motion-panel${className ? ` ${className}` : ""}`}>
      <div
        ref={contentRef}
        className={`mg-motion-panel__content${
          instant ? " mg-motion-panel--instant" : " mg-motion-panel--animate"
        }`}
      >
        {typeof children === "function" ? children(renderKey) : children}
      </div>
    </div>
  );
}
