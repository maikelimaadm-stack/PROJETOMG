import { useCallback, useEffect, useState } from "react";
import {
  loadSearchFavorites,
  saveSearchFavorites,
} from "@/modules/empresas/components/empSearchView.constants";

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
    if (!recordId) return;
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      saveSearchFavorites(next);
      window.dispatchEvent(new CustomEvent("emp-favorites-updated"));
      return next;
    });
  }, []);

  const isFavorite = useCallback((recordId) => {
    if (!recordId) return false;
    return favorites.has(recordId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}
