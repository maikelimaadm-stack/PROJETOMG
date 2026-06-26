/**
 * searchView config genérico a partir de makModule — promovido do padrão Empresas.
 */
import {
  getDefaultCardVisFields,
  getFieldsPerRowForLayout,
  MAK_CARDS_LAYOUT_DEFAULT,
  normalizeCardsPerRow,
  loadSearchFavoritesFromAdapter,
  saveSearchFavoritesToAdapter,
  defaultGetSearchFieldValue,
} from "@/framework/mak/search/makSearchView.utils.js";
import {
  applyFilterFieldsLayout,
  createFilterFieldsLayoutStorage,
  getDefaultFilterFieldsLayout,
  mergeSavedFilterFieldOrder,
  mergeSavedVisibleFilterFields,
} from "@/ModeloBase1/utils/filterFieldsLayout.js";

const sortCardFieldsAlphabetically = (fields = []) =>
  [...fields].sort((left, right) =>
    String(left.label ?? left.key).localeCompare(String(right.label ?? right.key), "pt-BR")
  );

const mergeSearchVisFields = (catalog = [], visFields = []) => {
  if (!Array.isArray(visFields) || visFields.length === 0) return catalog;
  const catalogMap = new Map(catalog.map((field) => [field.key, field]));
  return visFields.map((field) => ({ ...catalogMap.get(field.key), ...field })).filter((field) => field.key);
};

export function buildSearchViewFromMakModule(makModule) {
  const moduleId = makModule.moduleId ?? "cadastro";
  const prefix = makModule.preferencesAdapter?.keyPrefix ?? moduleId;
  const searchMeta = makModule.metadata?.search ?? {};
  const cardFields = (searchMeta.cardFields ?? []).map((field) => ({
    visible: true,
    primary: field.key === searchMeta.primaryField,
    ...field,
  }));
  const primaryField = searchMeta.primaryField ?? cardFields[0]?.key ?? "nome";

  const buildCardCatalog = (customFields = []) => {
    const normalizedCustom = (customFields ?? [])
      .filter((campo) => campo?.ativo !== false)
      .map((campo) => ({
        key: `custom:${campo.field_name ?? campo.key}`,
        label: campo.label || campo.field_name || campo.key,
        visible: false,
        primary: false,
        column: campo.field_name ?? campo.key,
      }));
    return sortCardFieldsAlphabetically([...cardFields, ...normalizedCustom]);
  };

  const adapter = makModule.preferencesAdapter;

  const loadJsonFields = (storageKey, catalog) => {
    const saved = adapter?.readJson?.(storageKey, null);
    if (!saved || typeof saved !== "object") return catalog.map((field) => ({ ...field }));
    return catalog.map((field) => ({
      ...field,
      visible: saved[field.key] !== undefined ? Boolean(saved[field.key]) : field.visible,
    }));
  };

  const saveJsonFields = (storageKey, fields, reason) => {
    const payload = {};
    fields.forEach((field) => {
      payload[field.key] = Boolean(field.visible);
    });
    adapter?.writeJson?.(storageKey, payload, { reason });
  };

  const favoritesKey = `${prefix}_search_favorites`;
  const dropdownVisKey = `${prefix}_search_dropdown_vis`;
  const cardsVisKey = `${prefix}_search_vis`;
  const cardsLayoutKey = `${prefix}_cards_layout`;
  const filterFieldsLayoutKey = `${prefix}_filter_fields_layout`;
  const filterFieldsUpdatedEvent = `${moduleId}-filter-fields-layout-updated`;
  const filterFieldsStorage = createFilterFieldsLayoutStorage({
    adapter,
    storageKey: filterFieldsLayoutKey,
    updatedEvent: filterFieldsUpdatedEvent,
  });

  return {
    favoritesKey,
    favoritesUpdatedEvent: `${moduleId}-favorites-updated`,
    viewModeKey: `${prefix}_view_mode`,
    viewModeUpdatedEvent: `${moduleId}-view-mode-updated`,
    dropdownVisKey,
    cardsVisKey,
    cardsLayoutKey,
    cardsLayoutDefault: MAK_CARDS_LAYOUT_DEFAULT,
    filterFieldsLayoutKey,
    filterFieldsLayoutUpdatedEvent: filterFieldsUpdatedEvent,
    defaultFields: cardFields,
    buildCardCatalog,
    mergeSearchVisFields,
    loadSearchDropdownVisFields: (catalog) => loadJsonFields(dropdownVisKey, catalog),
    saveSearchDropdownVisFields: (fields) =>
      saveJsonFields(dropdownVisKey, fields, "listagem:dropdown-fields"),
    loadSearchVisFields: (catalog) => loadJsonFields(cardsVisKey, catalog),
    saveSearchVisFields: (fields) => saveJsonFields(cardsVisKey, fields, "listagem:cards-fields"),
    loadCardsLayoutConfig: () => {
      const parsed = adapter?.readJson?.(cardsLayoutKey, null);
      if (!parsed || typeof parsed !== "object") return { ...MAK_CARDS_LAYOUT_DEFAULT };
      return { cardsPerRow: normalizeCardsPerRow(parsed?.cardsPerRow) };
    },
    saveCardsLayoutConfig: (layout) => {
      adapter?.writeJson?.(
        cardsLayoutKey,
        { cardsPerRow: normalizeCardsPerRow(layout?.cardsPerRow) },
        { reason: "listagem:cards-layout" }
      );
    },
    normalizeCardsPerRow,
    getFieldsPerRowForLayout,
    sortCardFieldsAlphabetically,
    sortCardConfigFieldsByOrder: (fields) => fields,
    loadCardFieldOrder: () => [],
    buildSearchDropdownDetailFields: (catalog, visFields) =>
      mergeSearchVisFields(catalog, visFields).filter(
        (field) => field.visible && field.key !== primaryField
      ),
    getDefaultCardVisFields,
    loadFilterFieldsLayout: filterFieldsStorage.loadFilterFieldsLayout,
    saveFilterFieldsLayout: filterFieldsStorage.saveFilterFieldsLayout,
    applyFilterFieldsLayout,
    getDefaultFilterFieldsLayout,
    mergeSavedVisibleFilterFields,
    mergeSavedFilterFieldOrder,
    loadSearchFavorites: () => loadSearchFavoritesFromAdapter(adapter, favoritesKey),
    saveSearchFavorites: (favorites) =>
      saveSearchFavoritesToAdapter(adapter, favoritesKey, favorites),
    formatSearchFieldValue: defaultGetSearchFieldValue,
  };
}

export default buildSearchViewFromMakModule;
