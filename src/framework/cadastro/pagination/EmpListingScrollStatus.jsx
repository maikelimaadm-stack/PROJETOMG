import React from "react";

/** Rodapé de listagem com scroll infinito — mostra quantos registros já foram carregados. */
export default function EmpListingScrollStatus({
  loadedCount = 0,
  totalCount = 0,
  isLoadingMore = false,
  chunkSize = 500,
}) {
  const safeLoaded = Math.max(0, Number(loadedCount) || 0);
  const safeTotal = Math.max(0, Number(totalCount) || 0);
  const hasMore = safeLoaded < safeTotal;

  return (
    <div
      className="emp-listing-scroll-status flex shrink-0 items-center justify-between border-t border-[#e8ecef] bg-white px-3 py-1.5 text-[11px] text-[#64748b]"
      aria-live="polite"
    >
      <span>
        {safeTotal > 0
          ? `Carregados ${safeLoaded.toLocaleString("pt-BR")} de ${safeTotal.toLocaleString("pt-BR")}`
          : "Nenhum registro"}
      </span>
      {isLoadingMore ? (
        <span className="text-[#0ea5e9]">Carregando mais {chunkSize.toLocaleString("pt-BR")}...</span>
      ) : hasMore ? (
        <span>Role para carregar mais</span>
      ) : safeLoaded > 0 ? (
        <span>Todos os registros carregados</span>
      ) : null}
    </div>
  );
}
