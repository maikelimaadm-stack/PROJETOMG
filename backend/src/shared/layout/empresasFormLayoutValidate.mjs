/**
 * Regras corporativas de layout empresas.form_layout (V3).
 * Usado pelo backend na persistência — fonte única de validação estrutural.
 */

const LAYOUT_CONFIG_VERSION_V3 = 3;
const DEFAULT_VIRTUAL_CARD_ID = "geral";

const resolveCardColSpan = (colSpan) => (Number(colSpan) <= 6 ? 6 : 12);

const getMaxFieldsPerRow = (colSpan) => (resolveCardColSpan(colSpan) <= 6 ? 4 : 7);

const flattenRowsToFieldIds = (card) => {
  if (Array.isArray(card?.rows) && card.rows.length) {
    const sorted = [...card.rows].sort((a, b) => (a.order || 0) - (b.order || 0));
    const ids = [];
    const seen = new Set();
    sorted.forEach((row) => {
      (row.fieldIds || []).forEach((fieldId) => {
        if (!fieldId || seen.has(fieldId)) return;
        seen.add(fieldId);
        ids.push(fieldId);
      });
    });
    return ids;
  }
  return Array.isArray(card?.fieldIds) ? [...card.fieldIds] : [];
};

const isPanelLayoutV3 = (panelLayout) =>
  Boolean(
    panelLayout &&
      typeof panelLayout === "object" &&
      !Array.isArray(panelLayout) &&
      Array.isArray(panelLayout.cards)
  );

const normalizeCardRows = (card = {}) => {
  const colSpan = resolveCardColSpan(card.colSpan);
  const max = getMaxFieldsPerRow(colSpan);
  const rows = Array.isArray(card.rows) ? card.rows : [];
  const normalizedRows = [];
  let pending = null;

  const flush = () => {
    if (!pending?.ids?.length) {
      pending = null;
      return;
    }
    normalizedRows.push({
      id: pending.rowId || `row_${normalizedRows.length + 1}`,
      order: normalizedRows.length + 1,
      fieldIds: [...pending.ids],
    });
    pending = null;
  };

  rows.forEach((row) => {
    const ids = (row.fieldIds || []).filter(Boolean);
    ids.forEach((fieldId) => {
      if (!pending) pending = { rowId: row.id, ids: [] };
      if (pending.ids.length >= max) {
        flush();
        pending = { rowId: row.id, ids: [] };
      }
      pending.ids.push(fieldId);
    });
  });
  flush();

  const fieldIds = flattenRowsToFieldIds({ rows: normalizedRows });
  return { rows: normalizedRows, fieldIds };
};

const normalizeLayoutCardV3 = (source = {}, index = 0) => {
  const id =
    typeof source.id === "string" && source.id.trim()
      ? source.id.trim()
      : `${DEFAULT_VIRTUAL_CARD_ID}_${index + 1}`;
  const label =
    typeof source.label === "string" && source.label.trim() ? source.label.trim() : "Geral";
  const order = Number.isFinite(Number(source.order)) ? Number(source.order) : index + 1;
  const colSpan = resolveCardColSpan(source.colSpan);
  const normalized = normalizeCardRows({ ...source, colSpan });

  return {
    id,
    label,
    order,
    collapsible: source.collapsible !== false,
    columns: Math.min(12, Math.max(1, Number(source.columns) || 12)),
    colSpan,
    rows: normalized.rows,
    fieldIds: normalized.fieldIds,
  };
};

const sanitizeLayoutV3 = (layoutV3 = {}) => {
  const globalSeen = new Set();
  const next = {};

  Object.entries(layoutV3 || {}).forEach(([panelId, panelLayout]) => {
    if (!isPanelLayoutV3(panelLayout)) {
      throw validationError(`Layout do painel "${panelId}" inválido.`);
    }

    const cards = (panelLayout.cards || []).map((card, index) => {
      const uniqueFieldIds = [];
      const sourceIds =
        Array.isArray(card.fieldIds) && card.fieldIds.length
          ? card.fieldIds
          : flattenRowsToFieldIds(card);

      sourceIds.forEach((fieldId) => {
        if (!fieldId || globalSeen.has(fieldId)) return;
        globalSeen.add(fieldId);
        uniqueFieldIds.push(fieldId);
      });

      const uniqueSet = new Set(uniqueFieldIds);
      const rows = (card.rows || [])
        .map((row, rowIndex) => ({
          id: row.id || `row_${rowIndex + 1}`,
          order: row.order || rowIndex + 1,
          fieldIds: (row.fieldIds || []).filter((fieldId) => uniqueSet.has(fieldId)),
        }))
        .filter((row) => row.fieldIds.length);

      const colSpan = resolveCardColSpan(card.colSpan);
      const max = getMaxFieldsPerRow(colSpan);
      rows.forEach((row) => {
        if ((row.fieldIds || []).length > max) {
          throw validationError(
            `Linha do card "${card.id || index}" no painel "${panelId}" excede ${max} campos.`
          );
        }
      });

      return normalizeLayoutCardV3(
        {
          ...card,
          rows,
          fieldIds: flattenRowsToFieldIds({ rows }),
        },
        index
      );
    });

    if (!cards.length) {
      throw validationError(`Painel "${panelId}" precisa de ao menos um card.`);
    }

    next[panelId] = { cards };
  });

  return next;
};

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

