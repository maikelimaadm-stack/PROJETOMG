import React, { useEffect, useState } from "react";

export default function MgMotionPanel({ panelKey, children, className = "" }) {
  const [renderKey, setRenderKey] = useState(panelKey);

  useEffect(() => {
    if (panelKey !== renderKey) {
      setRenderKey(panelKey);
    }
  }, [panelKey, renderKey]);

  return (
    <div className={`mg-motion-panel mg-motion-panel--visible${className ? ` ${className}` : ""}`}>
      {typeof children === "function" ? children(renderKey) : children}
    </div>
  );
}
