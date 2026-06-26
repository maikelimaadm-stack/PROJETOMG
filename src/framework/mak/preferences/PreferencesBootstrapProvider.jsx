import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useMakPreferencesBootstrapAggregator } from "./useMakPreferencesBootstrapAggregator.js";
import "@/modules/empresas/preferences/registerEmpresasPreferencesBootstrap.js";

const MakPreferencesBootstrapContext = createContext(null);

const DEFAULT_MODULE_IDS = ["empresas"];

/**
 * Provider genérico de bootstrap de preferências.
 * Módulos registram hooks via registerMakPreferencesBootstrapModule + aggregator.
 */
export function MakPreferencesBootstrapProvider({
  children,
  moduleIds = DEFAULT_MODULE_IDS,
}) {
  const { user, isAuthenticated } = useAuth();
  const enabledModuleIds = Array.isArray(moduleIds) ? moduleIds : DEFAULT_MODULE_IDS;
  const activeUserId = isAuthenticated ? user?.id : null;

  const aggregated = useMakPreferencesBootstrapAggregator(enabledModuleIds, activeUserId);
  const empresasBootstrap = aggregated.empresas;

  const value = useMemo(
    () => ({
      moduleIds: enabledModuleIds,
      modules: aggregated.modules,
      empresas: empresasBootstrap,
      /** Estado unificado — espelha empresas para compatibilidade */
      ...(empresasBootstrap || {}),
    }),
    [enabledModuleIds, aggregated.modules, empresasBootstrap]
  );

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
