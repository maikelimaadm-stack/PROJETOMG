import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  buildEmpCardFieldCatalog,
  buildSearchDropdownDetailFields,
  getDefaultCardVisFields,
  loadSearchDropdownVisFields,
  mergeSearchVisFields,
  saveSearchDropdownVisFields,
  sortCardConfigFieldsAlphabetically,
} from "@/modules/empresas/components/empSearchView.constants";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";

export function useEmpSearchDropdownFields() {
  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();

  const catalog = useMemo(
    () => sortCardConfigFieldsAlphabetically(buildEmpCardFieldCatalog(camposPersonalizados)),
    [camposPersonalizados]
  );

  const [visFields, setVisFields] = useState(() => loadSearchDropdownVisFields(EMP_SEARCH_DEFAULT_FIELDS));

  useEffect(() => {
    const sourceCatalog = catalog.length > 0 ? catalog : EMP_SEARCH_DEFAULT_FIELDS;
    setVisFields(loadSearchDropdownVisFields(sourceCatalog));
    const unsubscribe = subscribeEmpPreferencesCache(() => {
      setVisFields(loadSearchDropdownVisFields(sourceCatalog));
    });
    return unsubscribe;
  }, [catalog]);

  useEffect(() => {
    if (catalog.length === 0) return;
    setVisFields((current) => mergeSearchVisFields(catalog, current));
  }, [catalog]);

  const configFields = useMemo(() => {
    const merged = mergeSearchVisFields(catalog, visFields.length > 0 ? visFields : catalog);
    return sortCardConfigFieldsAlphabetically(merged);
  }, [catalog, visFields]);

  const detailFields = useMemo(
    () => buildSearchDropdownDetailFields(catalog, visFields),
    [catalog, visFields]
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
      saveSearchDropdownVisFields(normalized);
    },
    [catalog]
  );

  const getRestoreDefaults = useCallback(
    () => sortCardConfigFieldsAlphabetically(getDefaultCardVisFields(catalog)),
    [catalog]
  );

  return {
    configFields,
    detailFields,
    saveConfig,
    getRestoreDefaults,
  };
}
