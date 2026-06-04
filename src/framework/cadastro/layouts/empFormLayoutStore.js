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
  const next = {};
  layoutConfigFields.forEach((field) => {
    if (source[field] !== undefined) next[field] = cloneValue(source[field]);
  });
  return next;
};

export const createEmptyLayoutConfig = (defaultConfig = {}) => {
  const panels = cloneValue(defaultConfig.panels || []);
  const layout = {};
  panels.forEach((panel) => {
    if (panel.id === "principal") {
      layout.principal = cloneValue(defaultConfig.layout?.principal || ["razao_social"]);
    } else {
      layout[panel.id] = [];
    }
  });
  return pickLayoutConfig({
    panels,
    layout,
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
  const seen = new Set();
  const next = {};
  Object.entries(layout || {}).forEach(([panelId, fieldIds]) => {
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

  let layout = sanitizeLayoutFieldPlacements(merged.layout || {});
  if (!Array.isArray(layout.principal)) {
    layout.principal = [];
  }
  if (mergeNewCustomFields && camposPersonalizadosCount > 0) {
    layout = mergeNewCustomFieldsIntoLayout(layout, defaultLayout);
    layout = sanitizeLayoutFieldPlacements(layout);
  }

  return {
    ...merged,
    panels: panels.filter(
      (panel) => panel.id !== "campos_personalizados" || (layout.campos_personalizados || []).length > 0
    ),
    layout,
    hiddenFieldIds: merged.hiddenFieldIds || [],
    visibilityRules: merged.visibilityRules || {},
    fieldLayoutConfig: normalizeFieldLayoutConfig(merged.fieldLayoutConfig),
  };
};

export const readStoredLayoutConfig = () => {
  try {
    const raw = localStorage.getItem(getLegacyKey());
    const parsed = raw ? JSON.parse(raw) : null;
    return isPlainLayoutConfig(parsed) ? parsed : null;
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

/** Remove IDs de campos inexistentes (ex.: custom fields excluídos). */
export const pruneLayoutToKnownFields = (layout = {}, knownFieldIds = []) => {
  const known = knownFieldIds instanceof Set ? knownFieldIds : new Set(knownFieldIds);
  const next = {};
  Object.entries(layout || {}).forEach(([panelId, fieldIds]) => {
    next[panelId] = (fieldIds || []).filter((fieldId) => known.has(fieldId));
  });
  return next;
};

const fillEmptyPanelsFromDefaults = (layout, defaultLayout) => {
  const next = { ...layout };
  Object.entries(defaultLayout || {}).forEach(([panelId, fieldIds]) => {
    if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
    if (!Array.isArray(next[panelId]) || next[panelId].length === 0) {
      next[panelId] = [...fieldIds];
    }
  });
  return next;
};

/** Garante layout utilizável: painéis do sistema visíveis e campos padrão nos painéis vazios. */
export const ensureLayoutFields = (saved, defaults, { knownFieldIds } = {}) => {
  if (!isPlainLayoutConfig(defaults)) return null;
  if (!isPlainLayoutConfig(saved)) return pickLayoutConfig(defaults);

  const merged = mergeSavedFormLayout(saved, defaults);
  const defaultLayout = defaults?.layout || {};
  const knownIds =
    knownFieldIds instanceof Set
      ? knownFieldIds
      : new Set([
          ...Object.values(defaultLayout).flat().filter(Boolean),
          ...(Array.isArray(knownFieldIds) ? knownFieldIds : []),
        ]);

  let layout = { ...(merged.layout || {}) };
  layout = pruneLayoutToKnownFields(layout, knownIds);
  layout = fillEmptyPanelsFromDefaults(layout, defaultLayout);

  const panels = (merged.panels || defaults.panels || []).map((panel) =>
    SYSTEM_PANEL_IDS.has(panel.id) ? { ...panel, hidden: false } : panel
  );

  const next = pickLayoutConfig({
    ...merged,
    panels: panels.length ? panels : defaults.panels,
    layout: sanitizeLayoutFieldPlacements(layout),
    fieldLayoutConfig: merged.fieldLayoutConfig || defaults.fieldLayoutConfig,
  });

  return countLayoutFields(next.layout) > 0 ? next : pickLayoutConfig(defaults);
};

export const countKnownLayoutFields = (layout = {}, knownFieldIds = []) =>
  Object.values(pruneLayoutToKnownFields(layout, knownFieldIds)).flat().filter(Boolean).length;

export const mergeSavedFormLayout = (saved, defaults) => {
  if (!isPlainLayoutConfig(defaults)) return pickLayoutConfig(defaults || {});
  if (!isPlainLayoutConfig(saved)) return pickLayoutConfig(defaults);

  const defaultLayout = defaults?.layout || {};
  const savedLayout = saved.layout || {};
  const layout = { ...defaultLayout };

  Object.entries(savedLayout).forEach(([panelId, fieldIds]) => {
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

  return pickLayoutConfig({
    ...defaults,
    ...saved,
    panels,
    layout,
    fieldLayoutConfig: saved.fieldLayoutConfig || defaults.fieldLayoutConfig,
  });
};

export const countLayoutFields = (layout = {}) =>
  Object.values(layout).flat().filter(Boolean).length;

export const empFormLayoutStore = {
  persistActiveConfig(config) {
    writeStoredLayoutConfig(config);
    return true;
  },
};

export default empFormLayoutStore;
