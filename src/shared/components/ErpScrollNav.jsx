import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "@/shared/utils/utils";
import { isolateScrollWheel, isPointerOverScrollbar } from "@/shared/utils/scrollWheelBoundary";

/**
 * Container rolável com scrollbar nativa padronizada (.erp-scrollbar).
 *
 * wheelScrollMode:
 * - "default": rolagem normal com wheel sobre o conteúdo.
 * - "scrollbar-only": wheel só rola quando o cursor está sobre a barra nativa.
 */
const ErpScrollNav = forwardRef(function ErpScrollNav(
  {
    className,
    viewportClassName,
    children,
    onWheel,
    wheelScrollMode = "default",
    ...viewportProps
  },
  ref
) {
  const viewportRef = useRef(null);
  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;

  const setViewportRef = useCallback(
    (node) => {
      viewportRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const scrollbarOnly = wheelScrollMode === "scrollbar-only";
    const handleWheel = (event) => {
      if (scrollbarOnly && !isPointerOverScrollbar(viewport, event.clientX)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onWheelRef.current?.(event);
      if (!event.defaultPrevented) isolateScrollWheel(event);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: !scrollbarOnly });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [wheelScrollMode]);

  return (
    <div className={cn("erp-scroll-nav", className)}>
      <div
        ref={setViewportRef}
        className={cn("erp-scroll-nav__viewport erp-scrollbar", viewportClassName)}
        {...viewportProps}
      >
        {children}
      </div>
    </div>
  );
});

export default ErpScrollNav;
