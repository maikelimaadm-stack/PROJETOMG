import React from "react";
import { cn } from "@/shared/utils/utils";

/**
 * Grid responsivo — no máximo 4 colunas no desktop.
 */
export default function ErpFormGrid({ children, className, columns }) {
  const colClass =
    columns === 1
      ? "erp-form-grid--1"
      : columns === 2
        ? "erp-form-grid--2"
        : columns === 3
          ? "erp-form-grid--3"
          : "erp-form-grid--4";

  return <div className={cn("erp-form-grid", colClass, className)}>{children}</div>;
}
