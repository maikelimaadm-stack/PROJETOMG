import React from "react";

const buildRecordLabel = (codigo, nome) => {
  const codigoText =
    codigo != null && String(codigo).trim() !== "" ? String(codigo).trim() : null;
  const nomeText = nome != null && String(nome).trim() !== "" ? String(nome).trim() : null;

  if (codigoText && nomeText) return `${codigoText} - ${nomeText}`;
  if (codigoText) return codigoText;
  if (nomeText) return nomeText;
  return null;
};

export default function ErpRecordMeta({ codigo, nome }) {
  const label = buildRecordLabel(codigo, nome);
  if (!label) return null;

  return (
    <span className="erp-record-meta min-w-0 truncate text-xs font-semibold text-[#1a1f26]">
      {label}
    </span>
  );
}
