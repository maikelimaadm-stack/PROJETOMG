import React from "react";
import { createPortal } from "react-dom";

/**
 * Portal do painel flutuante — renderiza direto no body (sem wrapper que bloqueia cliques).
 */
export default function MgPortalPanel({ open, panelRef, panelClassName, style, onClick, children }) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      className={`mg-empresas-scope ${panelClassName}`}
      style={{ display: "block", pointerEvents: "auto", ...style }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      {children}
    </div>,
    document.body
  );
}
