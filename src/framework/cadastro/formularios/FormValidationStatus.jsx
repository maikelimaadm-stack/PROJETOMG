import React, { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

export default function FormValidationStatus({
  filled = 0,
  total = 0,
  pendingFields = [],
  className = "",
}) {
  const isComplete = total > 0 && filled >= total;

  const label = "Obrigatórios";

  const ariaLabel = useMemo(() => {
    if (total <= 0) return "";
    return `${filled} de ${total} campos obrigatórios`;
  }, [filled, total]);

  const tooltipContent = useMemo(() => {
    if (total <= 0) return null;
    if (isComplete) {
      return <p>Todos os campos obrigatórios foram preenchidos.</p>;
    }
    if (!pendingFields.length) return null;

    return (
      <div className="space-y-1.5">
        <p className="font-medium text-[#334155]">Campos pendentes:</p>
        <ul className="list-none space-y-0.5">
          {pendingFields.map((field) => (
            <li key={field.id} className="text-[#64748b]">
              • {field.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }, [isComplete, pendingFields, total]);

  if (total <= 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`form-validation-status ${isComplete ? "form-validation-status--complete" : "form-validation-status--pending"} ${className}`.trim()}
            role="status"
            aria-live="polite"
            aria-label={ariaLabel}
          >
            <span className="form-validation-status__icon" aria-hidden="true">
              <span className="form-validation-status__dot-wrap">
                {!isComplete ? <span className="form-validation-status__dot-ring" /> : null}
                <span
                  className={`form-validation-status__dot${!isComplete ? " form-validation-status__dot--pulse" : ""}`}
                />
              </span>
            </span>
            <span className="form-validation-status__label">{label}</span>
          </div>
        </TooltipTrigger>
        {tooltipContent ? (
          <TooltipContent
            side="bottom"
            align="end"
            className="form-validation-status__tooltip max-w-[280px] border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-normal text-[#334155] shadow-md"
          >
            {tooltipContent}
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  );
}
