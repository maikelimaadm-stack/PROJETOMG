import React, { useEffect } from "react";
import MgMobileMenu from "@/modules/empresas/layout/MgMobileMenu";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";

export default function MgEmpresasMobileOverlays() {
  const {
    filterPanelOpen,
    closeFilterPanel,
    mobileMenuOpen,
    closeMobileMenu,
  } = useMgEmpresasChrome();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        closeFilterPanel();
        closeMobileMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFilterPanel, closeMobileMenu]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (filterPanelOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previous || "";
    }
    return () => {
      document.body.style.overflow = previous || "";
    };
  }, [filterPanelOpen, mobileMenuOpen]);

  return (
    <div className="mg-empresas-scope">
      <MgMobileMenu />
      <button
        type="button"
        className={`mg-filter-backdrop md:hidden${filterPanelOpen ? " open" : ""}`}
        aria-label="Fechar filtros"
        aria-hidden={!filterPanelOpen}
        tabIndex={filterPanelOpen ? 0 : -1}
        onClick={closeFilterPanel}
      />
      <button
        type="button"
        className={`mg-mobile-menu-backdrop${mobileMenuOpen ? " open" : ""}`}
        aria-label="Fechar menu"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={closeMobileMenu}
      />
    </div>
  );
}
