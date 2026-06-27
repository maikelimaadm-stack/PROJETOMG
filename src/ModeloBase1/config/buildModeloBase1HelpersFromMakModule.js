/**
 * Helpers padrão do motor ModeloBase1 — wired ao preferencesAdapter do makModule.
 */
import { getFieldsPerRowForLayout } from "@/framework/mak/search/makSearchView.utils.js";
import { isRemoteTabPreferenceEvent } from "@/framework/mak/preferences/makPreferencesCrossTab.js";

const toObject = (value, fallback = {}) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : fallback;

const DUPLICATE_STRIP_KEYS = new Set([
  "id",
  "created_date",
  "updated_date",
  "created_by",
  "id_global",
  "_isPersisting",
]);

export function buildModeloBase1HelpersFromMakModule(makModule) {
  const adapter = makModule.preferencesAdapter;
  const moduleId = makModule.moduleId ?? "cadastro";
  const prefix = adapter?.keyPrefix ?? moduleId;
  const tableMeta = makModule.metadata?.table ?? {};
  const defaultSort = tableMeta.defaultSort ?? { key: "codigo", direction: "asc" };
  const sortKey =
    tableMeta.preferenceKeys?.SORT_KEY ?? `${prefix}_sort_columns_v1`;
  const tempFiltersKey =
    tableMeta.preferenceKeys?.TEMP_FILTERS_KEY ?? `${prefix}_temp_listagem_filters`;

  const searchMeta = makModule.metadata?.search ?? {};
  const titleField = searchMeta.titleField ?? "nome";
  const codeField =
    searchMeta.codeField ?? searchMeta.primaryField ?? "codigo";

  const readStoredTempListagemFilters =
    tableMeta.storage?.readStoredTempListagemFilters ??
    (() => toObject(adapter?.readJson?.(tempFiltersKey, {}), {}));

  const writeStoredTempListagemFilters =
    tableMeta.storage?.writeStoredTempListagemFilters ??
    ((filters) =>
      adapter?.writeJson?.(tempFiltersKey, toObject(filters, {}), {
        reason: "listagem:temp-filters",
      }));

  const readInitialQuerySort = () => {
    const storedSort = adapter?.readJson?.(sortKey, null);
    const primarySort = Array.isArray(storedSort)
      ? storedSort.find((item) => item?.key)
      : storedSort?.key
        ? storedSort
        : null;
    if (primarySort?.key) {
      return {
        key: primarySort.key,
        direction: primarySort.direction === "desc" ? "desc" : "asc",
      };
    }
    return {
      key: defaultSort.key,
      direction: defaultSort.direction === "desc" ? "desc" : "asc",
    };
  };

  const readInitialColumnFiltersState = () =>
    toObject(readStoredTempListagemFilters(), {});

  return {
    readInitialQuerySort,
    readInitialColumnFiltersState,
    readStoredTempListagemFilters,
    writeStoredTempListagemFilters,
    isPreferencesSectionDirty: (section) =>
      adapter?.isSectionDirty?.(section) ?? false,
    isRemoteTabPreferenceEvent,
    subscribePreferencesCache: (listener) =>
      typeof listener === "function" && adapter?.subscribe
        ? adapter.subscribe(listener)
        : () => {},
    readPreferencesJson: (key, fallback) =>
      adapter?.readJson?.(key, fallback) ?? fallback,
    writePreferencesText: (key, value, opts) =>
      adapter?.writeText?.(key, value, opts),
    getFieldsPerRowForLayout,
    findRecordInList:
      makModule.findRecordInList ??
      ((list, record) => list.find((item) => item.id === record?.id) ?? record),
    normalizeRecord: makModule.normalizeRecord ?? ((record) => record),
    buildExportRows: makModule.buildExportRows ?? (() => []),
    buildDuplicateRecord: (record) => {
      const dup = { ...(record ?? {}) };
      DUPLICATE_STRIP_KEYS.forEach((key) => {
        delete dup[key];
      });
      if (codeField in dup) delete dup[codeField];
      return { ...dup, _isDuplicate: true };
    },
    getRecordCode: (record) =>
      record?.[codeField] != null ? String(record[codeField]) : "",
    getRecordTitle: (record, moduleLabels) =>
      record?.[titleField] ?? moduleLabels?.singular ?? "Novo registro",
    getAttachmentTitle: (record) =>
      record?.[titleField] ?? record?.[codeField] ?? "",
    matchRecordIdentity: (item, record) => item?.id === record?.id,
  };
}

export default buildModeloBase1HelpersFromMakModule;
