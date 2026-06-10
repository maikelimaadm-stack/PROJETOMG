import React from "react";
import { createPortal } from "react-dom";

/**
 * Portal do painel flutuante. O wrapper é 0×0 e transparente — não cobre a tela.
 */
export default function MgPortalPanel({ open, panelRef, panelClassName, style, onClick, children }) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="mg-empresas-scope mg-floating-panel-root" aria-hidden="true">
      <div
        ref={panelRef}
        className={panelClassName}
        style={{ display: "block", ...style }}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onClick}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
