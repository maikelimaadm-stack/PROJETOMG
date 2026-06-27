/**
 * Factory genérica para persistência de layout de campos de filtro (V15).
 * @param {object} options
 * @param {string} options.storageKey
 * @param {string} [options.moduleId]
 * @param {() => object} options.readJson
 * @param {(key: string, value: object, meta?: object) => void} options.writeJson
 * @param {(moduleId: string, event: string) => void} [options.dispatchEvent]
 */
export function createMakFilterFieldsLayoutStorage({
  storageKey,
  moduleId = "",
  readJson,
  writeJson,
  dispatchEvent = null,
}) {
  const dispatchLayoutUpdated = () => {
    if (typeof dispatchEvent === "function" && moduleId) {
      dispatchEvent(moduleId, "filter-fields-layout-updated");
    }
  };

  const mergeSavedFilterFieldOrder = (savedOrder, catalogKeys) => {
    const parsed = Array.isArray(savedOrder)
      ? [...new Set(savedOrder.filter((key) => catalogKeys.includes(key)))]
      : [];
    const missing = catalogKeys.filter((key) => !parsed.includes(key));
    return [...parsed, ...missing];
  };

  const mergeSavedVisibleFilterFields = (savedVisible, catalogKeys) => {
    if (!Array.isArray(savedVisible)) return [...catalogKeys];
    return savedVisible.filter((key) => catalogKeys.includes(key));
  };

  const mergeVisibleFilterFieldsWithCatalog = (savedVisible, catalogKeys, savedOrder = []) => {
    const base = mergeSavedVisibleFilterFields(savedVisible, catalogKeys);
    const knownKeys = Array.isArray(savedOrder)
      ? savedOrder.filter((key) => catalogKeys.includes(key))
      : [];
    const brandNewKeys = catalogKeys.filter((key) => !knownKeys.includes(key));
    return brandNewKeys.length ? [...base, ...brandNewKeys] : base;
  };

  const loadFilterFieldsLayout = (catalogKeys = []) => {
    const defaultLayout = { visiveis: [...catalogKeys], ordem: [...catalogKeys] };
    if (catalogKeys.length === 0) return defaultLayout;
    const parsed = readJson(storageKey, null);
    if (!parsed || typeof parsed !== "object") return defaultLayout;
    const ordem = mergeSavedFilterFieldOrder(parsed?.ordem, catalogKeys);
    const visiveis = mergeVisibleFilterFieldsWithCatalog(parsed?.visiveis, catalogKeys, ordem);
    return { visiveis, ordem };
  };

  const saveFilterFieldsLayout = ({ visiveis = [], ordem = [] } = {}) => {
    writeJson(storageKey, { visiveis, ordem }, { reason: "listagem:filter-layout" });
    dispatchLayoutUpdated();
  };

  const applyFilterFieldsLayout = (catalogFields = [], layout = {}) => {
    const byKey = new Map(catalogFields.map((field) => [field.key, field]));
    const ordem = mergeSavedFilterFieldOrder(
      layout.ordem,
      catalogFields.map((field) => field.key)
    );
    const visiveis = new Set(
      mergeSavedVisibleFilterFields(
        layout.visiveis,
        catalogFields.map((field) => field.key)
      )
    );
    return ordem
      .filter((key) => visiveis.has(key) && byKey.has(key))
      .map((key) => byKey.get(key));
  };

  const getDefaultFilterFieldsLayout = (catalogKeys = []) => ({
    visiveis: [...catalogKeys],
    ordem: [...catalogKeys],
  });

  return {
    storageKey,
    mergeSavedFilterFieldOrder,
    mergeSavedVisibleFilterFields,
    mergeVisibleFilterFieldsWithCatalog,
    loadFilterFieldsLayout,
    saveFilterFieldsLayout,
    applyFilterFieldsLayout,
    getDefaultFilterFieldsLayout,
  };
}

export default createMakFilterFieldsLayoutStorage;
