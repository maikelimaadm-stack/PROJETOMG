import React from "react";
import { createPortal } from "react-dom";

export default function MgConfigBackdrop({
  open = false,
  onClose,
  ariaLabel = "Fechar configuração",
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="mg-empresas-scope">
      <button
        type="button"
        className="mg-config-backdrop"
        aria-label={ariaLabel}
        tabIndex={-1}
        onClick={onClose}
      />
    </div>,
    document.body
  );
}
