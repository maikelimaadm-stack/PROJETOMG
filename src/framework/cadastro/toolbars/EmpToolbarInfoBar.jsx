import React from "react";
import { ChevronRight } from "lucide-react";
import ErpInfoPill from "@/shared/ui/ErpInfoPill";
import ErpOperationBadge from "@/shared/layouts/ErpOperationBadge";

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
  return (
    <div className={`emp-toolbar-info-bar flex h-6 items-center gap-2 border-b border-[#e4eaf2] px-2 ${className}`.trim()}>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <ErpInfoPill className="shrink-0">{titleCase(badgeLabel)}</ErpInfoPill>
        <ChevronRight className="h-3 w-3 shrink-0 text-[#94a3b8]" strokeWidth={2} aria-hidden="true" />
        <ErpInfoPill className="min-w-0 max-w-full">{title}</ErpInfoPill>
      </div>
      {operationLabel ? (
        <ErpOperationBadge operationLabel={operationLabel} className="ml-auto shrink-0" />
      ) : null}
    </div>
  );
}
