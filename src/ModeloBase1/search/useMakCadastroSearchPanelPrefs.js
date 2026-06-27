import { useCallback, useEffect, useState } from "react";
import { useModeloBase1Config } from "@/ModeloBase1/config";
import {
  loadSearchFavoritesFromAdapter,
  loadSearchVisFieldsFromAdapter,
  saveSearchFavoritesToAdapter,
  saveSearchVisFieldsToAdapter,
} from "@/framework/mak/search/makSearchView.utils.js";

/**
 * Preferências locais do SearchPanel — metadata-driven via searchView + preferencesAdapter.
 */
export function useMakCadastroSearchPanelPrefs(catalog = []) {
  const config = useModeloBase1Config();
  const adapter = config.preferencesAdapter;
  const searchView = config.searchView ?? {};
  const cardsVisKey = searchView.cardsVisKey ?? `${adapter?.keyPrefix ?? config.moduleId}_search_vis`;
  const favoritesKey = searchView.favoritesKey ?? `${adapter?.keyPrefix ?? config.moduleId}_search_favorites`;
  const favoritesUpdatedEvent =
    searchView.favoritesUpdatedEvent ?? `${config.moduleId}-favorites-updated`;
  const cardsUpdatedEvent =
    searchView.filterFieldsLayoutUpdatedEvent ?? `${config.moduleId}-filter-fields-layout-updated`;

  const loadVis = useCallback(
    () =>
      searchView.loadSearchVisFields
        ? searchView.loadSearchVisFields(catalog)
        : loadSearchVisFieldsFromAdapter(adapter, cardsVisKey, catalog),
    [adapter, cardsVisKey, catalog, searchView]
  );

  const loadFav = useCallback(
    () =>
      searchView.loadSearchFavorites
        ? searchView.loadSearchFavorites()
        : loadSearchFavoritesFromAdapter(adapter, favoritesKey),
    [adapter, favoritesKey, searchView]
  );

  const [visFields, setVisFields] = useState(() => loadVis());
  const [favorites, setFavorites] = useState(() => loadFav());

  useEffect(() => {
    const refresh = () => {
      setVisFields(loadVis());
      setFavorites(loadFav());
    };
    const unsubscribe = adapter?.subscribe?.((detail) => {
      const reason = String(detail?.reason ?? "").toLowerCase();
      if (
        reason.includes("favorites") ||
        reason.includes("cards") ||
        reason.includes("listagem")
      ) {
        refresh();
      }
    });
    window.addEventListener(favoritesUpdatedEvent, refresh);
    window.addEventListener(cardsUpdatedEvent, refresh);
    return () => {
      unsubscribe?.();
      window.removeEventListener(favoritesUpdatedEvent, refresh);
      window.removeEventListener(cardsUpdatedEvent, refresh);
    };
  }, [adapter, cardsUpdatedEvent, favoritesUpdatedEvent, loadFav, loadVis]);

  const saveVisFields = useCallback(
    (fields) => {
      if (searchView.saveSearchVisFields) {
        searchView.saveSearchVisFields(fields);
      } else {
        saveSearchVisFieldsToAdapter(adapter, cardsVisKey, fields);
      }
      setVisFields(fields);
    },
    [adapter, cardsVisKey, searchView]
  );

  const toggleFavorite = useCallback(
    (recordId, event) => {
      event?.stopPropagation();
      setFavorites((current) => {
        const next = new Set(current);
        const id = String(recordId);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        if (searchView.saveSearchFavorites) {
          searchView.saveSearchFavorites(next);
        } else {
          saveSearchFavoritesToAdapter(adapter, favoritesKey, next);
        }
        window.dispatchEvent(new CustomEvent(favoritesUpdatedEvent));
        return next;
      });
    },
    [adapter, favoritesKey, favoritesUpdatedEvent, searchView]
  );

  return { visFields, favorites, saveVisFields, toggleFavorite };
}

export default useMakCadastroSearchPanelPrefs;
