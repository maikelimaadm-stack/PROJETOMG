import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import ErpCard from "./ErpCard";

export default function ErpFormSection({
  title,
  subtitle,
  children,
  defaultCollapsed = false,
  actions,
  className,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <ErpCard
      className={cn("erp-form-section", collapsed && "erp-form-section--collapsed", className)}
      header={
        <div className="erp-form-section__header">
          <button
            type="button"
            className="erp-form-section__toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
          >
            <ChevronDown className={cn("erp-form-section__chevron", collapsed && "erp-form-section__chevron--collapsed")} />
            <div>
              {title ? <h3 className="erp-form-section__title">{title}</h3> : null}
              {subtitle ? <p className="erp-form-section__subtitle">{subtitle}</p> : null}
            </div>
          </button>
          {actions ? <div className="erp-form-section__actions">{actions}</div> : null}
        </div>
      }
    >
      {!collapsed ? <div className="erp-form-section__body">{children}</div> : null}
    </ErpCard>
  );
}
