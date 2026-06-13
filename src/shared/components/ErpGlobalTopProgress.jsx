import React from "react";

export default function ErpGlobalTopProgress({ active = false }) {
  if (!active) return null;
  return (
    <div
      className="erp-global-top-progress"
      role="progressbar"
      aria-busy="true"
      aria-label="Carregando dados"
    >
      <div className="erp-global-top-progress__bar" />
    </div>
  );
}
