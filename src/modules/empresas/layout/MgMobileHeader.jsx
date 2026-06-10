import React from "react";
import { Filter, Menu } from "lucide-react";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";

export default function MgMobileHeader({ title = "MakGestão ERP" }) {
  const { toggleMobileMenu, toggleFilterPanel } = useMgEmpresasChrome();

  return (
    <header className="mobile-header md:hidden">
      <button
        type="button"
        className="ios-btn flex h-9 w-9 items-center justify-center"
        style={{ color: "var(--text-2)" }}
        onClick={toggleMobileMenu}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-[15px] font-bold"
          style={{ color: "var(--text-1)" }}
        >
          {title}
        </h1>
      </div>
      <button
        type="button"
        className="ios-btn flex h-9 w-9 items-center justify-center"
        style={{ color: "var(--text-3)" }}
        onClick={toggleFilterPanel}
        aria-label="Filtros"
      >
        <Filter className="h-5 w-5" />
      </button>
    </header>
  );
}
