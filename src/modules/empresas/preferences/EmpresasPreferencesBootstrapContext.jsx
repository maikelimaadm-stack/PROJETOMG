import React, { createContext, useContext } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useEmpresasPreferencesBootstrap } from "@/modules/empresas/preferences/useEmpresasPreferencesBootstrap";

const EmpresasPreferencesBootstrapContext = createContext(null);

export function EmpresasPreferencesBootstrapProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const bootstrap = useEmpresasPreferencesBootstrap(isAuthenticated ? user?.id : null);

  return (
    <EmpresasPreferencesBootstrapContext.Provider value={bootstrap}>
      {children}
    </EmpresasPreferencesBootstrapContext.Provider>
  );
}

export function useEmpresasPreferencesBootstrapState() {
  const value = useContext(EmpresasPreferencesBootstrapContext);
  if (!value) {
    throw new Error(
      "useEmpresasPreferencesBootstrapState must be used within EmpresasPreferencesBootstrapProvider"
    );
  }
  return value;
}
