const PRESETS_KEY = "cadastro_emp_form_layout_presets_v1";
const LEGACY_KEY = "cadastro_emp_form_layout_config";
export const DEFAULT_PRESET_ID = "default";

const createSystemPreset = () => ({
  id: DEFAULT_PRESET_ID,
  name: "Padrão",
  isSystem: true,
  config: null,
  createdAt: null,
  updatedAt: null,
});

const defaultState = () => ({
  activePresetId: DEFAULT_PRESET_ID,
  presets: [createSystemPreset()],
});

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const readState = () => {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.presets?.length) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeState = (state) => {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(state));
};

const readLegacyConfig = () => {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeLegacyConfig = (config) => {
  localStorage.setItem(LEGACY_KEY, JSON.stringify(config));
};

const ensureState = () => {
  let state = readState();
  if (state) return state;

  state = defaultState();
  const legacy = readLegacyConfig();
  if (legacy) {
    state.presets.push({
      id: `layout_${Date.now()}`,
      name: "Layout personalizado",
      isSystem: false,
      config: cloneValue(legacy),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    state.activePresetId = state.presets[1].id;
  }
  writeState(state);
  return state;
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
];

export const pickLayoutConfig = (source = {}) => {
  const next = {};
  layoutConfigFields.forEach((field) => {
    if (source[field] !== undefined) next[field] = cloneValue(source[field]);
  });
  return next;
};

export const normalizeLayoutConfig = (
  source,
  { basePanels = [], defaultLayout = {}, camposPersonalizadosCount = 0 } = {}
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
  };
  const merged = { ...fallback, ...(source || {}) };
  const panelsSource = merged.panels?.some((panel) => panel.id === "principal")
    ? merged.panels
    : [basePanels[0], ...(merged.panels || basePanels)];
  const panels = [
    ...panelsSource,
    ...basePanels.filter((basePanel) => !panelsSource.some((panel) => panel.id === basePanel.id)),
  ];
  const principalFields = merged.layout?.principal?.length
    ? merged.layout.principal
    : defaultLayout.principal;

  return {
    ...merged,
    panels: panels.filter(
      (panel) => panel.id !== "campos_personalizados" || camposPersonalizadosCount > 0
    ),
    layout: {
      ...defaultLayout,
      ...merged.layout,
      principal: principalFields,
      campos_personalizados: defaultLayout.campos_personalizados,
    },
    hiddenFieldIds: (merged.hiddenFieldIds || []).filter(
      (id) => !["status", "codigo_empresa"].includes(id)
    ),
    visibilityRules: merged.visibilityRules || {},
  };
};

export const empFormLayoutStore = {
  getState() {
    return ensureState();
  },

  listPresets() {
    return [...ensureState().presets];
  },

  getActivePresetId() {
    return ensureState().activePresetId;
  },

  getPreset(presetId) {
    return ensureState().presets.find((preset) => preset.id === presetId) || null;
  },

  resolvePresetConfig(presetId, defaultConfig) {
    const preset = this.getPreset(presetId);
    if (!preset) return pickLayoutConfig(defaultConfig);
    if (preset.isSystem || !preset.config) return pickLayoutConfig(defaultConfig);
    return pickLayoutConfig(preset.config);
  },

  setActivePreset(presetId) {
    const state = ensureState();
    if (!state.presets.some((preset) => preset.id === presetId)) return state;
    const next = { ...state, activePresetId: presetId };
    writeState(next);
    return next;
  },

  createPreset({ name, sourcePresetId, defaultConfig }) {
    const state = ensureState();
    const source =
      sourcePresetId === DEFAULT_PRESET_ID
        ? pickLayoutConfig(defaultConfig)
        : this.resolvePresetConfig(sourcePresetId, defaultConfig);
    const now = new Date().toISOString();
    const preset = {
      id: `layout_${Date.now()}`,
      name: String(name || "Novo layout").trim() || "Novo layout",
      isSystem: false,
      config: source,
      createdAt: now,
      updatedAt: now,
    };
    const next = { ...state, presets: [...state.presets, preset], activePresetId: preset.id };
    writeState(next);
    return preset;
  },

  duplicatePreset(sourcePresetId, name, defaultConfig) {
    return this.createPreset({ name, sourcePresetId, defaultConfig });
  },

  updatePresetConfig(presetId, config) {
    const state = ensureState();
    const preset = state.presets.find((item) => item.id === presetId);
    if (!preset || preset.isSystem) return null;
    const now = new Date().toISOString();
    const nextPreset = {
      ...preset,
      config: pickLayoutConfig(config),
      updatedAt: now,
    };
    const next = {
      ...state,
      presets: state.presets.map((item) => (item.id === presetId ? nextPreset : item)),
    };
    writeState(next);
    return nextPreset;
  },

  renamePreset(presetId, name) {
    const state = ensureState();
    const preset = state.presets.find((item) => item.id === presetId);
    if (!preset || preset.isSystem) return null;
    const nextName = String(name || preset.name).trim();
    if (!nextName) return null;
    const next = {
      ...state,
      presets: state.presets.map((item) =>
        item.id === presetId ? { ...item, name: nextName, updatedAt: new Date().toISOString() } : item
      ),
    };
    writeState(next);
    return next.presets.find((item) => item.id === presetId);
  },

  deletePreset(presetId) {
    const state = ensureState();
    const preset = state.presets.find((item) => item.id === presetId);
    if (!preset || preset.isSystem) return state;
    const presets = state.presets.filter((item) => item.id !== presetId);
    const activePresetId = state.activePresetId === presetId ? DEFAULT_PRESET_ID : state.activePresetId;
    const next = { activePresetId, presets };
    writeState(next);
    return next;
  },

  persistActiveConfig(config) {
    writeLegacyConfig(pickLayoutConfig(config));
    const state = ensureState();
    const active = state.presets.find((item) => item.id === state.activePresetId);
    if (active && !active.isSystem) {
      this.updatePresetConfig(state.activePresetId, config);
    }
    return state.activePresetId;
  },
};

export default empFormLayoutStore;
