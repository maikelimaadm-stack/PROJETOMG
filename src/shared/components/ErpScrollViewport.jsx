import React, { forwardRef, useRef } from "react";
import { cn } from "@/shared/utils/utils";
import { useFixedScrollbarOverlay } from "@/shared/hooks/useFixedScrollbarOverlay";
import { isolateScrollWheel } from "@/shared/utils/scrollWheelBoundary";

/**
 * Container rolável com thumb fixo, trilho visível e botões ▲/▼.
 * Clique: rola um passo. Duplo-clique ▲: início | duplo-clique ▼: fim.
 */
const ErpScrollViewport = forwardRef(function ErpScrollViewport(
  {
    variant = "primary",
    stepSize,
    showButtons = true,
    className,
    viewportClassName,
    children,
    onWheel,
    ...viewportProps
  },
  ref
) {
  const localRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const upBtnRef = useRef(null);
  const downBtnRef = useRef(null);

  const setViewportRef = (node) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useFixedScrollbarOverlay(localRef, thumbRef, trackRef, {
    variant,
    stepSize,
    upBtnRef,
    downBtnRef,
    showButtons,
  });

  const handleWheel = (event) => {
    onWheel?.(event);
    if (!event.defaultPrevented) isolateScrollWheel(event);
  };

  return (
    <div
      className={cn(
        "erp-scroll-surface",
        variant === "compact" ? "erp-scroll-surface--compact" : "erp-scroll-surface--primary",
        className
      )}
    >
      <div
        ref={setViewportRef}
        className={cn("erp-scroll-surface__viewport", viewportClassName)}
        onWheel={handleWheel}
        {...viewportProps}
      >
        {children}
      </div>
      <div className="erp-scroll-surface__rail" aria-hidden={false}>
        {showButtons ? (
          <button
            ref={upBtnRef}
            type="button"
            className="erp-scroll-surface__btn erp-scroll-surface__btn--up"
            title="Rolar para cima (duplo-clique: início)"
            aria-label="Rolar para cima"
          />
        ) : null}
        <div className="erp-scroll-surface__track" ref={trackRef}>
          <div className="erp-scroll-surface__thumb" ref={thumbRef} />
        </div>
        {showButtons ? (
          <button
            ref={downBtnRef}
            type="button"
            className="erp-scroll-surface__btn erp-scroll-surface__btn--down"
            title="Rolar para baixo (duplo-clique: fim)"
            aria-label="Rolar para baixo"
          />
        ) : null}
      </div>
    </div>
  );
});

export default ErpScrollViewport;
