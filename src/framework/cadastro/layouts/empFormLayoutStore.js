import {
  LAYOUT_CONFIG_VERSION_V3,
  countLayoutFieldsV3,
  flattenV3LayoutToV2,
  isLayoutConfigV3,
  isLayoutStructureV2,
  migrateV2ToV3,
  resolveLayoutConfig,
  syncLayoutV3FromFlat,
} from "./layoutConfigV3.js";

const LEGACY_CONFIG_KEY = "cadastro_emp_form_layout_config";

let boundUserId = null;

export const bindLayoutStoreUser = (userId) => {
  boundUserId = userId ? String(userId) : null;
};

export const getLayoutStorageKeys = (userId = boundUserId) => {
  if (!userId) {
    return {
      legacyKey: LEGACY_CONFIG_KEY,
      aggregationKey: "emp_table_aggregation_config",
    };
  }
  return {
    legacyKey: `cadastro:${userId}:emp:form_layout_config`,
    aggregationKey: `cadastro:${userId}:emp:table_aggregation_config`,
  };
};

const getLegacyKey = () => getLayoutStorageKeys().legacyKey;

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

export const DEFAULT_FIELD_LAYOUT_CONFIG = {
  mode: "vertical",
  columns: 1,
};

export const normalizeFieldLayoutConfig = (source = {}) => {
  let mode = "vertical";
  if (source?.mode === "details") mode = "details";
  if (source?.mode === "detailsCompact" || source?.mode === "details_compact") mode = "detailsCompact";
  if (source?.mode === "vertical" || source?.mode === "stacked") mode = "vertical";
  if (source?.mode === "compact" || source?.mode === "columns") mode = "compact";
  const columns = Math.min(6, Math.max(1, Number(source?.columns) || DEFAULT_FIELD_LAYOUT_CONFIG.columns));
  return { mode, columns };
};

export const layoutConfigFields = [
  "version",
  "panels",
  "layout",
  "hiddenFieldIds",
  "lockedFieldIds",
  "requiredFieldIds",
  "clearOnDuplicateFieldIds",
  "fieldDefaultValues",
  "aggregationConfig",
  "visibilityRules",
  "fieldLayoutConfig",
];

export const pickLayoutConfig = (source = {}) => {
  const { config: resolved } = resolveLayoutConfig(source);
  const next = {};
  layoutConfigFields.forEach((field) => {
    if (field === "layout") return;
    if (resolved[field] !== undefined) next[field] = cloneValue(resolved[field]);
  });
  next.version = LAYOUT_CONFIG_VERSION_V3;
  next.layout = cloneValue(resolved.layoutV3 || resolved.layout);
  return next;
};

export const createEmptyLayoutConfig = (defaultConfig = {}) => {
  const panels = cloneValue(defaultConfig.panels || []);
  const flatLayout = {};
  panels.forEach((panel) => {
    if (panel.id === "principal") {
      flatLayout.principal = cloneValue(defaultConfig.layout?.principal || ["razao_social"]);
    } else {
      flatLayout[panel.id] = [];
    }
  });
  const migrated = migrateV2ToV3({
    panels,
    layout: flatLayout,
  });
  return pickLayoutConfig({
    panels: migrated.panels,
    layout: migrated.layout,
    hiddenFieldIds: [],
    lockedFieldIds: [],
    requiredFieldIds: [],
    clearOnDuplicateFieldIds: [],
    fieldDefaultValues: {},
    aggregationConfig: {},
    visibilityRules: {},
    fieldLayoutConfig: { ...DEFAULT_FIELD_LAYOUT_CONFIG },
  });
};

export const sanitizeLayoutFieldPlacements = (layout = {}) => {
  const flatLayout = isLayoutStructureV2(layout) ? layout : flattenV3LayoutToV2(layout);
  const seen = new Set();
  const next = {};
  Object.entries(flatLayout || {}).forEach(([panelId, fieldIds]) => {
    const unique = [];
    (fieldIds || []).forEach((fieldId) => {
      if (!fieldId || seen.has(fieldId)) return;
      seen.add(fieldId);
      unique.push(fieldId);
    });
    next[panelId] = unique;
  });
  return next;
};

