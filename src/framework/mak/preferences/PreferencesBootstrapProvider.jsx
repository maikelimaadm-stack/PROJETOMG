import React, { createContext, useContext } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useEmpresasPreferencesBootstrap } from "@/modules/empresas/preferences/useEmpresasPreferencesBootstrap";

const MakPreferencesBootstrapContext = createContext(null);

const DEFAULT_MODULE_IDS = ["empresas"];

/**
 * Provider genérico de bootstrap de preferências.
 * Hoje delega ao subsistema empresas; novos módulos registram hooks aqui.
 */
export function MakPreferencesBootstrapProvider({
  children,
  moduleIds = DEFAULT_MODULE_IDS,
}) {
  const { user, isAuthenticated } = useAuth();
  const enabledModuleIds = Array.isArray(moduleIds) ? moduleIds : DEFAULT_MODULE_IDS;
  const empresasEnabled = enabledModuleIds.includes("empresas");

  const empresasBootstrap = useEmpresasPreferencesBootstrap(
    empresasEnabled && isAuthenticated ? user?.id : null
  );

  const value = {
    moduleIds: enabledModuleIds,
    empresas: empresasBootstrap,
    /** Estado unificado — hoje espelha empresas até outros módulos registrarem bootstrap */
    ...empresasBootstrap,
  };

  return (
    <MakPreferencesBootstrapContext.Provider value={value}>
      {children}
    </MakPreferencesBootstrapContext.Provider>
  );
}

export function useMakPreferencesBootstrapState() {
  const value = useContext(MakPreferencesBootstrapContext);
  if (!value) {
    throw new Error(
      "useMakPreferencesBootstrapState must be used within MakPreferencesBootstrapProvider"
    );
  }
  return value;
}
