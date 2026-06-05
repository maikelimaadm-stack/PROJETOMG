import React, { useMemo } from "react";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function getValidationState({ filled, total }) {
  if (total <= 0) return null;
  if (filled >= total) return "complete";
  if (filled > 0) return "partial";
  return "pending";
}

export default function FormValidationStatus({
  filled = 0,
  total = 0,
  pending = 0,
  className = "",
}) {
  const state = useMemo(() => getValidationState({ filled, total }), [filled, total]);
  const pendingCount = pending > 0 ? pending : Math.max(0, total - filled);

  const label = useMemo(() => {
    if (!state) return "";
    if (state === "complete") return "Todos os obrigatórios preenchidos";
    if (state === "partial") {
      return `${filled} de ${total} obrigatórios preenchidos`;
    }
    return `${pendingCount} ${pluralize(pendingCount, "obrigatório pendente", "obrigatórios pendentes")}`;
  }, [state, filled, total, pendingCount]);

  const tooltip = useMemo(() => {
    if (!state) return "";
    if (state === "complete") return "Todos os campos obrigatórios foram preenchidos.";
    return `Existem ${pendingCount} ${pluralize(pendingCount, "campo obrigatório", "campos obrigatórios")} que ainda precisam ser preenchidos.`;
  }, [state, pendingCount]);

  if (!state) return null;

  const iconAnimated = state === "pending";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`form-validation-status form-validation-status--${state} ${className}`.trim()}
            role="status"
            aria-live="polite"
            aria-label={label}
          >
            <span
              className={`form-validation-status__icon${iconAnimated ? " form-validation-status__icon--pulse" : ""}`}
              aria-hidden="true"
            >
              {state === "complete" ? (
                <Check className="form-validation-status__check" strokeWidth={2.5} />
              ) : (
                <span className="form-validation-status__dot" />
              )}
            </span>
            <span className="form-validation-status__label">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="form-validation-status__tooltip max-w-[280px] border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-normal text-[#334155] shadow-md"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
