import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CadastroEngine } from "../core/CadastroEngine.js";
import { registerCadastroModule } from "../core/ModuleRegistry.js";
import { LAYOUT_MAIN_TAB_ID } from "../preferences/layoutMigration.js";
import { ensureBuiltinFieldTypes } from "../field/registerBuiltinFieldTypes.js";
import { pickLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore.js";
import {
  getDefaultFlatLayoutFromConfig,
  getPanelFieldIdsFromLayout,
} from "@/framework/cadastro/layouts/layoutConfigV3.js";

ensureBuiltinFieldTypes();

/**
 * Hook central do motor de cadastro — layout, sync, campos personalizados.
 * @param {import('../core/CadastroModuleConfig.js').CadastroModuleConfig} moduleConfig
 * @param {{ userId?: string, buildFields: Function, nativeFieldIds?: Set|Array }} options
 */
export function useCadastroForm(moduleConfig, { userId, buildFields, nativeFieldIds: nativeIdsInput } = {}) {
  registerCadastroModule(moduleConfig);
  const engine = useMemo(() => CadastroEngine.for(moduleConfig.moduleId), [moduleConfig.moduleId]);
  const initialLocalLayout = useMemo(
    () => (userId ? engine.preferences.readLocal(userId) : null),
    [engine, userId]
  );

  const [formLayoutConfig, setFormLayoutConfig] = useState(() => initialLocalLayout);
  const [isLayoutReady, setIsLayoutReady] = useState(() => Boolean(initialLocalLayout));
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(moduleConfig.mainTabId || LAYOUT_MAIN_TAB_ID);
  const layoutPersistedRef = useRef(false);

  const defaultConfigFull = useMemo(() => moduleConfig.getDefaultLayoutConfig(), [moduleConfig]);
  const basePanels = useMemo(() => moduleConfig.basePanels || defaultConfigFull.panels || [], [moduleConfig, defaultConfigFull]);
  const defaultLayout = useMemo(() => {
    if (moduleConfig.defaultFlatLayout) return moduleConfig.defaultFlatLayout;
    return getDefaultFlatLayoutFromConfig(defaultConfigFull);
  }, [moduleConfig, defaultConfigFull]);

  const nativeLayoutFieldIds = useMemo(() => {
    if (nativeIdsInput instanceof Set) return nativeIdsInput;
    if (Array.isArray(nativeIdsInput)) return new Set(nativeIdsInput);
    return new Set(Object.values(defaultLayout).flat().filter(Boolean));
  }, [nativeIdsInput, defaultLayout]);

  const { data: camposPersonalizados = [], isFetched: camposPersonalizadosReady } = useQuery({
    queryKey: [moduleConfig.customFieldsQueryKey],
    queryFn: () => engine.customFields.list("aplicavel"),
    initialData: [],
    staleTime: 60_000,
  });

  const camposPersonalizadosForm = useMemo(
    () =>
      engine.customFields
        .normalizeList(camposPersonalizados)
        .filter((campo) => campo.ativo !== false && campo.visivel_form !== false),
    [camposPersonalizados, engine]
  );

  const knownLayoutFieldIds = useMemo(() => {
    const ids = new Set(nativeLayoutFieldIds);
    camposPersonalizadosForm.forEach((c) => ids.add(`custom:${c.field_name}`));
    return ids;
  }, [nativeLayoutFieldIds, camposPersonalizadosForm]);

  useEffect(() => {
    if (!userId) {
      setFormLayoutConfig(null);
      setIsLayoutReady(false);
      layoutPersistedRef.current = false;
      return undefined;
    }

    const prefs = engine.preferences;
    const local = prefs.readLocal(userId);
    const onHydrated = () => {
      const stored = prefs.readLocal(userId);
      layoutPersistedRef.current = false;
      const next = stored
        ? engine.layout.ensureFields(stored, { knownFieldIds: knownLayoutFieldIds }) || defaultConfigFull
        : defaultConfigFull;
      setFormLayoutConfig(next);
      setIsLayoutReady(true);
    };

    if (local) {
      const repaired =
        engine.layout.ensureFields(local, { knownFieldIds: knownLayoutFieldIds }) || defaultConfigFull;
      setFormLayoutConfig(repaired);
      setIsLayoutReady(true);
      layoutPersistedRef.current = false;
    } else {
      setFormLayoutConfig(null);
      setIsLayoutReady(false);
      layoutPersistedRef.current = false;
    }

    window.addEventListener(engine.preferences.hydratedEvent, onHydrated);
    return () => window.removeEventListener(engine.preferences.hydratedEvent, onHydrated);
  }, [userId, moduleConfig.moduleId, defaultConfigFull, knownLayoutFieldIds, engine]);

  const resolveActiveLayoutConfig = useCallback(
    (source) => {
      const base = source || defaultConfigFull;
      const ensured =
        engine.layout.ensureFields(base, { knownFieldIds: knownLayoutFieldIds }) ||
        defaultConfigFull;
      return (
        engine.layout.normalize(ensured, {
          basePanels,
          defaultLayout,
          mergeNewCustomFields: false,
        }) || ensured
      );
    },
    [engine, defaultConfigFull, knownLayoutFieldIds, basePanels, defaultLayout]
  );

  const activeLayoutConfig = useMemo(
    () => (isLayoutReady ? resolveActiveLayoutConfig(formLayoutConfig) : null),
    [formLayoutConfig, isLayoutReady, resolveActiveLayoutConfig]
  );

  const tabs = useMemo(() => {
    if (!isLayoutReady || !activeLayoutConfig) return [];
    const panels = activeLayoutConfig?.panels || [];
    return panels.filter((panel) => {
      if (panel.hidden) return false;
      if (panel.id === "principal") return false;
      const panelFields = getPanelFieldIdsFromLayout(activeLayoutConfig.layout, panel.id);
      const hasLayoutFields = panelFields.length > 0;
      const fallbackFields = defaultLayout?.[panel.id] || [];
      const hasFallbackFields = Array.isArray(fallbackFields) && fallbackFields.length > 0;
      if (
        panel.id === "campos_personalizados" &&
        !hasLayoutFields &&
        !hasFallbackFields &&
        !camposPersonalizadosForm.length
      ) {
        return false;
      }
      return hasLayoutFields || hasFallbackFields || panel.id !== "campos_personalizados";
    });
  }, [activeLayoutConfig, camposPersonalizadosForm.length, defaultLayout, isLayoutReady]);

  const applyLayoutConfig = useCallback(
    (source, { updateActiveTab = true } = {}) => {
      const ensured =
        engine.layout.ensureFields(source, { knownFieldIds: knownLayoutFieldIds }) ||
        defaultConfigFull;
      const normalized = engine.layout.normalize(ensured, {
        basePanels,
        defaultLayout,
        mergeNewCustomFields: false,
      });
      setFormLayoutConfig(normalized);
      setIsLayoutReady(true);
      if (userId) {
        engine.preferences.writeLocal(userId, normalized);
        engine.preferences.scheduleSync(userId);
      }
      if (updateActiveTab) {
        const visiblePanels = normalized.panels.filter((p) => !p.hidden && p.id !== "principal");
        if (!visiblePanels.some((p) => p.id === activeTab)) {
          setActiveTab(visiblePanels[0]?.id || moduleConfig.mainTabId || LAYOUT_MAIN_TAB_ID);
        }
      }
      return normalized;
    },
    [engine, defaultConfigFull, knownLayoutFieldIds, basePanels, defaultLayout, userId, activeTab, moduleConfig.mainTabId]
  );

  const dynamicFields = useMemo(() => {
    if (typeof buildFields !== "function") return [];
    return buildFields({ camposPersonalizadosForm, activeLayoutConfig });
  }, [buildFields, camposPersonalizadosForm, activeLayoutConfig]);

  return {
    engine,
    isLayoutReady,
    formLayoutConfig,
    setFormLayoutConfig,
    activeLayoutConfig,
    layoutConfigOpen,
    setLayoutConfigOpen,
    activeTab,
    setActiveTab,
    tabs,
    defaultConfigFull,
    basePanels,
    defaultLayout,
    camposPersonalizadosForm,
    camposPersonalizadosReady,
    knownLayoutFieldIds,
    dynamicFields,
    applyLayoutConfig,
    layoutPersistedRef,
  };
}

export default useCadastroForm;
