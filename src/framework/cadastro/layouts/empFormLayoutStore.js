import {
  LAYOUT_CONFIG_VERSION_V3,
  countLayoutFieldsV3,
  coerceLayoutToV3,
  flattenV3LayoutToV2,
  getPanelFieldIdsFromLayout,
  isLayoutStructureV2,
  isLayoutStructureV3,
  migrateV2ToV3,
  resolveLayoutConfig,
  sanitizeLayoutV3,
  syncLayoutV3FromFlat,
} from "./layoutConfigV3.js";
import { normalizeFieldSizes } from "./empFormFieldGrid.js";
import {
  LAYOUT_MAIN_TAB_ID,
  LAYOUT_SELECTOR_PANEL_ID,
  upgradeStoredLayoutConfig,
} from "./empFormLayoutUpgrade.js";

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
  mode: "corporate",
  columns: 12,
};

export const normalizeFieldLayoutConfig = (source = {}) => {
  const columns = Math.min(12, Math.max(1, Number(source?.columns) || DEFAULT_FIELD_LAYOUT_CONFIG.columns));
  return { mode: "corporate", columns };
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
  "fieldSizes",
];

const stripRuntimeLayoutAliases = (config = {}) => {
  const next = { ...config };
  delete next.layoutV3;
  delete next.layoutFlat;
  return next;
};

/**
 * Configuração canônica para persistência e runtime (layout = V3 exclusivamente).
 * @param {object} source
 */
export const pickLayoutConfig = (source = {}) => {
  const { config: resolved } = resolveLayoutConfig(source);
  const next = {};
  layoutConfigFields.forEach((field) => {
    if (resolved[field] !== undefined) next[field] = cloneValue(resolved[field]);
  });
  next.version = LAYOUT_CONFIG_VERSION_V3;
  next.layout = cloneValue(sanitizeLayoutV3(resolved.layout || {}));
  return stripRuntimeLayoutAliases(next);
};

export const createEmptyLayoutConfig = (defaultConfig = {}) => {
  const panels = cloneValue(defaultConfig.panels || []);
  const flatLayout = {};
  panels.forEach((panel) => {
    if (panel.id === LAYOUT_MAIN_TAB_ID) {
      flatLayout[LAYOUT_MAIN_TAB_ID] = cloneValue(
        getPanelFieldIdsFromLayout(defaultConfig.layout, LAYOUT_MAIN_TAB_ID) ||
          getPanelFieldIdsFromLayout(defaultConfig.layout, "principais") ||
          ["razao_social"]
      );
    } else {
      flatLayout[panel.id] = [];
    }
  });
  const migrated = migrateV2ToV3({
    panels,
    layout: coerceLayoutToV3(defaultConfig.layout, { defaultFlatLayout: flatLayout }),
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
    fieldSizes: {},
  });
};

/** Sanitiza placements globais e retorna layout V3. */
export const sanitizeLayoutFieldPlacements = (layout = {}) => {
  const v3 = coerceLayoutToV3(layout);
  const flatLayout = flattenV3LayoutToV2(v3);
  const seen = new Set();
  const nextFlat = {};
  Object.entries(flatLayout || {}).forEach(([panelId, fieldIds]) => {
    const unique = [];
    (fieldIds || []).forEach((fieldId) => {
      if (!fieldId || seen.has(fieldId)) return;
      seen.add(fieldId);
      unique.push(fieldId);
    });
    nextFlat[panelId] = unique;
  });
  return syncLayoutV3FromFlat({ layout: v3 }, nextFlat).layout;
};

export const mergeNewCustomFieldsIntoLayout = (layout = {}, defaultLayout = {}) => {
  const flat = flattenV3LayoutToV2(coerceLayoutToV3(layout));
  const nextFlat = { ...flat };
  const usedFieldIds = new Set(Object.values(nextFlat).flat());
  const defaultFlat = isLayoutStructureV2(defaultLayout)
    ? defaultLayout
    : flattenV3LayoutToV2(coerceLayoutToV3(defaultLayout));
  const defaultCustomIds = defaultFlat.campos_personalizados || [];
  const currentCustomIds = nextFlat.campos_personalizados || [];
  const newCustomIds = defaultCustomIds.filter(
    (fieldId) => !usedFieldIds.has(fieldId) && !currentCustomIds.includes(fieldId)
  );

  if (newCustomIds.length === 0) return coerceLayoutToV3(layout);

  return syncLayoutV3FromFlat(
    { layout: coerceLayoutToV3(layout) },
    { ...nextFlat, campos_personalizados: [...currentCustomIds, ...newCustomIds] }
  ).layout;
};

