import { useCallback, useEffect, useState } from "react";
import { useModeloBase1Config } from "@/ModeloBase1/config";

const normalizeFavoriteId = (recordId) => {
  if (recordId == null || recordId === "") return "";
  return String(recordId);
};

const loadFavoritesSet = (adapter, key) => {
  const raw = adapter?.readJson?.(key, []);
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.map((id) => normalizeFavoriteId(id)).filter(Boolean));
};

const saveFavoritesSet = (adapter, key, favorites, reason) => {
  adapter?.writeJson?.(key, [...favorites], { reason: reason ?? "listagem:favorites" });
};

/**
 * Favoritos de pesquisa — genérico por preferencesAdapter + searchView config.
 */
export function useModeloBase1Favorites() {
  const config = useModeloBase1Config();
  const adapter = config.preferencesAdapter;
  const searchView = config.searchView ?? {};
  const favoritesKey = searchView.favoritesKey ?? `${config.moduleId}_search_favorites`;
  const updatedEvent = searchView.favoritesUpdatedEvent ?? `${config.moduleId}-favorites-updated`;
  const bootstrapEvent = adapter?.bootstrapAppliedEvent;

  const [favorites, setFavorites] = useState(() => loadFavoritesSet(adapter, favoritesKey));

  useEffect(() => {
    const reloadFromStorage = () => setFavorites(loadFavoritesSet(adapter, favoritesKey));
    reloadFromStorage();

    const unsubscribe = adapter?.subscribe?.((detail) => {
      const reason = String(detail?.reason ?? "").toLowerCase();
      if (reason.includes("favorites") || reason.includes("listagem")) reloadFromStorage();
    });

    const onDomOrBootstrap = () => reloadFromStorage();
    window.addEventListener(updatedEvent, onDomOrBootstrap);
    if (bootstrapEvent) window.addEventListener(bootstrapEvent, onDomOrBootstrap);

    return () => {
      unsubscribe?.();
      window.removeEventListener(updatedEvent, onDomOrBootstrap);
      if (bootstrapEvent) window.removeEventListener(bootstrapEvent, onDomOrBootstrap);
    };
  }, [adapter, favoritesKey, updatedEvent, bootstrapEvent]);

  const toggleFavorite = useCallback(
    (recordId) => {
      const id = normalizeFavoriteId(recordId);
      if (!id) return;
      setFavorites((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        saveFavoritesSet(adapter, favoritesKey, next);
        window.dispatchEvent(new CustomEvent(updatedEvent));
        return next;
      });
    },
    [adapter, favoritesKey, updatedEvent]
  );

  const isFavorite = useCallback(
    (recordId) => {
      const id = normalizeFavoriteId(recordId);
      if (!id) return false;
      return favorites.has(id);
    },
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}

export default useModeloBase1Favorites;
