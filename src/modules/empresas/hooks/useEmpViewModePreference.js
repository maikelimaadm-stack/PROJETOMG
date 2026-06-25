import { useCallback, useEffect, useState } from "react";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import {
  readStoredEmpViewMode,
  writeStoredEmpViewMode,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";
import { shouldRefreshListagemHydrate } from "@/modules/empresas/preferences/empListagemSectionCacheEvents";

const shouldRefreshViewModeByCacheEvent = ({ reason = "" } = {}) => {
  const normalized = String(reason || "").toLowerCase();
  return shouldRefreshListagemHydrate(normalized) || normalized.includes("view");
};

/** Modelo de visualização (tabela/cards/registro) — mesmo padrão da configuração de pesquisa. */
export function useEmpViewModePreference(initialMode = "table") {
  const [viewMode, setViewModeState] = useState(() => readStoredEmpViewMode() || initialMode);

  useEffect(() => {
    const reloadFromStorage = () => {
      setViewModeState((current) => {
        const next = readStoredEmpViewMode() || initialMode;
        return current === next ? current : next;
      });
    };

    reloadFromStorage();

    const unsubscribe = subscribeEmpPreferencesCache((detail) => {
      if (!shouldRefreshViewModeByCacheEvent(detail)) return;
      reloadFromStorage();
    });

    const onDomOrBootstrap = () => reloadFromStorage();
    window.addEventListener("emp-view-mode-updated", onDomOrBootstrap);
    window.addEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onDomOrBootstrap);

    return () => {
      unsubscribe();
      window.removeEventListener("emp-view-mode-updated", onDomOrBootstrap);
      window.removeEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onDomOrBootstrap);
    };
  }, [initialMode]);

  const setViewMode = useCallback((mode) => {
    setViewModeState(mode);
    writeStoredEmpViewMode(mode, "listagem:view-mode");
  }, []);

  return { viewMode, setViewMode };
}
