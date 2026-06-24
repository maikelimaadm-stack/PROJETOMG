import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  buildCardCatalogFromColumnsInUse,
  buildCardDetailFieldsFromColumns,
  EMP_CARDS_LAYOUT_DEFAULT,
  getDefaultCardVisFields,
  getFieldsPerRowForLayout,
  loadCardsLayoutConfig,
  loadSearchVisFields,
  mergeSearchVisFields,
  normalizeCardsPerRow,
  saveCardsLayoutConfig,
  saveSearchVisFields,
  sortCardConfigFieldsAlphabetically,
} from "@/modules/empresas/components/empSearchView.constants";
import { getColumnsInUse } from "@/modules/empresas/utils/empTableColumnCatalog";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";

export function useEmpCardsVisFields() {
  const [columnLayoutVersion, setColumnLayoutVersion] = useState(0);

  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();

  useEffect(() => {
    const refresh = () => setColumnLayoutVersion((current) => current + 1);
    const unsubscribeCache = subscribeEmpPreferencesCache(refresh);
    window.addEventListener("emp-column-layout-updated", refresh);
    return () => {
      unsubscribeCache();
      window.removeEventListener("emp-column-layout-updated", refresh);
    };
  }, []);

  const columnsInUse = useMemo(() => {
    void columnLayoutVersion;
    return getColumnsInUse(camposPersonalizados).inUse;
  }, [camposPersonalizados, columnLayoutVersion]);

  const catalog = useMemo(
    () => buildCardCatalogFromColumnsInUse(columnsInUse),
    [columnsInUse]
  );

  const [visFields, setVisFields] = useState(() => loadSearchVisFields(EMP_SEARCH_DEFAULT_FIELDS));
  const [layoutConfig, setLayoutConfig] = useState(() => loadCardsLayoutConfig());

  const fieldsPerRow = useMemo(
    () => getFieldsPerRowForLayout(layoutConfig.cardsPerRow),
    [layoutConfig.cardsPerRow]
  );

  useEffect(() => {
    if (catalog.length === 0) return;
    setVisFields((current) => mergeSearchVisFields(catalog, current));
  }, [catalog]);

  const configFields = useMemo(() => {
    const merged = mergeSearchVisFields(
      catalog,
      visFields.length > 0 ? visFields : catalog
    );
    return sortCardConfigFieldsAlphabetically(merged);
  }, [catalog, visFields]);

  const detailFields = useMemo(
    () => buildCardDetailFieldsFromColumns(columnsInUse, configFields),
    [columnsInUse, configFields]
  );

  const saveConfig = useCallback(
    (nextFields) => {
      const normalized = mergeSearchVisFields(catalog, nextFields).map((field) => {
        const fallback =
          catalog.find((item) => item.key === field.key) ||
          EMP_SEARCH_DEFAULT_FIELDS.find((item) => item.key === field.key);
        return { ...fallback, ...field };
      });
      setVisFields(normalized);
      saveSearchVisFields(normalized);
    },
    [catalog]
  );

  const getRestoreDefaults = useCallback(
    () => sortCardConfigFieldsAlphabetically(getDefaultCardVisFields(catalog)),
    [catalog]
  );

  const saveLayoutConfig = useCallback((nextConfig) => {
    const normalized = { cardsPerRow: normalizeCardsPerRow(nextConfig?.cardsPerRow) };
    setLayoutConfig(normalized);
    saveCardsLayoutConfig(normalized);
  }, []);

  const getRestoreLayoutDefaults = useCallback(() => ({ ...EMP_CARDS_LAYOUT_DEFAULT }), []);

  return {
    configFields,
    detailFields,
    visFields,
    layoutConfig,
    fieldsPerRow,
    saveConfig,
    getRestoreDefaults,
    saveLayoutConfig,
    getRestoreLayoutDefaults,
  };
}
