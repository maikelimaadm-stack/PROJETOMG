import React, { useEffect, useState } from "react";

export default function MgMotionPanel({
  panelKey,
  children,
  className = "",
  instant = false,
}) {
  const [renderKey, setRenderKey] = useState(panelKey);
  const [animationSeq, setAnimationSeq] = useState(0);

  useEffect(() => {
    if (panelKey === renderKey) return undefined;

    setRenderKey(panelKey);
    if (!instant) setAnimationSeq((prev) => prev + 1);
    return undefined;
  }, [panelKey, renderKey, instant]);

  return (
    <div className={`mg-motion-panel${className ? ` ${className}` : ""}`}>
      <div
        key={`${renderKey}-${instant ? "instant" : animationSeq}`}
        className={`mg-motion-panel__content${
          instant ? " mg-motion-panel--instant" : " mg-motion-panel--animate"
        }`}
      >
        {typeof children === "function" ? children(renderKey) : children}
      </div>
    </div>
  );
}
