import React from "react";

const normalizeText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
};

export default function ErpRecordDetails({ codigo = null, nome = null, className = "" }) {
  const codigoText = normalizeText(codigo);
  const nomeText = normalizeText(nome);

  if (!codigoText && !nomeText) return null;

  return (
    <div className={`erp-record-details flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475569] ${className}`.trim()}>
      {codigoText ? (
        <span className="erp-record-details__item min-w-0">
          <span className="font-semibold text-[#334155]">Código:</span>{" "}
          <span className="tabular-nums">{codigoText}</span>
        </span>
      ) : null}
      {nomeText ? (
        <span className="erp-record-details__item min-w-0 truncate">
          <span className="font-semibold text-[#334155]">Nome:</span>{" "}
          <span className="truncate">{nomeText}</span>
        </span>
      ) : null}
    </div>
  );
}
