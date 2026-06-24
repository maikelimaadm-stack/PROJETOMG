import React from "react";
import { CopyX, EyeOff, LockKeyhole, Sigma } from "lucide-react";

const AGGREGATION_SHORT = {
  sum: "Σ",
  avg: "Méd",
  max: "Máx",
  min: "Mín",
};

export default function EmpLayoutFieldStatusIcons({
  field,
  hiddenFieldIds = [],
  lockedFieldIds = [],
  clearOnDuplicateFieldIds = [],
  aggregationConfig = {},
}) {
  if (!field?.id) return null;

  const isHidden = hiddenFieldIds.includes(field.id);
  const isLocked = lockedFieldIds.includes(field.id);
  const clearOnDuplicate = clearOnDuplicateFieldIds.includes(field.id);
  const aggregation = aggregationConfig[field.id];
  const isAggregated = !!aggregation?.enabled;

  if (!isHidden && !isLocked && !clearOnDuplicate && !isAggregated) return null;

  const iconClass = "h-3 w-3 shrink-0 text-white";

  return (
    <span className="emp-layout-config-field-status-icons flex shrink-0 items-center gap-px">
      {isLocked && (
        <LockKeyhole className={iconClass} title="Bloqueado" aria-label="Bloqueado" />
      )}
      {isHidden && (
        <EyeOff className={iconClass} title="Oculto" aria-label="Oculto" />
      )}
      {isAggregated && (
        <span className="inline-flex items-center gap-0.5" title={`Totalizar: ${AGGREGATION_SHORT[aggregation?.type] || "Σ"}`}>
          <Sigma className={iconClass} aria-hidden="true" />
          <span className="text-[9px] font-semibold leading-none text-white">
            {AGGREGATION_SHORT[aggregation?.type] || "Σ"}
          </span>
        </span>
      )}
      {clearOnDuplicate && (
        <CopyX className={iconClass} title="Limpar ao duplicar" aria-label="Limpar ao duplicar" />
      )}
    </span>
  );
}