/**
 * @param {unknown} rawConfig
 * @returns {object} config normalizado V3
 */
export const validateAndNormalizeEmpresasFormLayout = (rawConfig) => {
  if (rawConfig == null || typeof rawConfig !== "object") {
    throw validationError("Configuração de layout inválida.");
  }

  const activeConfig =
    rawConfig.activeConfig && typeof rawConfig.activeConfig === "object"
      ? rawConfig.activeConfig
      : rawConfig;

  const panels = Array.isArray(activeConfig.panels) ? activeConfig.panels : [];
  if (!panels.length) {
    throw validationError("Lista de painéis não pode estar vazia.");
  }

  const panelIds = new Set();
  panels.forEach((panel) => {
    if (!panel?.id || typeof panel.id !== "string") {
      throw validationError("Painel sem identificador válido.");
    }
    if (panelIds.has(panel.id)) {
      throw validationError(`Painel duplicado: "${panel.id}".`);
    }
    panelIds.add(panel.id);
  });

  const layout = sanitizeLayoutV3(activeConfig.layout || {});

  Object.keys(layout).forEach((panelId) => {
    if (!panelIds.has(panelId)) {
      throw validationError(`Layout referencia painel desconhecido: "${panelId}".`);
    }
  });

  panels.forEach((panel) => {
    if (!layout[panel.id]) {
      layout[panel.id] = {
        cards: [
          normalizeLayoutCardV3({
            id: DEFAULT_VIRTUAL_CARD_ID,
            label: "Geral",
            order: 1,
            rows: [],
            fieldIds: [],
          }),
        ],
      };
    }
  });

  const cardIdsByPanel = {};
  Object.entries(layout).forEach(([panelId, panelLayout]) => {
    const seenCards = new Set();
    panelLayout.cards.forEach((card) => {
      if (seenCards.has(card.id)) {
        throw validationError(`Card duplicado "${card.id}" no painel "${panelId}".`);
      }
      seenCards.add(card.id);
    });
    cardIdsByPanel[panelId] = seenCards;
  });

  const normalized = {
    version: LAYOUT_CONFIG_VERSION_V3,
    panels: panels.map((panel, index) => ({
      id: panel.id,
      label: typeof panel.label === "string" ? panel.label : panel.id,
      hidden: !!panel.hidden,
      order: Number.isFinite(Number(panel.order)) ? Number(panel.order) : index + 1,
    })),
    layout,
  };

  const optionalArrays = [
    "hiddenFieldIds",
    "lockedFieldIds",
    "requiredFieldIds",
    "clearOnDuplicateFieldIds",
  ];
  optionalArrays.forEach((key) => {
    if (Array.isArray(activeConfig[key])) {
      normalized[key] = [...new Set(activeConfig[key].filter(Boolean))];
    }
  });

  if (activeConfig.fieldSizes && typeof activeConfig.fieldSizes === "object") {
    normalized.fieldSizes = { ...activeConfig.fieldSizes };
  }
  if (activeConfig.fieldDefaultValues && typeof activeConfig.fieldDefaultValues === "object") {
    normalized.fieldDefaultValues = { ...activeConfig.fieldDefaultValues };
  }
  if (activeConfig.aggregationConfig && typeof activeConfig.aggregationConfig === "object") {
    normalized.aggregationConfig = { ...activeConfig.aggregationConfig };
  }
  if (activeConfig.visibilityRules && typeof activeConfig.visibilityRules === "object") {
    normalized.visibilityRules = { ...activeConfig.visibilityRules };
  }
  if (activeConfig.fieldLayoutConfig && typeof activeConfig.fieldLayoutConfig === "object") {
    normalized.fieldLayoutConfig = { ...activeConfig.fieldLayoutConfig };
  }

  return { version: LAYOUT_CONFIG_VERSION_V3, activeConfig: normalized };
};

export const EMPRESAS_FORM_LAYOUT_SCREEN_KEY = "empresas.form_layout";
