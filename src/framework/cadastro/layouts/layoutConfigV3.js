/**
 * LayoutConfigV3 — Painel → Card → Campo
 * @module layoutConfigV3
 */

export const LAYOUT_CONFIG_VERSION_V2 = 2;
export const LAYOUT_CONFIG_VERSION_V3 = 3;

/** Card virtual padrão quando o painel não define cards (compatibilidade). */
export const DEFAULT_VIRTUAL_CARD_ID = "geral";
export const DEFAULT_VIRTUAL_CARD_LABEL = "Geral";

export const DEFAULT_CARD_COLUMNS = 12;

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

/**
 * @typedef {Object} LayoutCardV3
 * @property {string} id
 * @property {string} label
 * @property {number} [order]
 * @property {boolean} [collapsible]
 * @property {number} [columns] — colunas internas do grid de campos (12)
 * @property {number} [colSpan] — largura do card na linha (6 = metade, 12 = inteira)
 * @property {string[]} fieldIds
 */

/**
 * @typedef {Object} PanelLayoutV3
 * @property {LayoutCardV3[]} cards
 */

/**
 * @typedef {Object} LayoutConfigV3
 * @property {3} version
 * @property {Array<{ id: string, label: string, hidden?: boolean, order?: number }>} panels
 * @property {Record<string, PanelLayoutV3>} layout
 */

/**
 * @param {unknown} value
 * @returns {value is LayoutCardV3}
 */
export const isLayoutCardV3 = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      typeof value.id === "string" &&
      Array.isArray(value.fieldIds)
  );

/**
 * @param {unknown} panelLayout
 * @returns {panelLayout is string[]}
 */
export const isPanelLayoutV2 = (panelLayout) => Array.isArray(panelLayout);

/**
 * @param {unknown} panelLayout
 * @returns {panelLayout is PanelLayoutV3}
 */
export const isPanelLayoutV3 = (panelLayout) =>
  Boolean(
    panelLayout &&
      typeof panelLayout === "object" &&
      !Array.isArray(panelLayout) &&
      Array.isArray(panelLayout.cards)
  );

/**
 * @param {Record<string, unknown>} [layout]
 */
export const isLayoutStructureV2 = (layout = {}) =>
  Object.values(layout).some((panelLayout) => isPanelLayoutV2(panelLayout));

/**
 * @param {Record<string, unknown>} [layout]
 */
export const isLayoutStructureV3 = (layout = {}) =>
  Object.values(layout).some((panelLayout) => isPanelLayoutV3(panelLayout));

/**
 * @param {unknown} config
 */
export const isLayoutConfigV3 = (config) => {
  if (!config || typeof config !== "object") return false;
  if (Number(config.version) === LAYOUT_CONFIG_VERSION_V3) return true;
  return isLayoutStructureV3(config.layout);
};

/**
 * @param {unknown} config
 */
export const isLayoutConfigV2 = (config) => {
  if (!config || typeof config !== "object") return false;
  const version = Number(config.version);
  if (version === LAYOUT_CONFIG_VERSION_V3) return false;
  if (version === LAYOUT_CONFIG_VERSION_V2 || !config.version) return true;
  return isLayoutStructureV2(config.layout) && !isLayoutStructureV3(config.layout);
};

/**
 * @param {LayoutCardV3} source
 * @param {number} index
 * @returns {LayoutCardV3}
 */
export const normalizeLayoutCardV3 = (source = {}, index = 0) => {
  const id =
    typeof source.id === "string" && source.id.trim()
      ? source.id.trim()
      : `${DEFAULT_VIRTUAL_CARD_ID}_${index + 1}`;
  const label =
    typeof source.label === "string" && source.label.trim()
      ? source.label.trim()
      : DEFAULT_VIRTUAL_CARD_LABEL;
  const order = Number.isFinite(Number(source.order)) ? Number(source.order) : index + 1;
  const columns = Math.min(12, Math.max(1, Number(source.columns) || DEFAULT_CARD_COLUMNS));
  let colSpan = Number(source.colSpan);
  if (!Number.isFinite(colSpan) || colSpan < 1) colSpan = 12;
  colSpan = Math.min(12, Math.max(1, colSpan));
  const fieldIds = Array.isArray(source.fieldIds)
    ? source.fieldIds.filter((fieldId) => typeof fieldId === "string" && fieldId)
    : [];

  return {
    id,
    label,
    order,
    collapsible: source.collapsible !== false,
    columns,
    colSpan,
    fieldIds,
  };
};

/**
 * @param {PanelLayoutV3 | string[] | null | undefined} panelLayout
 * @param {{ panelId?: string, defaultFieldIds?: string[] }} [options]
 * @returns {PanelLayoutV3}
 */