export const mergeNewCustomFieldsIntoLayout = (layout = {}, defaultLayout = {}) => {
  const nextLayout = { ...layout };
  const usedFieldIds = new Set(Object.values(nextLayout).flat());
  const defaultCustomIds = defaultLayout.campos_personalizados || [];
  const currentCustomIds = nextLayout.campos_personalizados || [];
  const newCustomIds = defaultCustomIds.filter(
    (fieldId) => !usedFieldIds.has(fieldId) && !currentCustomIds.includes(fieldId)
  );

  if (newCustomIds.length === 0) return nextLayout;

  return {
    ...nextLayout,
    campos_personalizados: [...currentCustomIds, ...newCustomIds],
  };
};

export const normalizeLayoutConfig = (
  source,
  { basePanels = [], defaultLayout = {}, camposPersonalizadosCount = 0, mergeNewCustomFields = false } = {}
) => {
  const fallback = {
    panels: basePanels,
    layout: defaultLayout,
    hiddenFieldIds: [],
    lockedFieldIds: [],
    requiredFieldIds: [],
    clearOnDuplicateFieldIds: [],
    fieldDefaultValues: {},
    aggregationConfig: {},
    visibilityRules: {},
    fieldLayoutConfig: { ...DEFAULT_FIELD_LAYOUT_CONFIG },
  };
  const merged = { ...fallback, ...(source || {}) };
  const panelsSource = merged.panels?.some((panel) => panel.id === "principal")
    ? merged.panels
    : [basePanels[0], ...(merged.panels || basePanels)];
  const panels = [
    ...panelsSource,
    ...basePanels.filter((basePanel) => !panelsSource.some((panel) => panel.id === basePanel.id)),
  ];

  const resolved = resolveLayoutConfig(merged, {
    defaultLayout,
    defaults: fallback,
  });
  let layoutFlat = sanitizeLayoutFieldPlacements(resolved.layoutFlat);
  if (!Array.isArray(layoutFlat.principal)) {
    layoutFlat.principal = [];
  }
  if (mergeNewCustomFields && camposPersonalizadosCount > 0) {
    layoutFlat = mergeNewCustomFieldsIntoLayout(layoutFlat, defaultLayout);
    layoutFlat = sanitizeLayoutFieldPlacements(layoutFlat);
  }

  const synced = syncLayoutV3FromFlat(resolved.config, layoutFlat);

  return {
    ...merged,
    version: LAYOUT_CONFIG_VERSION_V3,
    panels: panels.filter(
      (panel) => panel.id !== "campos_personalizados" || (layoutFlat.campos_personalizados || []).length > 0
    ),
    layout: layoutFlat,
    layoutV3: synced.layoutV3,
    hiddenFieldIds: merged.hiddenFieldIds || [],
    visibilityRules: merged.visibilityRules || {},
    fieldLayoutConfig: normalizeFieldLayoutConfig(merged.fieldLayoutConfig),
  };
};

export const readStoredLayoutConfig = () => {
  try {
    const raw = localStorage.getItem(getLegacyKey());
    const parsed = raw ? JSON.parse(raw) : null;
    if (!isPlainLayoutConfig(parsed)) return null;
    const { config } = resolveLayoutConfig(parsed);
    return {
      ...pickLayoutConfig(config),
      layout: config.layoutFlat,
      layoutV3: config.layoutV3,
    };
  } catch {
    return null;
  }
};

export const writeStoredLayoutConfig = (config) => {
  if (!isPlainLayoutConfig(config)) return;
  localStorage.setItem(getLegacyKey(), JSON.stringify(pickLayoutConfig(config)));
};

const SYSTEM_PANEL_IDS = new Set(["principal", "geral", "endereco", "observacoes"]);

