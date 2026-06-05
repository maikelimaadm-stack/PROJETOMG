import React from "react";
import ErpInfoPill from "@/shared/ui/ErpInfoPill";
import { getOperationBadge } from "@/shared/layouts/erpOperationBadge";

export default function ErpOperationBadge({ operationLabel, className = "" }) {
  if (!operationLabel) return null;

  const { Icon, label } = getOperationBadge(operationLabel);
  const isSaving = String(operationLabel || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .includes("SALVAND");

  return (
    <ErpInfoPill
      icon={Icon}
      className={`erp-shell-operation-badge${isSaving ? " erp-info-pill--saving" : ""} ${className}`.trim()}
      title={label}
    >
      {label}
    </ErpInfoPill>
  );
}