export const normalizePanelLayoutV3 = (panelLayout, { panelId = "panel", defaultFieldIds = [] } = {}) => {
  if (isPanelLayoutV3(panelLayout)) {
    const cards = [...(panelLayout.cards || [])]
      .map((card, index) => normalizeLayoutCardV3(card, index))
      .sort((a, b) => a.order - b.order);
    return { cards: cards.length ? cards : [createDefaultCardV3(defaultFieldIds, panelId)] };
  }

  const fieldIds = isPanelLayoutV2(panelLayout) ? panelLayout : defaultFieldIds;
  return { cards: [createDefaultCardV3(fieldIds, panelId)] };
};

/**
 * @param {string[]} [fieldIds]
 * @param {string} [panelId]
 * @returns {LayoutCardV3}
 */
export const createDefaultCardV3 = (fieldIds = [], panelId = "panel") => ({
  id: panelId === "principal" ? DEFAULT_VIRTUAL_CARD_ID : `${panelId}_${DEFAULT_VIRTUAL_CARD_ID}`,
  label: DEFAULT_VIRTUAL_CARD_LABEL,
  order: 1,
  collapsible: true,
  columns: DEFAULT_CARD_COLUMNS,
  fieldIds: [...fieldIds],
});

/**
 * @param {Record<string, PanelLayoutV3>} layoutV3
 * @returns {Record<string, string[]>}
 */
export const flattenV3LayoutToV2 = (layoutV3 = {}) => {
  const flat = {};
  Object.entries(layoutV3).forEach(([panelId, panelLayout]) => {
    if (!isPanelLayoutV3(panelLayout)) {
      if (isPanelLayoutV2(panelLayout)) flat[panelId] = [...panelLayout];
      return;
    }
    const seen = new Set();
    const fieldIds = [];
    [...(panelLayout.cards || [])]
      .sort((a, b) => a.order - b.order)
      .forEach((card) => {
        (card.fieldIds || []).forEach((fieldId) => {
          if (!fieldId || seen.has(fieldId)) return;
          seen.add(fieldId);
          fieldIds.push(fieldId);
        });
      });
    flat[panelId] = fieldIds;
  });
  return flat;
};

/**
 * @param {Record<string, string[]>} flatLayout
 * @param {Record<string, PanelLayoutV3>} [existingV3]
 * @returns {Record<string, PanelLayoutV3>}
 */
export const rebuildV3LayoutFromFlat = (flatLayout = {}, existingV3 = {}) => {
  const next = {};
  Object.entries(flatLayout).forEach(([panelId, fieldIds]) => {
    const ids = Array.isArray(fieldIds) ? fieldIds.filter(Boolean) : [];
    const existingPanel = existingV3[panelId];
    if (isPanelLayoutV3(existingPanel) && (existingPanel.cards || []).length > 1) {
      const primaryCardId = existingPanel.cards[0]?.id;
      next[panelId] = {
        cards: existingPanel.cards.map((card, index) =>
          card.id === primaryCardId || index === 0
            ? { ...normalizeLayoutCardV3(card, index), fieldIds: [...ids] }
            : normalizeLayoutCardV3(card, index)
        ),
      };
      return;
    }
    next[panelId] = normalizePanelLayoutV3(ids, { panelId, defaultFieldIds: ids });
  });
  return next;
};

/**
 * @param {Record<string, PanelLayoutV3>} layoutV3
 * @returns {Record<string, PanelLayoutV3>}
 */
export const sanitizeLayoutV3 = (layoutV3 = {}) => {
  const globalSeen = new Set();
  const next = {};
  Object.entries(layoutV3).forEach(([panelId, panelLayout]) => {
    const normalizedPanel = normalizePanelLayoutV3(panelLayout, { panelId });
    const cards = normalizedPanel.cards.map((card, index) => {
      const uniqueFieldIds = [];
      (card.fieldIds || []).forEach((fieldId) => {
        if (!fieldId || globalSeen.has(fieldId)) return;
        globalSeen.add(fieldId);
        uniqueFieldIds.push(fieldId);
      });
      return { ...card, fieldIds: uniqueFieldIds, order: index + 1 };
    });
    next[panelId] = { cards };
  });
  return next;
};

/**
 * @param {Record<string, PanelLayoutV3>} [layoutV3]
 */
export const countLayoutFieldsV3 = (layoutV3 = {}) =>
  Object.values(layoutV3).reduce((total, panelLayout) => {
    if (!isPanelLayoutV3(panelLayout)) return total;
    return (
      total +
      panelLayout.cards.reduce((cardTotal, card) => cardTotal + (card.fieldIds?.length || 0), 0)
    );
  }, 0);

