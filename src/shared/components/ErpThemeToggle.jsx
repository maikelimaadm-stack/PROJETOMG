import React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { useErpTheme } from "@/shared/contexts/ErpThemeContext";

export default function ErpThemeToggle({ className, variant = "mg" }) {
  const { isEscuro, toggleTema, tema } = useErpTheme();
  const label = isEscuro ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button
      type="button"
      className={cn(
        variant === "mg" ? "mg-topbar-icon-btn ios-btn" : "erp-theme-toggle ios-btn",
        isEscuro && "erp-theme-toggle--escuro",
        className
      )}
      onClick={toggleTema}
      aria-label={label}
      title={label}
      aria-pressed={isEscuro}
      data-tema-ativo={tema}
    >
      {isEscuro ? (
        <Sun className="h-3.5 w-3.5" strokeWidth={2} />
      ) : (
        <Moon className="h-3.5 w-3.5" strokeWidth={2} />
      )}
    </button>
  );
}
