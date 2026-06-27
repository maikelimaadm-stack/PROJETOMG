import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useMakPreferencesBootstrapAggregator } from "./useMakPreferencesBootstrapAggregator.js";

import { listMakPreferencesBootstrapModuleIds } from "./bootstrapRegistry.js";
import "@/modules/makBootstrap/registerMakPreferencesBootstrapModules.js";

const MakPreferencesBootstrapContext = createContext(null);

/**
 * Provider genérico de bootstrap de preferências.
 * Módulos registram hooks via registerMakPreferencesBootstrapModule + useBootstrapHook injetado.
 */
export function MakPreferencesBootstrapProvider({
  children,
  moduleIds,
  useBootstrapHook,
}) {
  const { user, isAuthenticated } = useAuth();
  const registryModuleIds = listMakPreferencesBootstrapModuleIds();
  const enabledModuleIds = Array.isArray(moduleIds)
    ? moduleIds
    : registryModuleIds.length
      ? registryModuleIds
      : ["empresas"];
  const activeUserId = isAuthenticated ? user?.id : null;

  const aggregated = useMakPreferencesBootstrapAggregator(
    enabledModuleIds,
    activeUserId,
    useBootstrapHook
  );
  const empresasBootstrap = aggregated.empresas;

  const value = useMemo(
    () => ({
      moduleIds: enabledModuleIds,
      modules: aggregated.modules,
      empresas: empresasBootstrap,
      produtos: aggregated.produtos ?? null,
      marcas: aggregated.marcas ?? null,
      cadcps: aggregated.cadcps ?? null,
      primary: aggregated.primary ?? empresasBootstrap ?? null,
      /** Estado unificado — espelha módulo primário para compatibilidade */
      ...(aggregated.primary || empresasBootstrap || {}),
    }),
    [enabledModuleIds, aggregated, empresasBootstrap]
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