/**
 * Migra configuração V2 (painel → lista de campos) para V3 (painel → cards → campos).
 * @param {object} config
 * @param {{ defaultLayout?: Record<string, string[]> }} [options]
 * @returns {LayoutConfigV3 & object}
 */
export const migrateV2ToV3 = (config = {}, { defaultLayout = {} } = {}) => {
  const source = cloneValue(config);
  const flatLayout = {};

  Object.entries(source.layout || {}).forEach(([panelId, panelLayout]) => {
    if (isPanelLayoutV2(panelLayout)) {
      flatLayout[panelId] = [...panelLayout];
    } else if (isPanelLayoutV3(panelLayout)) {
      flatLayout[panelId] = flattenV3LayoutToV2({ [panelId]: panelLayout })[panelId] || [];
    }
  });

  Object.entries(defaultLayout).forEach(([panelId, fieldIds]) => {
    if (!Array.isArray(fieldIds) || flatLayout[panelId]?.length) return;
    flatLayout[panelId] = [...fieldIds];
  });

  const layoutV3 = sanitizeLayoutV3(rebuildV3LayoutFromFlat(flatLayout));

  return {
    ...source,
    version: LAYOUT_CONFIG_VERSION_V3,
    layout: layoutV3,
  };
};

/**
 * Resolve configuração para V3 canônico com fallback automático.
 * @param {object|null|undefined} config
 * @param {{ defaultLayout?: Record<string, string[]>, defaults?: object }} [options]
 * @returns {{ config: object, layoutV3: Record<string, PanelLayoutV3>, layoutFlat: Record<string, string[]>, migrated: boolean }}
 */
export const resolveLayoutConfig = (config, { defaultLayout = {}, defaults = null } = {}) => {
  const fallbackDefaults = defaults || {};
  const fallbackLayout = {
    ...(fallbackDefaults.layout || {}),
    ...defaultLayout,
  };

  let migrated = false;
  let working = config && typeof config === "object" ? cloneValue(config) : null;

  if (!working) {
    working = cloneValue(fallbackDefaults);
    migrated = true;
  }

  if (working.layoutV3 && isLayoutStructureV3(working.layoutV3)) {
    working = { ...working, layout: working.layoutV3, version: LAYOUT_CONFIG_VERSION_V3 };
  }

  if (!isLayoutConfigV3(working)) {
    working = migrateV2ToV3(working, { defaultLayout: fallbackLayout });
    migrated = true;
  }

  let layoutV3 = sanitizeLayoutV3(working.layout || {});

  Object.entries(fallbackLayout).forEach(([panelId, fieldIds]) => {
    if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
    const panel = layoutV3[panelId];
    const flatIds = flattenV3LayoutToV2({ [panelId]: panel })[panelId] || [];
    if (flatIds.length === 0) {
      layoutV3 = {
        ...layoutV3,
        [panelId]: normalizePanelLayoutV3(fieldIds, { panelId, defaultFieldIds: fieldIds }),
      };
      migrated = true;
    }
  });

  if (countLayoutFieldsV3(layoutV3) === 0 && Object.keys(fallbackLayout).length > 0) {
    layoutV3 = rebuildV3LayoutFromFlat(fallbackLayout);
    migrated = true;
  }

  layoutV3 = sanitizeLayoutV3(layoutV3);
  const layoutFlat = flattenV3LayoutToV2(layoutV3);

  const resolved = {
    ...working,
    version: LAYOUT_CONFIG_VERSION_V3,
    layout: layoutV3,
    layoutV3,
    layoutFlat,
  };

  return { config: resolved, layoutV3, layoutFlat, migrated };
};

/**
 * Sincroniza layout V3 após mutações no layout flat (V2).
 * @param {object} config
 * @param {Record<string, string[]>} flatLayout
 */
export const syncLayoutV3FromFlat = (config, flatLayout) => {
  const existingV3 =
    config?.layoutV3 ||
    (isLayoutStructureV3(config?.layout) ? config.layout : {}) ||
    {};
  const layoutV3 = sanitizeLayoutV3(rebuildV3LayoutFromFlat(flatLayout, existingV3));
  return {
    ...config,
    version: LAYOUT_CONFIG_VERSION_V3,
    layout: layoutV3,
    layoutV3,
    layoutFlat: flattenV3LayoutToV2(layoutV3),
  };
};

/**
 * Extrai layout flat para consumidores V2 (renderer atual).
 * @param {object|null|undefined} config
 * @param {{ defaultLayout?: Record<string, string[]> }} [options]
 */
export const getFlatLayoutFromConfig = (config, options = {}) => {
  const { layoutFlat } = resolveLayoutConfig(config, options);
  return layoutFlat;
};
