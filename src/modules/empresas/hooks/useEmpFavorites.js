import { useCallback, useEffect, useState } from "react";
import {
  loadSearchFavorites,
  saveSearchFavorites,
} from "@/modules/empresas/components/empSearchView.constants";

const normalizeFavoriteId = (recordId) => {
  if (recordId == null || recordId === "") return "";
  return String(recordId);
};

export function useEmpFavorites() {
  const [favorites, setFavorites] = useState(() => loadSearchFavorites());

  useEffect(() => {
    const sync = () => setFavorites(loadSearchFavorites());
    window.addEventListener("storage", sync);
    window.addEventListener("emp-favorites-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("emp-favorites-updated", sync);
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
