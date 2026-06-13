import React from "react";
import { Filter, Hexagon, Menu } from "lucide-react";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";
import ErpThemeToggle from "@/shared/components/ErpThemeToggle";

export default function MgMobileHeader({ title = "MakGestão ERP" }) {
  const { toggleMobileMenu, toggleFilterPanel, breadcrumbSuffix } = useMgEmpresasChrome();
  const displayTitle = breadcrumbSuffix || title;

  return (
    <header className="mobile-header md:hidden">
      <button
        type="button"
        className="ios-btn flex h-8 w-8 items-center justify-center"
        onClick={toggleMobileMenu}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[13px] font-semibold">{displayTitle}</h1>
      </div>
      <button
        type="button"
        className="ios-btn flex h-8 w-8 items-center justify-center"
        onClick={toggleFilterPanel}
        aria-label="Filtros"
      >
        <Filter className="h-4 w-4" />
      </button>
      <ErpThemeToggle className="flex h-8 w-8 items-center justify-center" />
      <div className="mg-desktop-header__logo" aria-hidden="true">
        <Hexagon className="h-4 w-4 text-white" strokeWidth={2.2} />
      </div>
    </header>
  );
}
