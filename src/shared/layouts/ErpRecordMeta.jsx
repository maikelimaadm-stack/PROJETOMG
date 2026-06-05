import React from "react";
import ErpInfoPill from "@/shared/ui/ErpInfoPill";

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
    <ErpInfoPill className="erp-record-meta max-w-[min(100%,520px)]" title={label}>
      {label}
    </ErpInfoPill>
  );
}
