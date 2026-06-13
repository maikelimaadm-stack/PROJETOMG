import React, { forwardRef, useCallback } from "react";
import { cn } from "@/shared/utils/utils";
import { isolateScrollWheel } from "@/shared/utils/scrollWheelBoundary";

/**
 * Container rolável com scrollbar nativa padronizada (.erp-scrollbar).
 */
const ErpScrollNav = forwardRef(function ErpScrollNav(
  { className, viewportClassName, children, onWheel, ...viewportProps },
  ref
) {
  const setViewportRef = useCallback(
    (node) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const handleWheel = (event) => {
    onWheel?.(event);
    if (!event.defaultPrevented) isolateScrollWheel(event);
  };

  return (
    <div className={cn("erp-scroll-nav", className)}>
      <div
        ref={setViewportRef}
        className={cn("erp-scroll-nav__viewport erp-scrollbar", viewportClassName)}
        onWheel={handleWheel}
        {...viewportProps}
      >
        {children}
      </div>
    </div>
  );
});

export default ErpScrollNav;
