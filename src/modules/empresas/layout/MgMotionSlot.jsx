import React, { useEffect, useRef, useState } from "react";

const MOTION_MS = 220;

export default function MgMotionSlot({ show, children, className = "" }) {
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (show) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    hideTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      hideTimerRef.current = null;
    }, MOTION_MS);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
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