const isPlainLayoutConfig = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

/** Garante layout utilizável: painéis do sistema visíveis e campos padrão nos painéis vazios. */
export const ensureLayoutFields = (saved, defaults) => {
  if (!isPlainLayoutConfig(defaults)) return null;
  if (!isPlainLayoutConfig(saved)) return pickLayoutConfig(defaults);

  const merged = mergeSavedFormLayout(saved, defaults);
  const defaultLayout = defaults?.layout || {};
  const layoutInput = merged.layout || {};
  const layoutFlat = sanitizeLayoutFieldPlacements(
    isLayoutStructureV2(layoutInput) ? layoutInput : flattenV3LayoutToV2(layoutInput)
  );

  Object.entries(defaultLayout).forEach(([panelId, fieldIds]) => {
    if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
    if (!Array.isArray(layoutFlat[panelId]) || layoutFlat[panelId].length === 0) {
      layoutFlat[panelId] = [...fieldIds];
    }
  });

  const panels = (merged.panels || defaults.panels || []).map((panel) =>
    SYSTEM_PANEL_IDS.has(panel.id) ? { ...panel, hidden: false } : panel
  );

  const synced = syncLayoutV3FromFlat(merged, layoutFlat);
  const next = pickLayoutConfig({
    ...merged,
    panels: panels.length ? panels : defaults.panels,
    layout: synced.layoutV3,
    fieldLayoutConfig: merged.fieldLayoutConfig || defaults.fieldLayoutConfig,
  });

  const runtime = {
    ...next,
    layout: layoutFlat,
    layoutV3: synced.layoutV3,
  };

  return countLayoutFields(runtime.layout) > 0 ? runtime : pickLayoutConfig(defaults);
};

export const mergeSavedFormLayout = (saved, defaults) => {
  if (!isPlainLayoutConfig(defaults)) return pickLayoutConfig(defaults || {});
  if (!isPlainLayoutConfig(saved)) return pickLayoutConfig(defaults);

  const defaultLayout = defaults?.layout || {};
  const savedLayout = saved.layout || {};
  const savedFlat = isLayoutConfigV3(saved)
    ? flattenV3LayoutToV2(savedLayout)
    : sanitizeLayoutFieldPlacements(savedLayout);
  const layout = { ...defaultLayout };

  Object.entries(savedFlat).forEach(([panelId, fieldIds]) => {
    if (Array.isArray(fieldIds)) {
      layout[panelId] = fieldIds;
    }
  });

  const totalPlaced = Object.values(layout).flat().filter(Boolean).length;
  if (totalPlaced === 0) return pickLayoutConfig(defaults);

  Object.entries(defaultLayout).forEach(([panelId, fieldIds]) => {
    if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
    if (!Array.isArray(layout[panelId]) || layout[panelId].length === 0) {
      layout[panelId] = [...fieldIds];
    }
  });

  const panels = Array.isArray(saved.panels) && saved.panels.length ? saved.panels : defaults.panels;
  const synced = syncLayoutV3FromFlat(saved, layout);

  const persisted = pickLayoutConfig({
    ...defaults,
    ...saved,
    panels,
    layout: synced.layoutV3,
    fieldLayoutConfig: saved.fieldLayoutConfig || defaults.fieldLayoutConfig,
  });

  return {
    ...persisted,
    layout,
    layoutV3: synced.layoutV3,
  };
};

export const countLayoutFields = (layout = {}) => {
  if (isLayoutStructureV2(layout)) {
    return Object.values(layout).flat().filter(Boolean).length;
  }
  return countLayoutFieldsV3(layout);
};

export { LAYOUT_CONFIG_VERSION_V3, migrateV2ToV3, resolveLayoutConfig } from "./layoutConfigV3.js";

export const empFormLayoutStore = {
  persistActiveConfig(config) {
    writeStoredLayoutConfig(config);
    return true;
  },
};

export default empFormLayoutStore;
