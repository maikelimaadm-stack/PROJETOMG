import React from "react";

/** Barra fina no topo da listagem — indica fetch de página sem bloquear a tabela. */
export default function ErpListingTopProgress({ active = false }) {
  if (!active) return null;
  return (
    <div className="erp-listing-top-progress" role="progressbar" aria-busy="true" aria-label="Carregando registros">
      <div className="erp-listing-top-progress__bar" />
    </div>
  );
}
