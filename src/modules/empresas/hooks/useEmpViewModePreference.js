import { useCallback, useEffect, useState } from "react";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import {
  readStoredEmpViewMode,
  writeStoredEmpViewMode,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";
import { shouldRefreshListagemHydrate } from "@/modules/empresas/preferences/empListagemSectionCacheEvents";
import { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { normalizeEmpListViewMode } from "@/modules/empresas/layout/mgViewMode";

const shouldRefreshViewModeByCacheEvent = ({ reason = "" } = {}) => {
  const normalized = String(reason || "").toLowerCase();
  return shouldRefreshListagemHydrate(normalized) || normalized.includes("view");
};

/** Modelo de visualização (tabela/cards/registro) — mesmo padrão da configuração de pesquisa. */
export function useEmpViewModePreference(initialMode = "table") {
  const fallbackMode = normalizeEmpListViewMode(initialMode, { allowRecord: false });
  const [viewMode, setViewModeState] = useState(() => readStoredEmpViewMode() || fallbackMode);

  useEffect(() => {
    const reloadFromStorage = () => {
      if (isEmpPreferencesSectionDirty("view")) return;
      setViewModeState((current) => {
        const next = readStoredEmpViewMode() || fallbackMode;
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
  }, [fallbackMode]);

  const setViewMode = useCallback((mode) => {
    const normalized = normalizeEmpListViewMode(mode, { allowRecord: true });
    setViewModeState(normalized);
    writeStoredEmpViewMode(normalized, "listagem:view-mode");
  }, []);

  return { viewMode, setViewMode };
}
