import React from "react";
import { ChevronRight, Copy, Eye, Pencil, Plus } from "lucide-react";

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const getOperationBadge = (operationLabel) => {
  const normalized = String(operationLabel || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (normalized.includes("VISUALIZ")) return { Icon: Eye, label: "Visualização" };
  if (normalized.includes("EDICAO")) return { Icon: Pencil, label: "Edição" };
  if (normalized.includes("DUPLICAD")) return { Icon: Copy, label: "Duplicado" };
  if (normalized.includes("NOVO")) return { Icon: Plus, label: "Novo" };

  return { Icon: Eye, label: titleCase(operationLabel || "Visualização") };
};

export default function EmpToolbarInfoBar({
  badgeLabel = "EMPRESA",
  title,
  operationLabel,
  className = ""
}) {
  const { Icon, label } = getOperationBadge(operationLabel);

  return (
    <div className={`emp-toolbar-info-bar flex h-6 items-center gap-2 border-b border-[#dce3eb] px-2 ${className}`.trim()}>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="shrink-0 text-xs font-semibold text-[#1a1f26]">{titleCase(badgeLabel)}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" strokeWidth={2} aria-hidden="true" />
        <span className="min-w-0 truncate text-xs font-semibold text-[#1a1f26]">{title}</span>
      </div>
      {operationLabel ? (
        <span className="emp-toolbar-operation-label ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-normal text-[#5b6b80] whitespace-nowrap">
          <Icon className="h-3 w-3 shrink-0 text-[#5b6b80]" strokeWidth={2} aria-hidden="true" />
          {label}
        </span>
      ) : null}
    </div>
  );
}
