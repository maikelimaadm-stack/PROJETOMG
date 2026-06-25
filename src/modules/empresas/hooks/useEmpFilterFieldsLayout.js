import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMP_FILTER_FIELDS_LAYOUT_KEY,
  applyFilterFieldsLayout,
  getDefaultFilterFieldsLayout,
  loadFilterFieldsLayout,
  loadFilterMaxVisible,
  mergeSavedFilterFieldOrder,
  mergeSavedVisibleFilterFields,
  mergeVisibleFilterFieldsWithCatalog,
  saveFilterFieldsLayout,
} from "@/modules/empresas/utils/empFilterFieldsLayout";
import {
  readEmpPreferencesJson,
  subscribeEmpPreferencesCache,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import { FILTER_MAX_VISIBLE_KEY } from "@/modules/empresas/components/tblEmp.constants";
import { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import { markEmpPreferencesPerf } from "@/modules/empresas/preferences/empresasPreferencesPerfMarks";

const shouldRefreshFilterLayoutByCacheEvent = ({ reason = "", keys = [] } = {}) => {
  const normalizedReason = String(reason || "").toLowerCase();
  if (!normalizedReason) return false;
  if (normalizedReason.includes("filter-layout")) return true;
  if (normalizedReason.includes("filter-max")) return true;
  if (normalizedReason.includes("listagem:hydrate")) return true;
  if (normalizedReason === "storage") {
    const keyList = Array.isArray(keys) ? keys : [keys];
    return keyList.some((key) => {
      const normalizedKey = String(key || "").toLowerCase();
      return (
        normalizedKey.includes(EMP_FILTER_FIELDS_LAYOUT_KEY.toLowerCase()) ||
        normalizedKey.includes(FILTER_MAX_VISIBLE_KEY.toLowerCase())
      );
    });
  }
  return false;
};

const loadFilterFieldsLayoutFromStorage = () => {
  markEmpPreferencesPerf("PREF_LOCAL_SNAPSHOT_READ", {
    section: "filtersConfig",
    source: "local",
  });
  const parsed = readEmpPreferencesJson(EMP_FILTER_FIELDS_LAYOUT_KEY, null);
  const maxVisible = loadFilterMaxVisible();
  if (!parsed || typeof parsed !== "object") {
    markEmpPreferencesPerf("PREF_FILTERS_INITIAL_STATE", {
      section: "filtersConfig",
      source: "defaults",
    });
    return { visiveis: [], ordem: [], maxVisible };
  }
  markEmpPreferencesPerf("PREF_FILTERS_INITIAL_STATE", {
    section: "filtersConfig",
    source: "local",
    changed: true,
  });
  return {
    visiveis: Array.isArray(parsed.visiveis) ? [...parsed.visiveis] : [],
    ordem: Array.isArray(parsed.ordem) ? [...parsed.ordem] : [],
    maxVisible,
  };
};

export function useEmpFilterFieldsLayout(catalogFields = []) {
  const catalogKey = useMemo(
    () =>
      catalogFields
        .map((field) => field.key)
        .filter(Boolean)
        .join("|"),
    [catalogFields]
  );

  const catalogKeys = useMemo(
    () => (catalogKey ? catalogKey.split("|") : []),
    [catalogKey]
  );

  const [layout, setLayout] = useState(() => loadFilterFieldsLayoutFromStorage());

  useEffect(() => {
    const refresh = (detail = null) => {
      const isDomEvent = detail && typeof detail === "object" && "type" in detail;
      if (detail && !isDomEvent) {
        const normalized = String(detail?.reason || "").toLowerCase();
        if (
          (normalized.includes("listagem:hydrate") || normalized.includes("remote-sync")) &&
          isEmpPreferencesSectionDirty("filtersConfig")
        ) {
          markEmpPreferencesPerf("PREF_REMOTE_APPLY_SKIPPED", {
            section: "filtersConfig",
            source: "remote",
            dirty: true,
          });
          return;
        }
        if (!shouldRefreshFilterLayoutByCacheEvent(detail)) return;
      }
      markEmpPreferencesPerf("PREF_REMOTE_APPLY_ATTEMPT", {
        section: "filtersConfig",
        source: "remote",
      });
      const nextLayout = loadFilterFieldsLayout(catalogKeys);
      setLayout((current) => {
        const unchanged = stableJsonEqual(current, nextLayout);
        if (!unchanged) {
          markEmpPreferencesPerf("PREF_REMOTE_APPLY_EFFECTIVE", {
            section: "filtersConfig",
            source: "remote",
            changed: true,
          });
        }
        return unchanged ? current : nextLayout;
      });
    };
    const unsubscribeCache = subscribeEmpPreferencesCache(refresh);
    window.addEventListener("emp-filter-fields-layout-updated", refresh);
    return () => {
      unsubscribeCache();
      window.removeEventListener("emp-filter-fields-layout-updated", refresh);
    };
  }, [catalogKeys]);

  useEffect(() => {
    if (catalogKeys.length === 0) return;
    setLayout((current) => {
      const ordem = mergeSavedFilterFieldOrder(current.ordem, catalogKeys);
      const visiveis = mergeVisibleFilterFieldsWithCatalog(
        current.visiveis,
        catalogKeys,
        current.ordem
      );
      if (
        ordem.join("|") === current.ordem.join("|") &&
        visiveis.join("|") === current.visiveis.join("|")
      ) {
        return current;
      }
      return { ...current, ordem, visiveis };
    });
  }, [catalogKey, catalogKeys]);

  const filterFields = useMemo(() => {
    return applyFilterFieldsLayout(catalogFields, layout);
  }, [catalogFields, layout]);

  const saveLayout = useCallback(
    ({ visiveis, ordem, maxVisible }) => {
      markEmpPreferencesPerf("PREF_USER_ACTION", {
        section: "filtersConfig",
        source: "user_action",
      });
      const nextLayout = {
        visiveis: mergeSavedVisibleFilterFields(visiveis, catalogKeys),
        ordem: mergeSavedFilterFieldOrder(ordem, catalogKeys),
        maxVisible: maxVisible ?? layout.maxVisible,
      };
      setLayout(nextLayout);
      markEmpPreferencesPerf("PREF_UI_STATE_CHANGED", {
        section: "filtersConfig",
        source: "user_action",
        changed: true,
      });
      saveFilterFieldsLayout(nextLayout);
      markEmpPreferencesPerf("PREF_LOCAL_WRITE", {
        section: "filtersConfig",
        source: "user_action",
        dirty: true,
      });
    },
    [catalogKeys, layout.maxVisible]
  );

  const getRestoreDefaults = useCallback(
    () => getDefaultFilterFieldsLayout(catalogKeys),
    [catalogKeys]
  );

  return {
    filterFields,
    layout,
    maxVisibleFields: layout.maxVisible,
    saveLayout,
    getRestoreDefaults,
    catalogFields,
  };
}
