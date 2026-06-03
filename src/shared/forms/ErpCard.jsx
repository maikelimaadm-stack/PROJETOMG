import React from "react";
import { cn } from "@/shared/utils/utils";

export default function ErpCard({ header, children, footer, actions, className }) {
  return (
    <section className={cn("erp-card", className)}>
      {header || actions ? (
        <header className="erp-card__header">
          {header}
          {actions ? <div className="erp-card__actions">{actions}</div> : null}
        </header>
      ) : null}
      {children ? <div className="erp-card__body">{children}</div> : null}
      {footer ? <footer className="erp-card__footer">{footer}</footer> : null}
    </section>
  );
}