export const normalizeLayoutConfig = (
  source,
  { basePanels = [], defaultLayout = {}, camposPersonalizadosCount = 0, mergeNewCustomFields = false } = {}
) => {
  const fallback = {
    panels: basePanels,
    layout: coerceLayoutToV3(defaultLayout, { defaultFlatLayout: defaultLayout }),
    hiddenFieldIds: [],
    lockedFieldIds: [],
    requiredFieldIds: [],
    clearOnDuplicateFieldIds: [],
    fieldDefaultValues: {},
    aggregationConfig: {},
    visibilityRules: {},
    fieldLayoutConfig: { ...DEFAULT_FIELD_LAYOUT_CONFIG },
    fieldSizes: {},
  };
  const merged = stripRuntimeLayoutAliases({ ...fallback, ...(source || {}) });
  if (merged.layoutV3 && isLayoutStructureV3(merged.layoutV3)) {
    merged.layout = merged.layoutV3;
  }

  const resolved = resolveLayoutConfig(merged, {
    defaultLayout,
    defaults: fallback,
  });

  let layoutV3 = sanitizeLayoutV3(resolved.config.layout || {});
  if (mergeNewCustomFields && camposPersonalizadosCount > 0) {
    layoutV3 = mergeNewCustomFieldsIntoLayout(layoutV3, defaultLayout);
    layoutV3 = sanitizeLayoutFieldPlacements(layoutV3);
  }

  const basePanelSeed = basePanels[0] ? [basePanels[0]] : [];
  const panels = [
    ...(merged.panels?.some((panel) => panel.id === LAYOUT_MAIN_TAB_ID)
      ? merged.panels
      : [...basePanelSeed, ...(merged.panels || basePanels)]),
    ...basePanels.filter((basePanel) => !(merged.panels || []).some((panel) => panel.id === basePanel.id)),
  ].filter(
    (panel) =>
      panel.id !== "campos_personalizados" ||
      getPanelFieldIdsFromLayout(layoutV3, "campos_personalizados").length > 0
  );

  return stripRuntimeLayoutAliases({
    ...merged,
    version: LAYOUT_CONFIG_VERSION_V3,
    panels,
    layout: layoutV3,
    hiddenFieldIds: merged.hiddenFieldIds || [],
    visibilityRules: merged.visibilityRules || {},
    fieldLayoutConfig: normalizeFieldLayoutConfig(merged.fieldLayoutConfig),
    fieldSizes: normalizeFieldSizes({
      ...(fallback.fieldSizes || {}),
      ...(merged.fieldSizes || {}),
    }),
  });
};

export const readStoredLayoutConfig = () => {
  try {
    const raw = localStorage.getItem(getLegacyKey());
    const parsed = raw ? JSON.parse(raw) : null;
    if (!isPlainLayoutConfig(parsed)) return null;
    const upgraded = upgradeStoredLayoutConfig(parsed);
    const source = upgraded || parsed;
    const { config } = resolveLayoutConfig(source);
    return pickLayoutConfig(config);
  } catch {
    return null;
  }
};

export const writeStoredLayoutConfig = (config) => {
  if (!isPlainLayoutConfig(config)) return;
  localStorage.setItem(getLegacyKey(), JSON.stringify(pickLayoutConfig(config)));
};

const SYSTEM_PANEL_IDS = new Set([LAYOUT_MAIN_TAB_ID, LAYOUT_SELECTOR_PANEL_ID, "geral", "endereco", "observacoes"]);

const isPlainLayoutConfig = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

export const pruneLayoutToKnownFields = (layout = {}, knownFieldIds = []) => {
  const known = knownFieldIds instanceof Set ? knownFieldIds : new Set(knownFieldIds);
  const v3 = coerceLayoutToV3(layout);
  const flatLayout = flattenV3LayoutToV2(v3);
  const nextFlat = {};
  Object.entries(flatLayout || {}).forEach(([panelId, fieldIds]) => {
    nextFlat[panelId] = (fieldIds || []).filter((fieldId) => known.has(fieldId));
  });
  return syncLayoutV3FromFlat({ layout: v3 }, nextFlat).layout;
};

const fillEmptyPanelsFromDefaults = (layoutV3, defaultLayout) => {
  const flat = flattenV3LayoutToV2(layoutV3);
  const nextFlat = { ...flat };
  Object.entries(defaultLayout || {}).forEach(([panelId, fieldIds]) => {
    if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
    if (!Array.isArray(nextFlat[panelId]) || nextFlat[panelId].length === 0) {
      nextFlat[panelId] = [...fieldIds];
    }
  });
  return syncLayoutV3FromFlat({ layout: layoutV3 }, nextFlat).layout;
};

