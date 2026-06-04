import {
  LAYOUT_CONFIG_VERSION_V3,
  coerceLayoutToV3,
  isLayoutStructureV3,
  migrateV2ToV3,
  flattenV3LayoutToV2,
  sanitizeLayoutV3,
} from "./layoutConfigV3.js";

const LEGACY_LAYOUT_MODES = new Set(["vertical", "compact", "details", "detailsCompact", "details_compact", "columns", "stacked"]);

/** Painel legado só de seleção — campos migram para Principais. */
export const LAYOUT_SELECTOR_PANEL_ID = "principal";
export const LAYOUT_MAIN_TAB_ID = "principais";

/**
 * Migra configs antigas (principal/compact/vertical) para V3 corporativo padrão.
 * @param {object|null} saved
 * @param {object} defaults
 */
export const upgradeStoredLayoutConfig = (saved, defaults) => {
  if (!saved || typeof saved !== "object") return null;

  const defaultFlat = flattenV3LayoutToV2(defaults?.layout || {});
  const defaultPanels = defaults?.panels || [];
  const mode = saved?.fieldLayoutConfig?.mode;
  const hasLegacyMode = mode && LEGACY_LAYOUT_MODES.has(mode);
  const version = Number(saved.version);

  let panels = Array.isArray(saved.panels) ? [...saved.panels] : [];
  let layoutSource = { ...(saved.layout || {}) };

  if (layoutSource[LAYOUT_SELECTOR_PANEL_ID]) {
    const principalFields = layoutSource[LAYOUT_SELECTOR_PANEL_ID];
    const flatPrincipal = Array.isArray(principalFields)
      ? principalFields
      : flattenV3LayoutToV2({ [LAYOUT_SELECTOR_PANEL_ID]: principalFields })[LAYOUT_SELECTOR_PANEL_ID] || [];

    if (!layoutSource[LAYOUT_MAIN_TAB_ID]) {
      layoutSource[LAYOUT_MAIN_TAB_ID] = flatPrincipal;
    } else if (Array.isArray(layoutSource[LAYOUT_MAIN_TAB_ID])) {
      layoutSource[LAYOUT_MAIN_TAB_ID] = [
        ...new Set([...flatPrincipal, ...layoutSource[LAYOUT_MAIN_TAB_ID]]),
      ];
    }
    delete layoutSource[LAYOUT_SELECTOR_PANEL_ID];
  }

  const hasPrincipaisPanel = panels.some((p) => p.id === LAYOUT_MAIN_TAB_ID);
  if (!hasPrincipaisPanel) {
    const principalPanel = panels.find((p) => p.id === LAYOUT_SELECTOR_PANEL_ID);
    panels = panels.filter((p) => p.id !== LAYOUT_SELECTOR_PANEL_ID);
    panels.unshift({
      id: LAYOUT_MAIN_TAB_ID,
      label: "Principais",
      hidden: false,
      order: principalPanel?.order ?? 0,
    });
  }

  panels = panels.map((panel) =>
    panel.id === LAYOUT_SELECTOR_PANEL_ID
      ? { ...panel, id: LAYOUT_MAIN_TAB_ID, label: panel.label || "Principais", hidden: false }
      : panel.id === LAYOUT_MAIN_TAB_ID
        ? { ...panel, label: "Principais", hidden: false }
        : panel
  );

  const mustResetLayout =
    hasLegacyMode ||
    version < LAYOUT_CONFIG_VERSION_V3 ||
    !Object.keys(layoutSource).some((key) => {
      const val = layoutSource[key];
      return val && (Array.isArray(val) ? val.length : val?.cards?.length);
    });

  if (mustResetLayout) {
    if (!defaults) return null;
    return {
      ...defaults,
      panels: defaultPanels.map((p) => ({ ...p })),
      fieldSizes: { ...(defaults.fieldSizes || {}) },
      fieldLayoutConfig: { mode: "corporate", columns: 12 },
      version: LAYOUT_CONFIG_VERSION_V3,
    };
  }

  const alreadyV3 =
    version >= LAYOUT_CONFIG_VERSION_V3 && isLayoutStructureV3(layoutSource);

  if (alreadyV3) {
    return {
      ...saved,
      panels,
      layout: sanitizeLayoutV3(coerceLayoutToV3(layoutSource)),
      fieldLayoutConfig: { mode: "corporate", columns: 12, ...(saved.fieldLayoutConfig || {}) },
      fieldSizes: { ...(defaults?.fieldSizes || {}), ...(saved.fieldSizes || {}) },
      version: LAYOUT_CONFIG_VERSION_V3,
    };
  }

  const migrated = migrateV2ToV3(
    {
      ...saved,
      panels,
      layout: layoutSource,
      fieldLayoutConfig: { mode: "corporate", columns: 12 },
      fieldSizes: { ...(defaults?.fieldSizes || {}), ...(saved.fieldSizes || {}) },
      version: LAYOUT_CONFIG_VERSION_V3,
    },
    { defaultLayout: defaultFlat }
  );

  return migrated;
};

export const clearLegacyLayoutStorageForUser = (userId) => {
  if (!userId || typeof localStorage === "undefined") return;
  const prefix = `cadastro:${userId}:`;
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(prefix) || key === "cadastro_emp_form_layout_config")) {
      keys.push(key);
    }
  }
  keys.forEach((key) => localStorage.removeItem(key));
};
