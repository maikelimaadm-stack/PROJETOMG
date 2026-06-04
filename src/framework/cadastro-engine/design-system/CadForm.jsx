import React from "react";
import { cn } from "@/shared/utils/utils";

export default function CadForm({ children, className = "", as: Component = "section", ...props }) {
  return (
    <Component className={cn("cadastro-scope cadastro-emp-scope erp-ui", className)} {...props}>
      {children}
    </Component>
  );
}
