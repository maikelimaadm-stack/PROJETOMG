import React from "react";
import { createPortal } from "react-dom";

/**
 * Portal do painel flutuante. O wrapper é 0×0 e transparente — não cobre a tela.
 */
export default function MgPortalPanel({
  open,
  panelRef,
  panelClassName,
  style,
  onClick,
  children,
  popoverArrow = /(?:^|\s)dropdown-menu(?:\s|$)/.test(panelClassName || ""),
  arrowAlign = "end",
}) {
  if (!open || typeof document === "undefined") return null;

  const stopInside = (event) => {
    event.stopPropagation();
  };

  const rootClassName = [
    popoverArrow ? "mg-popover-shell" : "",
    panelClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className="mg-empresas-scope mg-floating-panel-root" aria-hidden="true">
      <div
        ref={panelRef}
        data-mg-floating-panel="true"
        className={rootClassName}
        style={{ display: "block", ...style }}
        onMouseDown={stopInside}
        onPointerDown={stopInside}
        onClick={onClick}
      >
        {popoverArrow ? (
          <>
            <div
              className={`mg-popover-shell__arrow mg-popover-shell__arrow--${arrowAlign}`}
              aria-hidden="true"
            />
            <div className="mg-popover-shell__body">{children}</div>
          </>
        ) : (
          children
        )}
      </div>
    </div>,
    document.body
  );
}
