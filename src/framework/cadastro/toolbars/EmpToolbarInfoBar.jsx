import React from "react";
import { ChevronRight } from "lucide-react";
import { getOperationBadge } from "@/shared/layouts/erpOperationBadge";

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export default function EmpToolbarInfoBar({
  badgeLabel = "EMPRESA",
  title,
  operationLabel,
  className = ""
}) {
  const { Icon, label } = getOperationBadge(operationLabel);

  return (
    <div className={`emp-toolbar-info-bar flex h-6 items-center gap-2 border-b border-[#e4eaf2] px-2 ${className}`.trim()}>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="shrink-0 text-xs font-semibold text-[#1a1f26]">{titleCase(badgeLabel)}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" strokeWidth={2} aria-hidden="true" />
        <span className="min-w-0 truncate text-xs font-semibold text-[#1a1f26]">{title}</span>
      </div>
      {operationLabel ? (
        <span className="emp-toolbar-operation-label ml-auto inline-flex shrink-0 items-center gap-1 text-[12px] font-normal text-[#5b6b80] whitespace-nowrap">
          <Icon className="h-3 w-3 shrink-0 text-[#5b6b80]" strokeWidth={2} aria-hidden="true" />
          {label}
        </span>
      ) : null}
    </div>
  );
}
