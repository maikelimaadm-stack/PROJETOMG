import React, { useEffect, useState } from "react";

const MOTION_MS = 220;

export default function MgMotionSlot({ show, children, className = "" }) {
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), MOTION_MS);
    return () => window.clearTimeout(timer);
  }, [show]);

  if (!mounted) return null;

  return (
    <div
      className={`mg-motion-slot${visible ? " mg-motion-slot--visible" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden={!visible}
    >
      <div className="mg-motion-slot__content">{children}</div>
    </div>
  );
}
