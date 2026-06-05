import React from "react";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";

export default function ErpRecordMeta({ idGlobal, codigo, nome, codesPending = false }) {
  const hasIdGlobal = idGlobal != null && Number(idGlobal) > 0;
  const hasCodigo = codigo != null && String(codigo).trim() !== "";
  const hasNome = nome != null && String(nome).trim() !== "";

  if (!codesPending && !hasIdGlobal && !hasCodigo && !hasNome) return null;

  return (
    <span className="erp-record-meta inline-flex min-w-0 max-w-full items-center gap-2 truncate text-xs font-semibold text-[#1a1f26]">
      {codesPending ? (
        <span className="erp-record-meta__id-global shrink-0 font-medium text-[#64748B]">
          ID Global: Gerando...
        </span>
      ) : hasIdGlobal ? (
        <span className="erp-record-meta__id-global shrink-0 font-medium text-[#64748B]">
          ID Global: {formatIdGlobal(idGlobal)}
        </span>
      ) : null}
      {codesPending ? (
        <span className="erp-record-meta__codigo shrink-0 text-[#64748B]">
          Código: Gerando...
        </span>
      ) : hasCodigo ? (
        <span className="erp-record-meta__codigo shrink-0 text-[#64748B]">
          Código: {codigo}
        </span>
      ) : null}
      {hasNome ? (
        <span className="erp-record-meta__nome min-w-0 truncate font-semibold text-[#1a1f26]">
          {nome}
        </span>
      ) : null}
    </span>
  );
}
