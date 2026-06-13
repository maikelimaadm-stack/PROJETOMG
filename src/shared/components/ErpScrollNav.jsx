import React, { forwardRef, useCallback, useRef, useState, useEffect } from "react";
import { ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { useScrollNavActions } from "@/shared/hooks/useScrollNavActions";
import { isolateScrollWheel } from "@/shared/utils/scrollWheelBoundary";

/**
 * Container rolável estilo Supabase (.erp-scrollbar) + botões de navegação.
 */
const ErpScrollNav = forwardRef(function ErpScrollNav(
  {
    stepSize = 32,
    className,
    viewportClassName,
    showNav = true,
    children,
    onWheel,
    ...viewportProps
  },
  ref
) {
  const localRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const setViewportRef = useCallback(
    (node) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const { scrollToStart, scrollToEnd, scrollStepUp, scrollStepDown } = useScrollNavActions(
    localRef,
    stepSize
  );

  const syncNavState = useCallback(() => {
    const viewport = localRef.current;
    if (!viewport) return;
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    if (maxScroll <= 1) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }
    setCanScrollUp(viewport.scrollTop > 0);
    setCanScrollDown(viewport.scrollTop < maxScroll - 1);
  }, []);

  useEffect(() => {
    const viewport = localRef.current;
    if (!viewport) return undefined;

    syncNavState();
    viewport.addEventListener("scroll", syncNavState, { passive: true });

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(syncNavState);
      observer.observe(viewport);
    }

    return () => {
      viewport.removeEventListener("scroll", syncNavState);
      observer?.disconnect();
    };
  }, [syncNavState, children]);

  const stopNavEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

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
      {showNav ? (
        <div className="erp-scroll-nav__controls" aria-hidden="false">
          <div className="erp-scroll-nav__group erp-scroll-nav__group--top">
            <button
              type="button"
              className="erp-scroll-nav__btn"
              title="Ir para o início"
              aria-label="Ir para o início"
              disabled={!canScrollUp}
              onClick={(event) => {
                stopNavEvent(event);
                scrollToStart();
              }}
            >
              <ChevronsUp className="erp-scroll-nav__icon" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="erp-scroll-nav__btn"
              title="Rolar um registro para cima"
              aria-label="Rolar um registro para cima"
              disabled={!canScrollUp}
              onClick={(event) => {
                stopNavEvent(event);
                scrollStepUp();
              }}
            >
              <ChevronUp className="erp-scroll-nav__icon" strokeWidth={2.5} />
            </button>
          </div>
          <div className="erp-scroll-nav__spacer" aria-hidden="true" />
          <div className="erp-scroll-nav__group erp-scroll-nav__group--bottom">
            <button
              type="button"
              className="erp-scroll-nav__btn"
              title="Rolar um registro para baixo"
              aria-label="Rolar um registro para baixo"
              disabled={!canScrollDown}
              onClick={(event) => {
                stopNavEvent(event);
                scrollStepDown();
              }}
            >
              <ChevronDown className="erp-scroll-nav__icon" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="erp-scroll-nav__btn"
              title="Ir para o final"
              aria-label="Ir para o final"
              disabled={!canScrollDown}
              onClick={(event) => {
                stopNavEvent(event);
                scrollToEnd();
              }}
            >
              <ChevronsDown className="erp-scroll-nav__icon" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default ErpScrollNav;