export const ensureLayoutFields = (saved, defaults, { knownFieldIds } = {}) => {
  if (!isPlainLayoutConfig(defaults)) return null;
  if (!isPlainLayoutConfig(saved)) return pickLayoutConfig(defaults);

  const upgraded = upgradeStoredLayoutConfig(saved, defaults) || saved;
  const merged = mergeSavedFormLayout(upgraded, defaults);
  const defaultLayout = defaults?.layout || {};
  const defaultFlat = isLayoutStructureV2(defaultLayout)
    ? defaultLayout
    : flattenV3LayoutToV2(coerceLayoutToV3(defaultLayout));

  let layoutV3 = sanitizeLayoutFieldPlacements(
    coerceLayoutToV3(merged.layout, { existingV3: merged.layoutV3 })
  );

  const knownIds =
    knownFieldIds instanceof Set
      ? knownFieldIds
      : new Set([
          ...Object.values(defaultFlat).flat().filter(Boolean),
          ...(Array.isArray(knownFieldIds) ? knownFieldIds : []),
        ]);

  layoutV3 = pruneLayoutToKnownFields(layoutV3, knownIds);
  layoutV3 = fillEmptyPanelsFromDefaults(layoutV3, defaultFlat);

  const panels = (merged.panels || defaults.panels || []).map((panel) =>
    SYSTEM_PANEL_IDS.has(panel.id) ? { ...panel, hidden: false } : panel
  );

  const next = pickLayoutConfig({
    ...merged,
    panels: panels.length ? panels : defaults.panels,
    layout: layoutV3,
    fieldLayoutConfig: merged.fieldLayoutConfig || defaults.fieldLayoutConfig,
  });

  return countLayoutFields(next.layout) > 0 ? next : pickLayoutConfig(defaults);
};

export const countKnownLayoutFields = (layout = {}, knownFieldIds = []) => {
  const pruned = pruneLayoutToKnownFields(layout, knownFieldIds);
  return Object.values(flattenV3LayoutToV2(pruned))
    .flat()
    .filter(Boolean).length;
};

export const mergeSavedFormLayout = (saved, defaults) => {
  if (!isPlainLayoutConfig(defaults)) return pickLayoutConfig(defaults || {});
  if (!isPlainLayoutConfig(saved)) return pickLayoutConfig(defaults);

  const defaultLayout = defaults?.layout || {};
  const defaultFlat = isLayoutStructureV2(defaultLayout)
    ? defaultLayout
    : flattenV3LayoutToV2(coerceLayoutToV3(defaultLayout));

  const savedV3 = coerceLayoutToV3(saved.layout, { existingV3: saved.layoutV3 });
  const savedFlat = flattenV3LayoutToV2(savedV3);
  const layoutFlat = { ...defaultFlat };

  Object.entries(savedFlat).forEach(([panelId, fieldIds]) => {
    if (Array.isArray(fieldIds)) layoutFlat[panelId] = fieldIds;
  });

  const totalPlaced = Object.values(layoutFlat).flat().filter(Boolean).length;
  if (totalPlaced === 0) return pickLayoutConfig(defaults);

  Object.entries(defaultFlat).forEach(([panelId, fieldIds]) => {
    if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
    if (!Array.isArray(layoutFlat[panelId]) || layoutFlat[panelId].length === 0) {
      layoutFlat[panelId] = [...fieldIds];
    }
  });

  const panels = Array.isArray(saved.panels) && saved.panels.length ? saved.panels : defaults.panels;
  const layoutV3 = syncLayoutV3FromFlat({ layout: savedV3 }, layoutFlat).layout;

  return pickLayoutConfig({
    ...defaults,
    ...saved,
    panels,
    layout: layoutV3,
    fieldLayoutConfig: saved.fieldLayoutConfig || defaults.fieldLayoutConfig,
  });
};

export const countLayoutFields = (layout = {}) => countLayoutFieldsV3(coerceLayoutToV3(layout));

export { LAYOUT_CONFIG_VERSION_V3, migrateV2ToV3, resolveLayoutConfig, getPanelFieldIdsFromLayout } from "./layoutConfigV3.js";

export const empFormLayoutStore = {
  persistActiveConfig(config) {
    writeStoredLayoutConfig(config);
    return true;
  },
};

export default empFormLayoutStore;
