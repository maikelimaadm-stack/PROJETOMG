import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useMgEmpresasChrome } from "./MgEmpresasChromeContext";
import MgMobileHeader from "./MgMobileHeader";
import MgDesktopHeader from "./MgDesktopHeader";
import MgPrototypeSidebar from "./MgPrototypeSidebar";
import MgMobileMenu from "./MgMobileMenu";
import MgMobileViewBar from "./MgMobileViewBar";

function EmpresasLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: "var(--text-3)" }}>
      Carregando...
    </div>
  );
}

/**
 * Shell idêntico ao HTML MakGestão (body > mobile-header + flex col > desktop header + sidebar + content).
 */
export default function MgEmpresasShell() {
  const {
    filterPanelOpen,
    setFilterPanelOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    viewMode,
    onViewModeChange,
  } = useMgEmpresasChrome();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setFilterPanelOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setFilterPanelOpen, setMobileMenuOpen]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (filterPanelOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev || "";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [filterPanelOpen, mobileMenuOpen]);

  return (
    <div
      className="mg-empresas-scope cadastro-emp-scope w-full overflow-hidden flex flex-col"
      style={{
        height: "100dvh",
        minHeight: "100dvh",
        background: "var(--bg-page)",
      }}
    >
      <MgMobileHeader />

      <div className="flex flex-1 min-h-0 overflow-hidden flex-col">
        <MgDesktopHeader />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <MgPrototypeSidebar />

          <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">
            <Suspense fallback={<EmpresasLoadingFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </div>

        <MgMobileMenu />
        <MgMobileViewBar value={viewMode} onChange={onViewModeChange} />
      </div>

      <button
        type="button"
        className={`mg-filter-backdrop md:hidden${filterPanelOpen ? " open" : ""}`}
        aria-label="Fechar filtros"
        aria-hidden={!filterPanelOpen}
        tabIndex={filterPanelOpen ? 0 : -1}
        onClick={() => setFilterPanelOpen(false)}
      />
      <button
        type="button"
        className={`mg-mobile-menu-backdrop md:hidden${mobileMenuOpen ? " open" : ""}`}
        aria-label="Fechar menu"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}
