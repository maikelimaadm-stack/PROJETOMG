import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CadastroEngine } from "../core/CadastroEngine.js";
import { registerCadastroModule } from "../core/ModuleRegistry.js";
import { LAYOUT_MAIN_TAB_ID } from "../preferences/layoutMigration.js";
import { ensureBuiltinFieldTypes } from "../field/registerBuiltinFieldTypes.js";
import { pickLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore.js";

ensureBuiltinFieldTypes();

/**
 * Hook central do motor de cadastro — layout, sync, campos personalizados.
 * @param {import('../core/CadastroModuleConfig.js').CadastroModuleConfig} moduleConfig
 * @param {{ userId?: string, buildFields: Function, nativeFieldIds?: Set|Array }} options
 */
export function useCadastroForm(moduleConfig, { userId, buildFields, nativeFieldIds: nativeIdsInput } = {}) {
  registerCadastroModule(moduleConfig);
  const engine = useMemo(() => CadastroEngine.for(moduleConfig.moduleId), [moduleConfig.moduleId]);

  const [formLayoutConfig, setFormLayoutConfig] = useState(null);
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(moduleConfig.mainTabId || LAYOUT_MAIN_TAB_ID);
  const layoutPersistedRef = useRef(false);

  const defaultConfigFull = useMemo(() => moduleConfig.getDefaultLayoutConfig(), [moduleConfig]);
  const basePanels = useMemo(() => moduleConfig.basePanels || defaultConfigFull.panels || [], [moduleConfig, defaultConfigFull]);
  const defaultLayout = useMemo(
    () => moduleConfig.defaultFlatLayout || defaultConfigFull.layout || {},
    [moduleConfig, defaultConfigFull]
  );

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
      layoutPersistedRef.current = false;
      return undefined;
    }

    const local = engine.preferences.initLocal(userId);
    const repaired =
      engine.layout.ensureFields(local, { knownFieldIds: knownLayoutFieldIds }) || defaultConfigFull;
    const current = engine.preferences.readLocal(userId);
    const prefs = engine.preferences;
    if (
      repaired &&
      current &&
      JSON.stringify(pickLayoutConfig(repaired)) !== JSON.stringify(pickLayoutConfig(current))
    ) {
      prefs.writeLocal(userId, repaired);
    }
    layoutPersistedRef.current = true;
    setFormLayoutConfig(repaired || defaultConfigFull);
    prefs.syncRemote(userId);

    const onHydrated = () => {
      const stored = prefs.readLocal(userId);
      if (!stored) return;
      layoutPersistedRef.current = false;
      const next =
        engine.layout.ensureFields(stored, { knownFieldIds: knownLayoutFieldIds }) || defaultConfigFull;
      setFormLayoutConfig(next);
    };

    window.addEventListener(engine.preferences.hydratedEvent, onHydrated);
    return () => window.removeEventListener(engine.preferences.hydratedEvent, onHydrated);
  }, [userId, moduleConfig.moduleId, defaultConfigFull, knownLayoutFieldIds, engine]);

  const activeLayoutConfig = useMemo(() => {
    if (!formLayoutConfig) return defaultConfigFull;
    return (
      engine.layout.ensureFields(formLayoutConfig, defaultConfigFull, {
        knownFieldIds: knownLayoutFieldIds,
      }) || defaultConfigFull
    );
  }, [formLayoutConfig, defaultConfigFull, knownLayoutFieldIds, engine]);

  const tabs = useMemo(() => {
    return activeLayoutConfig.panels.filter((panel) => {
      if (panel.hidden) return false;
      if (panel.id === "principal") return false;
      const panelFields = activeLayoutConfig.layout?.[panel.id] || [];
      if (panel.id === "campos_personalizados" && !panelFields.length && !camposPersonalizadosForm.length) {
        return false;
      }
      return true;
    });
  }, [activeLayoutConfig, camposPersonalizadosForm.length]);

  const applyLayoutConfig = useCallback(
    (source, { updateActiveTab = true } = {}) => {
      const ensured =
        engine.layout.ensureFields(source, defaultConfigFull, {
          knownFieldIds: knownLayoutFieldIds,
        }) || defaultConfigFull;
      const normalized = engine.layout.normalize(ensured, {
        basePanels,
        defaultLayout,
        mergeNewCustomFields: false,
      });
      setFormLayoutConfig(normalized);
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
