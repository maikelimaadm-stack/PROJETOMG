import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const MgEmpresasChromeContext = createContext(null);

export function MgEmpresasChromeProvider({ children }) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [viewMode, setViewMode] = useState("tabela");
  const [breadcrumbSuffix, setBreadcrumbSuffix] = useState(null);
  const onViewModeChangeRef = useRef(null);

  const registerViewModeBridge = useCallback((nextValue, nextHandler) => {
    setViewMode(nextValue);
    onViewModeChangeRef.current = nextHandler;
  }, []);

  const onViewModeChange = useCallback((mode) => {
    onViewModeChangeRef.current?.(mode);
  }, []);

  const value = useMemo(
    () => ({
      filterPanelOpen,
      setFilterPanelOpen,
      toggleFilterPanel: () => setFilterPanelOpen((open) => !open),
      closeFilterPanel: () => setFilterPanelOpen(false),
      mobileMenuOpen,
      setMobileMenuOpen,
      toggleMobileMenu: () => setMobileMenuOpen((open) => !open),
      closeMobileMenu: () => setMobileMenuOpen(false),
      sidebarPinned,
      setSidebarPinned,
      toggleSidebarPinned: () => setSidebarPinned((pinned) => !pinned),
      viewMode,
      onViewModeChange,
      registerViewModeBridge,
      breadcrumbSuffix,
      setBreadcrumbSuffix,
    }),
    [
      filterPanelOpen,
      mobileMenuOpen,
      onViewModeChange,
      registerViewModeBridge,
      sidebarPinned,
      viewMode,
      breadcrumbSuffix,
    ]
  );

  return (
    <MgEmpresasChromeContext.Provider value={value}>{children}</MgEmpresasChromeContext.Provider>
  );
}

export function useMgEmpresasChrome() {
  const context = useContext(MgEmpresasChromeContext);
  if (!context) {
    throw new Error("useMgEmpresasChrome must be used within MgEmpresasChromeProvider");
  }
  return context;
}
