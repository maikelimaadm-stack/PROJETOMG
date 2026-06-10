import React from "react";
import { createPortal } from "react-dom";

export default function MgPortalPanel({ open, panelRef, panelClassName, style, onClick, children }) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="mg-empresas-scope mg-floating-panel-root">
      <div
        ref={panelRef}
        className={panelClassName}
        style={{ display: "block", ...style }}
        onClick={onClick}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
