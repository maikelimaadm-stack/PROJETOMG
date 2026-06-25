import { useCallback, useEffect, useState } from "react";
import {
  loadSearchFavorites,
  saveSearchFavorites,
} from "@/modules/empresas/components/empSearchView.constants";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";
import { shouldRefreshListagemHydrate } from "@/modules/empresas/preferences/empListagemSectionCacheEvents";

const shouldRefreshFavoritesByCacheEvent = ({ reason = "" } = {}) => {
  const normalized = String(reason || "").toLowerCase();
  return shouldRefreshListagemHydrate(normalized) || normalized.includes("favorites");
};

const normalizeFavoriteId = (recordId) => {
  if (recordId == null || recordId === "") return "";
  return String(recordId);
};

export function useEmpFavorites() {
  const [favorites, setFavorites] = useState(() => loadSearchFavorites());

  useEffect(() => {
    const reloadFromStorage = () => setFavorites(loadSearchFavorites());

    reloadFromStorage();

    const unsubscribeCache = subscribeEmpPreferencesCache((detail) => {
      if (!shouldRefreshFavoritesByCacheEvent(detail)) return;
      reloadFromStorage();
    });

    const onDomOrBootstrap = () => reloadFromStorage();
    window.addEventListener("emp-favorites-updated", onDomOrBootstrap);
    window.addEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onDomOrBootstrap);

    return () => {
      unsubscribeCache();
      window.removeEventListener("emp-favorites-updated", onDomOrBootstrap);
      window.removeEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onDomOrBootstrap);
    };
  }, []);

  const toggleFavorite = useCallback((recordId) => {
    const id = normalizeFavoriteId(recordId);
    if (!id) return;
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSearchFavorites(next);
      window.dispatchEvent(new CustomEvent("emp-favorites-updated"));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (recordId) => {
      const id = normalizeFavoriteId(recordId);
      if (!id) return false;
      return favorites.has(id);
    },
    [favorites]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}
