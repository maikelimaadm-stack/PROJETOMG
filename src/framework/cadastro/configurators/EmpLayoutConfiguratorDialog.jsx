import React, { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  Reply,
  RotateCcw,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import EmpLayoutFieldSettingsPopover from "@/framework/cadastro/layouts/EmpLayoutFieldSettingsPopover";
import EmpLayoutFieldStatusIcons from "@/framework/cadastro/layouts/EmpLayoutFieldStatusIcons";
import { showWarning } from "@/shared/feedback";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import EmpToolbarIcon from "@/framework/cadastro/toolbars/EmpToolbarIcon";
import {
  EMP_TOOLBAR_BTN,
  EMP_TOOLBAR_SEARCH_INPUT,
  EMP_TOOLBAR_SEARCH_WRAP,
} from "@/framework/cadastro/toolbars/empToolbarStyles";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import { useContainerWidth } from "@/framework/cadastro-engine/render/useContainerWidth.js";
import { cn } from "@/shared/utils/utils";
import {
  initCardsByPanel,
  flattenLayoutFromCards,
  buildLayoutV3FromCards,
  createNewCardId,
} from "@/framework/cadastro/layouts/empFormLayoutCards";
import {
  DEFAULT_VIRTUAL_CARD_ID,
  getDefaultFlatLayoutFromConfig,
  getPanelFieldIdsFromLayout,
  normalizeLayoutCardV3,
} from "@/framework/cadastro/layouts/layoutConfigV3";
import { DEFAULT_FIELD_LAYOUT_CONFIG } from "@/framework/cadastro/layouts/empFormLayoutStore";
import { CARD_COL_SPAN_OPTIONS, FIELD_WIDTH_TYPE_OPTIONS } from "@/framework/cadastro/layouts/empFormFieldGrid";
import {
  balanceConfiguredRows,
  createEmptyLayoutRow,
  deleteLayoutRow,
  enforceMaxFieldsPerCardRows,
  flattenRowsToFieldIds,
  placeFieldInCardRows,
  removeFieldFromRows,
  reorderFieldWithinRows,
  resolveConfiguredCardRows,
  rowHasRoomForField,
  createRowId,
} from "@/framework/cadastro/layouts/empFormLayoutRows";
import {
  getMaxFieldsPerRow,
  resolveCardColSpan,
} from "@/framework/cadastro/layouts/empFormFieldWidthPresets";

const DEFAULT_SYSTEM_PANEL_IDS = ["principais", "endereco", "observacoes", "campos_personalizados"];
const DEFAULT_FIXED_PANEL_IDS = [];
const DEFAULT_FIXED_VISIBLE_FIELD_IDS = [];

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const LABELED_BTN_CLASS = "emp-toolbar-btn-labeled w-auto px-2 gap-1.5 text-[12px] font-medium";

const isCustomPanelByIds = (panel, systemPanelIds) => panel && !systemPanelIds.includes(panel.id);
const isCustomField = (field) => field?.origem === "customizado" || String(field?.id || "").startsWith("custom:");
const formatPanelLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const findDefaultPanelForField = (fieldId, layout = {}) => {
  for (const panelId of Object.keys(layout || {})) {
    if (getPanelFieldIdsFromLayout(layout, panelId).includes(fieldId)) return panelId;
  }
  return "";
};

export default function EmpLayoutConfiguratorDialog({
  open,
  onOpenChange,
  panels = [],
  fields = [],
  layout = {},
  fieldSizes = {},
  fieldLayoutConfig = DEFAULT_FIELD_LAYOUT_CONFIG,
  hiddenFieldIds = [],
  lockedFieldIds = [],
  requiredFieldIds = [],
  clearOnDuplicateFieldIds = [],
  fieldDefaultValues = {},
  aggregationConfig = {},
  visibilityRules = {},
  defaultConfig = null,
  onSave,
  inline = false,
  systemPanelIds = DEFAULT_SYSTEM_PANEL_IDS,
  fixedPanelIds = DEFAULT_FIXED_PANEL_IDS,
  fixedVisibleFieldIds = DEFAULT_FIXED_VISIBLE_FIELD_IDS,
}) {
  const [draftPanels, setDraftPanels] = useState(panels);
  const defaultFlatLayout = useMemo(
    () => getDefaultFlatLayoutFromConfig(defaultConfig),
    [defaultConfig]
  );
  const [draftCardsByPanel, setDraftCardsByPanel] = useState(() =>
    initCardsByPanel({ panels, layout, defaultLayout: defaultFlatLayout })
  );
  const [draftFieldSizes, setDraftFieldSizes] = useState(fieldSizes);
  const [activeCardId, setActiveCardId] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [draftHiddenFieldIds, setDraftHiddenFieldIds] = useState(hiddenFieldIds);
  const [draftLockedFieldIds, setDraftLockedFieldIds] = useState(lockedFieldIds);
  const [draftRequiredFieldIds, setDraftRequiredFieldIds] = useState(requiredFieldIds);
  const [draftClearOnDuplicateFieldIds, setDraftClearOnDuplicateFieldIds] = useState(clearOnDuplicateFieldIds);
  const [draftFieldDefaultValues, setDraftFieldDefaultValues] = useState(fieldDefaultValues);
  const [draftAggregationConfig, setDraftAggregationConfig] = useState(aggregationConfig);
  const [draftVisibilityRules, setDraftVisibilityRules] = useState(visibilityRules);
  const [activePanelId, setActivePanelId] = useState(panels[0]?.id || "");
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedPanelFieldIds, setSelectedPanelFieldIds] = useState([]);
  const [search, setSearch] = useState("");
  const [sidebarMode, setSidebarMode] = useState("available");
  const [isEditing, setIsEditing] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [draggedPanelId, setDraggedPanelId] = useState(null);
  const [editingPanelId, setEditingPanelId] = useState(null);
  const [fieldLastPanelId, setFieldLastPanelId] = useState({});
  const [fieldSettingsTarget, setFieldSettingsTarget] = useState(null);
  const [fieldSettingsAnchor, setFieldSettingsAnchor] = useState(null);
  const wasOpenRef = useRef(false);

  React.useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    if (wasOpenRef.current) return;

    const cards = initCardsByPanel({
      panels,
      layout,
      defaultLayout: defaultFlatLayout,
    });
    setDraftPanels(panels);
    setDraftCardsByPanel(cards);
    setDraftFieldSizes(fieldSizes || {});
    const firstPanelId = panels[0]?.id || "";
    setActiveCardId(cards[firstPanelId]?.cards?.[0]?.id || DEFAULT_VIRTUAL_CARD_ID);
    setEditingCardId(null);
    setDraftHiddenFieldIds(hiddenFieldIds);
    setDraftLockedFieldIds(lockedFieldIds);
    setDraftRequiredFieldIds(requiredFieldIds);
    setDraftClearOnDuplicateFieldIds(clearOnDuplicateFieldIds);
    setDraftFieldDefaultValues(fieldDefaultValues);
    setDraftAggregationConfig(aggregationConfig);
    setDraftVisibilityRules(visibilityRules);
    setActivePanelId(firstPanelId);
    setSelectedAvailableIds([]);
    setSelectedPanelFieldIds([]);
    setSearch("");
    setSidebarMode("available");
    setIsEditing(false);
    setEditingPanelId(null);
    setFieldLastPanelId({});
    setFieldSettingsTarget(null);
    setFieldSettingsAnchor(null);
    wasOpenRef.current = true;
  }, [open, panels, layout, fieldSizes, hiddenFieldIds, lockedFieldIds, requiredFieldIds, clearOnDuplicateFieldIds, fieldDefaultValues, aggregationConfig, visibilityRules, defaultFlatLayout]);

  const { ref: layoutPanelRef, width: layoutPanelWidthPx } = useContainerWidth(720);

  const activePanel = draftPanels.find((panel) => panel.id === activePanelId) || draftPanels[0];
  const activePanelCards = draftCardsByPanel[activePanel?.id]?.cards || [];
  const activeCard = activePanelCards.find((card) => card.id === activeCardId) || activePanelCards[0];
  const activeCardSpan = activeCard ? resolveCardColSpan(activeCard.colSpan) : 12;
  const layoutBalanceWidthPx = Math.max(
    200,
    Math.round((layoutPanelWidthPx || 720) * (activeCardSpan / 12))
  );

  const activeCardRows = useMemo(() => {
    if (!activeCard) return [];
    return balanceConfiguredRows(resolveConfiguredCardRows(activeCard), {
      card: activeCard,
      fieldSizes: draftFieldSizes,
      fields,
      containerWidthPx: layoutBalanceWidthPx,
    });
  }, [activeCard, draftFieldSizes, fields, layoutBalanceWidthPx]);

  const draftLayoutFlat = useMemo(() => flattenLayoutFromCards(draftCardsByPanel), [draftCardsByPanel]);
  const usedFieldIds = useMemo(() => new Set(Object.values(draftLayoutFlat).flat()), [draftLayoutFlat]);
  const panelFieldIds = flattenRowsToFieldIds({ rows: activeCardRows });

  const ensureCardRows = (card) => {
    const rows = resolveConfiguredCardRows(card);
    return rows.length ? rows : [createEmptyLayoutRow(card?.id || "card")];
  };

  const getActiveCardColSpan = (card = activeCard) => resolveCardColSpan(card?.colSpan);

  const resolveTargetRowId = (rows, colSpan = getActiveCardColSpan()) => {
    if (selectedPanelFieldIds.length) {
      const hit = rows.find((row) => (row.fieldIds || []).includes(selectedPanelFieldIds[0]));
      if (hit?.id && rowHasRoomForField(hit, colSpan)) return hit.id;
    }
    const withRoom = rows.find((row) => rowHasRoomForField(row, colSpan));
    if (withRoom?.id) return withRoom.id;
    return rows[rows.length - 1]?.id || rows[0]?.id;
  };

  const placeFieldOnCardRows = (rows, fieldId, { preferredRowId = null, card = activeCard } = {}) => {
    const colSpan = getActiveCardColSpan(card);
    const { rows: nextRows, placed } = placeFieldInCardRows(rows, fieldId, {
      cardId: card?.id || "card",
      colSpan,
      preferredRowId,
    });
    if (!placed) {
      showWarning(
        `Linha cheia (máximo ${getMaxFieldsPerRow(colSpan)} campos neste card). Use outra linha ou crie uma nova.`
      );
      return rows;
    }
    return nextRows;
  };

  React.useEffect(() => {
    if (!activePanel) return;
    const cards = draftCardsByPanel[activePanel.id]?.cards || [];
    if (!cards.length) return;
    if (!cards.some((card) => card.id === activeCardId)) {
      setActiveCardId(cards[0].id);
    }
  }, [activePanel?.id, draftCardsByPanel, activeCardId]);

  const applyCardsState = (nextCardsByPanel) => {
    setDraftCardsByPanel(nextCardsByPanel);
  };

  const updateActiveCardRows = (rows) => {
    if (!activePanel || !activeCard) return;
    const colSpan = getActiveCardColSpan();
    const enforcedRows = enforceMaxFieldsPerCardRows(
      rows.map((row, index) => ({
        ...row,
        id: row.id || createRowId(activeCard.id, index + 1),
        order: index + 1,
        fieldIds: [...(row.fieldIds || [])],
      })),
      colSpan,
      activeCard.id,
      { keepEmptyRows: true }
    );
    const fieldIds = flattenRowsToFieldIds({ rows: enforcedRows });
    const normalizedRows = enforcedRows;
    const nextCardsByPanel = { ...draftCardsByPanel };
    const cards = (nextCardsByPanel[activePanel.id]?.cards || []).map((card) =>
      card.id === activeCard.id
        ? { ...card, rows: normalizedRows, fieldIds }
        : normalizeLayoutCardV3(card)
    );
    nextCardsByPanel[activePanel.id] = { cards };
    applyCardsState(nextCardsByPanel);
  };

  const updateActiveCardFieldIds = (fieldIds) => {
    const allowed = new Set(fieldIds);
    const rows = ensureCardRows(activeCard)
      .map((row) => ({
        ...row,
        fieldIds: (row.fieldIds || []).filter((id) => allowed.has(id)),
      }))
      .filter((row) => row.fieldIds.length);
    updateActiveCardRows(rows.length ? rows : [createEmptyLayoutRow(activeCard?.id || "card")]);
  };

  const moveFieldToCard = (fieldId, targetCardId) => {
    if (!activePanel || !fieldId || !targetCardId || !isEditing) return;
    let nextCardsByPanel = stripFieldFromAllCards(draftCardsByPanel, fieldId);
    const cards = (nextCardsByPanel[activePanel.id]?.cards || []).map((card) => {
      if (card.id !== targetCardId) return normalizeLayoutCardV3(card);
      let rows = removeFieldFromRows(ensureCardRows(card), fieldId);
      const targetRowId = rows[rows.length - 1]?.id || createEmptyLayoutRow(card.id).id;
      rows = placeFieldOnCardRows(rows, fieldId, { preferredRowId: targetRowId, card });
      return normalizeLayoutCardV3({ ...card, rows });
    });
    nextCardsByPanel[activePanel.id] = { cards };
    applyCardsState(nextCardsByPanel);
    setActiveCardId(targetCardId);
    setSelectedPanelFieldIds([fieldId]);
  };

  const toggleCardColSpan = (cardId) => {
    if (!activePanel || !isEditing) return;
    const nextCardsByPanel = { ...draftCardsByPanel };
    nextCardsByPanel[activePanel.id] = {
      cards: (nextCardsByPanel[activePanel.id]?.cards || []).map((card) =>
        card.id === cardId
          ? normalizeLayoutCardV3({ ...card, colSpan: Number(card.colSpan) <= 6 ? 12 : 6 })
          : card
      ),
    };
    applyCardsState(nextCardsByPanel);
  };
  const panelFields = panelFieldIds.map((id) => fields.find((field) => field.id === id)).filter(Boolean);
  const activePanelIsSystem = systemPanelIds.includes(activePanel?.id);
  const activePanelIsFixed = fixedPanelIds.includes(activePanel?.id);

  const getPanelLabelById = (panelId) => {
    if (!panelId) return "Sem painel";
    const panel =
      draftPanels.find((item) => item.id === panelId) ||
      defaultConfig?.panels?.find((item) => item.id === panelId);
    return formatPanelLabel(panel?.label || panelId);
  };

  const availableFields = useMemo(
    () =>
      fields
        .filter((field) => !usedFieldIds.has(field.id))
        .filter(
          (field) =>
            !search.trim() || String(field.label || "").toLowerCase().includes(search.trim().toLowerCase())
        ),
    [fields, usedFieldIds, search]
  );

  const usedFieldsInLayout = useMemo(() => {
    const items = [];
    draftPanels.forEach((panel) => {
      (draftLayoutFlat[panel.id] || []).forEach((fieldId) => {
        const field = fields.find((item) => item.id === fieldId);
        if (!field) return;
        items.push({
          field,
          panelId: panel.id,
          panelLabel: formatPanelLabel(panel.label || panel.id),
        });
      });
    });
    return items;
  }, [draftPanels, draftLayoutFlat, fields]);

  const filteredUsedFields = useMemo(
    () =>
      usedFieldsInLayout.filter(({ field, panelLabel }) => {
        if (!search.trim()) return true;
        const term = search.trim().toLowerCase();
        return (
          String(field.label || "").toLowerCase().includes(term) ||
          String(panelLabel || "").toLowerCase().includes(term)
        );
      }),
    [usedFieldsInLayout, search]
  );

  const buildCurrentConfig = () => ({
    panels: draftPanels,
    layout: buildLayoutV3FromCards(draftCardsByPanel),
    fieldSizes: draftFieldSizes,
    hiddenFieldIds: draftHiddenFieldIds,
    lockedFieldIds: draftLockedFieldIds,
    requiredFieldIds: draftRequiredFieldIds,
    clearOnDuplicateFieldIds: draftClearOnDuplicateFieldIds,
    fieldDefaultValues: draftFieldDefaultValues,
    aggregationConfig: draftAggregationConfig,
    visibilityRules: draftVisibilityRules,
  });

  const focusUsedField = ({ field, panelId }) => {
    setActivePanelId(panelId);
    setSelectedPanelFieldIds([field.id]);
    setSelectedAvailableIds([]);
  };

  const isFieldRequired = (field) => !!field?.required || draftRequiredFieldIds.includes(field?.id);
  const getAvailableFieldOriginLabel = (fieldId) =>
    getPanelLabelById(fieldLastPanelId[fieldId] || findDefaultPanelForField(fieldId, defaultFlatLayout));

  const showRequiredPopup = (message) => showWarning(message);
  const stripFieldFromAllCards = (cardsByPanel, fieldId) => {
    const next = { ...cardsByPanel };
    Object.keys(next).forEach((panelId) => {
      next[panelId] = {
        cards: (next[panelId]?.cards || []).map((card) => {
          const rows = removeFieldFromRows(ensureCardRows(card), fieldId);
          return normalizeLayoutCardV3({ ...card, rows });
        }),
      };
    });
    return next;
  };

  const addFieldById = (fieldId, targetRowId = null) => {
    if (!fieldId || !activePanel || !activeCard || !isEditing) return;
    const nextCardsByPanel = stripFieldFromAllCards(draftCardsByPanel, fieldId);
    const cards = (nextCardsByPanel[activePanel.id]?.cards || []).map((card) => {
      if (card.id !== activeCard.id) return normalizeLayoutCardV3(card);
      let rows = removeFieldFromRows(ensureCardRows(card), fieldId);
      const rowId = targetRowId || resolveTargetRowId(rows, getActiveCardColSpan(card));
      rows = placeFieldOnCardRows(rows, fieldId, { preferredRowId: rowId, card });
      return normalizeLayoutCardV3({ ...card, rows });
    });
    nextCardsByPanel[activePanel.id] = { cards };
    applyCardsState(nextCardsByPanel);
    setSelectedAvailableIds((prev) => prev.filter((id) => id !== fieldId));
    setSelectedPanelFieldIds([fieldId]);
  };
  const addAllFields = () => {
    if (!activePanel || !activeCard) return;
    const ids = availableFields.map((field) => field.id);
    const nextCardsByPanel = stripFieldFromAllCards(draftCardsByPanel, ids[0]);
    let stripped = nextCardsByPanel;
    ids.slice(1).forEach((fieldId) => {
      stripped = stripFieldFromAllCards(stripped, fieldId);
    });
    const cards = (stripped[activePanel.id]?.cards || []).map((card) => {
      if (card.id !== activeCard.id) return normalizeLayoutCardV3(card);
      let rows = ensureCardRows(card);
      ids.forEach((fieldId) => {
        rows = removeFieldFromRows(rows, fieldId);
        rows = placeFieldOnCardRows(rows, fieldId, {
          preferredRowId: resolveTargetRowId(rows, getActiveCardColSpan(card)),
          card,
        });
      });
      return normalizeLayoutCardV3({ ...card, rows });
    });
    applyCardsState({ ...stripped, [activePanel.id]: { cards } });
    setSelectedAvailableIds([]);
  };
  const removeFieldById = (fieldId) => {
    if (!fieldId || !activePanel || !activeCard || !isEditing) return;
    setFieldLastPanelId((prev) => ({ ...prev, [fieldId]: activePanel.id }));
    updateActiveCardFieldIds((panelFieldIds || []).filter((id) => id !== fieldId));
    setSelectedPanelFieldIds((prev) => prev.filter((id) => id !== fieldId));
  };
  const removeAllFields = () => {
    if (!activePanel || !activeCard) return;
    setFieldLastPanelId((prev) => {
      const next = { ...prev };
      (panelFieldIds || []).forEach((id) => {
        if (!fixedVisibleFieldIds.includes(id)) next[id] = activePanel.id;
      });
      return next;
    });
    updateActiveCardFieldIds((panelFieldIds || []).filter((id) => fixedVisibleFieldIds.includes(id)));
    setSelectedPanelFieldIds([]);
  };
  const createPanel = () => {
    const id = `painel_${Date.now()}`;
    const next = {
      id,
      label: `Painel Personalizado ${draftPanels.filter((panel) => !systemPanelIds.includes(panel.id)).length + 1}`,
    };
    setDraftPanels((prev) => [...prev, next]);
    applyCardsState({
      ...draftCardsByPanel,
      [id]: {
        cards: [
          normalizeLayoutCardV3({
            id: DEFAULT_VIRTUAL_CARD_ID,
            label: "Geral",
            order: 1,
            collapsible: true,
            columns: 12,
            rows: [createEmptyLayoutRow(DEFAULT_VIRTUAL_CARD_ID)],
            fieldIds: [],
          }),
        ],
      },
    });
    setActivePanelId(id);
    setActiveCardId(DEFAULT_VIRTUAL_CARD_ID);
    setEditingPanelId(id);
    setIsEditing(true);
  };
  const deletePanel = () => {
    if (!activePanel || activePanelIsSystem) return;
    setDraftPanels((prev) => prev.filter((panel) => panel.id !== activePanel.id));
    const nextCards = { ...draftCardsByPanel };
    delete nextCards[activePanel.id];
    applyCardsState(nextCards);
    const nextPanelId = draftPanels.find((panel) => panel.id !== activePanel.id)?.id || "";
    setActivePanelId(nextPanelId);
    setActiveCardId(nextCards[nextPanelId]?.cards?.[0]?.id || DEFAULT_VIRTUAL_CARD_ID);
  };
  const reorderField = (targetFieldId) => {
    if (!draggedFieldId || draggedFieldId === targetFieldId || !activePanel || !activeCard || !isEditing) {
      return;
    }
    const colSpan = getActiveCardColSpan();
    const rows = ensureCardRows(activeCard);
    const targetRow = rows.find((row) => (row.fieldIds || []).includes(targetFieldId));
    if (
      targetRow &&
      !(targetRow.fieldIds || []).includes(draggedFieldId) &&
      !rowHasRoomForField(targetRow, colSpan, draggedFieldId)
    ) {
      showWarning(
        `Esta linha já tem o máximo de ${getMaxFieldsPerRow(colSpan)} campos. Escolha outra linha ou crie uma nova.`
      );
      return;
    }
    const nextRows = reorderFieldWithinRows(rows, draggedFieldId, targetFieldId);
    updateActiveCardRows(
      nextRows.map((row, index) => ({
        ...row,
        id: row.id || createRowId(activeCard.id, index + 1),
        order: index + 1,
      }))
    );
  };

  const appendLayoutRow = () => {
    if (!activePanel || !activeCard || !isEditing) return;
    const rows = [...ensureCardRows(activeCard), createEmptyLayoutRow(activeCard.id, activeCardRows)];
    updateActiveCardRows(rows);
  };

  const removeLayoutRowById = (rowId) => {
    if (!activePanel || !activeCard || !isEditing) return;
    updateActiveCardRows(deleteLayoutRow(ensureCardRows(activeCard), rowId));
  };

  const moveFieldToLayoutRow = (fieldId, targetRowId) => {
    if (!fieldId || !targetRowId || !activePanel || !activeCard || !isEditing) return;
    const colSpan = getActiveCardColSpan(activeCard);
    const targetRow = ensureCardRows(activeCard).find((row) => row.id === targetRowId);
    const alreadyOnRow = (targetRow?.fieldIds || []).includes(fieldId);
    if (targetRow && !alreadyOnRow && !rowHasRoomForField(targetRow, colSpan, fieldId)) {
      showWarning(
        `Esta linha já tem o máximo de ${getMaxFieldsPerRow(colSpan)} campos. Escolha outra linha ou crie uma nova.`
      );
      return;
    }
    const nextCardsByPanel = stripFieldFromAllCards(draftCardsByPanel, fieldId);
    const cards = (nextCardsByPanel[activePanel.id]?.cards || []).map((card) => {
      if (card.id !== activeCard.id) return normalizeLayoutCardV3(card);
      let rows = removeFieldFromRows(ensureCardRows(card), fieldId);
      rows = placeFieldOnCardRows(rows, fieldId, {
        preferredRowId: targetRowId,
        card,
      });
      return normalizeLayoutCardV3({ ...card, rows });
    });
    nextCardsByPanel[activePanel.id] = { cards };
    applyCardsState(nextCardsByPanel);
    setSelectedPanelFieldIds([fieldId]);
  };

  const createCard = () => {
    if (!activePanel || !isEditing) return;
    const existing = draftCardsByPanel[activePanel.id]?.cards || [];
    const id = createNewCardId(activePanel.id, existing);
    const label = `Card ${existing.length + 1}`;
    const nextCardsByPanel = { ...draftCardsByPanel };
    nextCardsByPanel[activePanel.id] = {
      cards: [
        ...existing,
        normalizeLayoutCardV3({
          id,
          label,
          order: existing.length + 1,
          colSpan: 6,
          collapsible: true,
          columns: 12,
          rows: [createEmptyLayoutRow(id)],
          fieldIds: [],
        }),
      ],
    };
    applyCardsState(nextCardsByPanel);
    setActiveCardId(id);
    setEditingCardId(id);
  };

  const renameCard = (cardId, label) => {
    if (!activePanel) return;
    const nextCardsByPanel = { ...draftCardsByPanel };
    nextCardsByPanel[activePanel.id] = {
      cards: (nextCardsByPanel[activePanel.id]?.cards || []).map((card) =>
        card.id === cardId ? { ...card, label: formatPanelLabel(label) } : card
      ),
    };
    applyCardsState(nextCardsByPanel);
  };

  const deleteCard = (cardId) => {
    if (!activePanel || !isEditing) return;
    const existing = draftCardsByPanel[activePanel.id]?.cards || [];
    if (existing.length <= 1) return;
    const removed = existing.find((card) => card.id === cardId);
    let nextCards = existing.filter((card) => card.id !== cardId);
    if (removed && nextCards[0]) {
      let mergedRows = ensureCardRows(nextCards[0]);
      flattenRowsToFieldIds(removed).forEach((fieldId) => {
        mergedRows = placeFieldOnCardRows(mergedRows, fieldId, { card: nextCards[0] });
      });
      nextCards[0] = normalizeLayoutCardV3({ ...nextCards[0], rows: mergedRows });
    }
    const nextCardsByPanel = { ...draftCardsByPanel, [activePanel.id]: { cards: nextCards } };
    applyCardsState(nextCardsByPanel);
    setActiveCardId(nextCards[0]?.id || DEFAULT_VIRTUAL_CARD_ID);
  };

  const moveCard = (cardId, direction) => {
    if (!activePanel) return;
    const cards = [...(draftCardsByPanel[activePanel.id]?.cards || [])];
    const index = cards.findIndex((card) => card.id === cardId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= cards.length) return;
    const [moved] = cards.splice(index, 1);
    cards.splice(target, 0, moved);
    const normalized = cards.map((card, orderIndex) => ({ ...card, order: orderIndex + 1 }));
    applyCardsState({ ...draftCardsByPanel, [activePanel.id]: { cards: normalized } });
  };

  const setFieldWidthType = (fieldId, widthType) => {
    setDraftFieldSizes((prev) => {
      const next = { ...prev };
      if (!widthType) delete next[fieldId];
      else next[fieldId] = widthType;
      return next;
    });
  };
  const reorderPanel = (targetPanelId) => {
    if (
      !draggedPanelId ||
      draggedPanelId === targetPanelId ||
      fixedPanelIds.includes(draggedPanelId) ||
      fixedPanelIds.includes(targetPanelId)
    ) {
      return;
    }
    const next = [...draftPanels];
    const from = next.findIndex((panel) => panel.id === draggedPanelId);
    const to = next.findIndex((panel) => panel.id === targetPanelId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDraftPanels(next);
  };
  const toggleListValue = (setter, fieldId, checked) =>
    setter((prev) => (checked ? Array.from(new Set([...prev, fieldId])) : prev.filter((id) => id !== fieldId)));
  const setAggregationEnabled = (fieldId, enabled) =>
    setDraftAggregationConfig((prev) => {
      const next = { ...prev };
      if (!enabled) delete next[fieldId];
      else next[fieldId] = { enabled: true, type: prev[fieldId]?.type || "sum" };
      return next;
    });
  const setVisibilityRule = (fieldId, rule) =>
    setDraftVisibilityRules((prev) => {
      const next = { ...prev };
      if (!rule) delete next[fieldId];
      else next[fieldId] = rule;
      return next;
    });
  const handleSave = () => {
    onSave?.({
      panels: draftPanels,
      layout: buildLayoutV3FromCards(draftCardsByPanel),
      fieldSizes: draftFieldSizes,
      hiddenFieldIds: draftHiddenFieldIds,
      lockedFieldIds: draftLockedFieldIds,
      requiredFieldIds: draftRequiredFieldIds,
      clearOnDuplicateFieldIds: draftClearOnDuplicateFieldIds,
      fieldDefaultValues: draftFieldDefaultValues,
      aggregationConfig: draftAggregationConfig,
      visibilityRules: draftVisibilityRules,
    });
    setIsEditing(false);
    setEditingPanelId(null);
    setSelectedAvailableIds([]);
    setSelectedPanelFieldIds([]);
  };
  const restoreDefault = () => {
    if (!defaultConfig) return;
    const cards = initCardsByPanel({
      panels: defaultConfig.panels || [],
      layout: defaultConfig.layout || {},
      defaultLayout: defaultFlatLayout,
    });
    setDraftPanels(defaultConfig.panels || []);
    setDraftCardsByPanel(cards);
    setDraftFieldSizes(defaultConfig.fieldSizes || {});
    setActiveCardId(cards[defaultConfig.panels?.[0]?.id]?.cards?.[0]?.id || DEFAULT_VIRTUAL_CARD_ID);
    setDraftHiddenFieldIds([]);
    setDraftLockedFieldIds([]);
    setDraftRequiredFieldIds([]);
    setDraftClearOnDuplicateFieldIds([]);
    setDraftFieldDefaultValues({});
    setDraftAggregationConfig({});
    setDraftVisibilityRules({});
    setActivePanelId(defaultConfig.panels?.[0]?.id || "");
  };
  const discardChanges = () => {
    const cards = initCardsByPanel({ panels, layout, defaultLayout: defaultFlatLayout });
    setDraftPanels(panels);
    setDraftCardsByPanel(cards);
    setDraftFieldSizes(fieldSizes || {});
    setActiveCardId(cards[panels[0]?.id]?.cards?.[0]?.id || DEFAULT_VIRTUAL_CARD_ID);
    setDraftHiddenFieldIds(hiddenFieldIds);
    setDraftLockedFieldIds(lockedFieldIds);
    setDraftRequiredFieldIds(requiredFieldIds);
    setDraftClearOnDuplicateFieldIds(clearOnDuplicateFieldIds);
    setDraftFieldDefaultValues(fieldDefaultValues);
    setDraftAggregationConfig(aggregationConfig);
    setDraftVisibilityRules(visibilityRules);
    setIsEditing(false);
  };
  const openFieldSettings = (field, event) => {
    if (!isEditing) return;
    event?.stopPropagation?.();
    event?.preventDefault?.();
    const chip = event?.currentTarget?.closest?.(".emp-layout-config-field");
    const rect = chip?.getBoundingClientRect?.();
    if (!rect) return;
    setFieldSettingsTarget(field);
    setFieldSettingsAnchor(rect);
    if (usedFieldIds.has(field.id)) setSelectedPanelFieldIds([field.id]);
    else setSelectedAvailableIds([field.id]);
  };

  const closeFieldSettings = () => {
    setFieldSettingsTarget(null);
    setFieldSettingsAnchor(null);
  };

  React.useEffect(() => {
    if (!isEditing) closeFieldSettings();
  }, [isEditing]);

  const fieldItemClass = (field, selected, readOnly = false) => {
    const required = isFieldRequired(field);
    const toneClass = required
      ? "emp-layout-config-field-required"
      : "emp-layout-config-field-optional";
    return `emp-layout-config-field group relative flex items-center justify-between gap-2 overflow-hidden px-2.5 text-left transition-colors focus-visible:outline-none ${toneClass} ${
      selected ? "emp-layout-config-field-selected" : ""
    } ${readOnly ? "emp-layout-config-field-readonly" : ""}`;
  };

  const renderFieldStatusIcons = (field) => (
    <EmpLayoutFieldStatusIcons
      field={field}
      hiddenFieldIds={draftHiddenFieldIds}
      lockedFieldIds={draftLockedFieldIds}
      clearOnDuplicateFieldIds={draftClearOnDuplicateFieldIds}
      aggregationConfig={draftAggregationConfig}
    />
  );

  const renderFieldActions = ({ field, variant }) => {
    if (!isEditing) return null;

    const addAction = variant === "available";

    return (
      <span className="emp-layout-config-field-actions ml-1 flex shrink-0 items-center gap-1">
        {addAction ? (
          <button
            type="button"
            className="emp-layout-config-field-action"
            title="Adicionar ao painel"
            disabled={!activePanel}
            onClick={(event) => {
              event.stopPropagation();
              addFieldById(field.id);
            }}
          >
            <Reply className="h-3.5 w-3.5 stroke-white text-white" />
          </button>
        ) : (
          <>
            <button
              type="button"
              className="emp-layout-config-field-action"
              title="Remover do painel"
              disabled={fixedVisibleFieldIds.includes(field.id)}
              onClick={(event) => {
                event.stopPropagation();
                removeFieldById(field.id);
              }}
            >
              <X className="h-3.5 w-3.5 stroke-white text-white" />
            </button>
            <button
              type="button"
              className="emp-layout-config-field-action"
              title="Configurações do campo"
              onClick={(event) => openFieldSettings(field, event)}
            >
              <Settings className="h-3.5 w-3.5 stroke-white text-white" />
            </button>
          </>
        )}
      </span>
    );
  };

  const renderAvailableField = (field) => (
    <div
      key={field.id}
      role="button"
      tabIndex={0}
      aria-disabled={!isEditing}
      draggable={isEditing}
      onClick={(event) =>
        setSelectedAvailableIds((prev) =>
          event.ctrlKey || event.metaKey || event.shiftKey
            ? prev.includes(field.id)
              ? prev.filter((id) => id !== field.id)
              : [...prev, field.id]
            : [field.id]
        )
      }
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelectedAvailableIds([field.id]);
        }
      }}
      onDragStart={() => {
        setDraggedFieldId(field.id);
        setSelectedAvailableIds([field.id]);
      }}
      onDragEnd={() => setDraggedFieldId(null)}
      onDoubleClick={(event) => {
        if (isEditing) openFieldSettings(field, event);
      }}
      className={`${fieldItemClass(field, selectedAvailableIds.includes(field.id), !isEditing)} emp-layout-config-field-available w-full cursor-pointer`}
    >
      {isCustomField(field) && <EmpCustomMarker variant="white" />}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-white">{field.label}</div>
        <div className="truncate text-[10px] text-white/80">{getAvailableFieldOriginLabel(field.id)}</div>
      </div>
      {renderFieldStatusIcons(field)}
      {renderFieldActions({ field, variant: "available" })}
    </div>
  );

  const renderUsedField = ({ field, panelId, panelLabel }) => (
    <div
      key={`${panelId}:${field.id}`}
      role="button"
      tabIndex={0}
      onClick={() => focusUsedField({ field, panelId })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focusUsedField({ field, panelId });
        }
      }}
      onDoubleClick={(event) => {
        focusUsedField({ field, panelId });
        if (isEditing) openFieldSettings(field, event);
      }}
      className={`${fieldItemClass(field, activePanelId === panelId && selectedPanelFieldIds.includes(field.id), true)} emp-layout-config-field-in-use w-full cursor-pointer`}
    >
      {isCustomField(field) && <EmpCustomMarker variant="white" />}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-white">{field.label}</div>
        <div className="truncate text-[10px] text-white/80">Painel: {panelLabel}</div>
      </div>
      {renderFieldStatusIcons(field)}
    </div>
  );

  const getPanelFieldBalanceStyle = (fieldId, layoutRow) => {
    const balanced = layoutRow?.fieldBalance?.[fieldId];
    if (!balanced) return undefined;
    return {
      flex: balanced.flex,
      minWidth: balanced.minWidth ?? 0,
      maxWidth: balanced.maxWidth,
      width: "auto",
      overflow: "hidden",
    };
  };

  const renderPanelField = (field, layoutRow) => (
    <div
      key={field.id}
      role="button"
      tabIndex={0}
      aria-disabled={!isEditing}
      draggable={isEditing && !fixedVisibleFieldIds.includes(field.id)}
      onClick={(event) =>
        setSelectedPanelFieldIds((prev) =>
          event.ctrlKey || event.metaKey || event.shiftKey
            ? prev.includes(field.id)
              ? prev.filter((id) => id !== field.id)
              : [...prev, field.id]
            : [field.id]
        )
      }
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelectedPanelFieldIds([field.id]);
        }
      }}
      onDragStart={() => {
        setDraggedFieldId(field.id);
        setSelectedPanelFieldIds([field.id]);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (isEditing) event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        reorderField(field.id);
        setDraggedFieldId(null);
      }}
      onDragEnd={() => setDraggedFieldId(null)}
      style={getPanelFieldBalanceStyle(field.id, layoutRow)}
      className={`${fieldItemClass(field, selectedPanelFieldIds.includes(field.id), !isEditing)} emp-layout-config-field-panel emp-layout-config-field-panel-balanced min-w-0 cursor-pointer`}
    >
      {isCustomField(field) && <EmpCustomMarker variant="white" />}
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">{field.label}</span>
      {renderFieldStatusIcons(field)}
      {renderFieldActions({ field, variant: "panel" })}
    </div>
  );

  const content = (
    <div
      className={`cadastro-emp-scope emp-layout-configurator flex h-full w-full flex-col overflow-hidden${isEditing ? " emp-layout-config-editing" : ""}`}
      data-active-card-span={String(activeCardSpan)}
    >
      {!inline && (
        <DialogHeader className="sr-only">
          <DialogTitle>Configuração de layout do formulário</DialogTitle>
        </DialogHeader>
      )}

      <EmpSplitToolbarLayout
        className="flex-1"
        toolbar={
          <div className="emp-layout-config-toolbar emp-toolbar flex h-[35px] min-h-[35px] max-h-[35px] shrink-0 items-center gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap bg-white px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ToolbarBtn onClick={() => onOpenChange(false)} title="Voltar">
              <EmpToolbarIcon icon={ChevronLeft} nav />
            </ToolbarBtn>
            {!isEditing && (
              <ToolbarBtn onClick={() => setIsEditing(true)} className={LABELED_BTN_CLASS} title="Editar layout">
                <EmpToolbarIcon icon={Pencil} />
                <span>Editar</span>
              </ToolbarBtn>
            )}
            {isEditing && (
              <ToolbarBtn onClick={handleSave} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new`} title="Salvar">
                <EmpToolbarIcon icon={Check} />
                <span>Salvar</span>
              </ToolbarBtn>
            )}
            {isEditing && (
              <ToolbarBtn onClick={discardChanges} className={LABELED_BTN_CLASS} title="Cancelar alterações">
                <EmpToolbarIcon icon={X} />
                <span>Cancelar</span>
              </ToolbarBtn>
            )}
            <div className="ml-auto">
              {isEditing && (
                <ToolbarBtn onClick={restoreDefault} title="Restaurar padrão">
                  <EmpToolbarIcon icon={RotateCcw} />
                </ToolbarBtn>
              )}
            </div>
          </div>
        }
      >
        <div className="grid min-h-0 h-full flex-1 grid-cols-[280px_48px_minmax(0,1fr)]">
          <aside className="flex flex-col overflow-hidden border-r border-[#d6dce8] bg-white p-2">
            <div className="mb-2 flex gap-1">
              <button
                type="button"
                onClick={() => setSidebarMode("available")}
                className={`flex-1 rounded-[5px] px-2 py-1 text-xs font-medium ${
                  sidebarMode === "available"
                    ? "bg-[#eaf2ff] text-[#1a1f26]"
                    : "bg-white text-[#5b6b80] hover:bg-[#f8fafc]"
                }`}
              >
                Disponíveis
              </button>
              <button
                type="button"
                onClick={() => setSidebarMode("in_use")}
                className={`flex-1 rounded-[5px] px-2 py-1 text-xs font-medium ${
                  sidebarMode === "in_use"
                    ? "bg-[#eaf2ff] text-[#1a1f26]"
                    : "bg-white text-[#5b6b80] hover:bg-[#f8fafc]"
                }`}
              >
                Em uso ({usedFieldsInLayout.length})
              </button>
            </div>
            <div className="mb-2 text-sm font-semibold text-[#1a1f26]">
              {sidebarMode === "available" ? "Campos disponíveis" : "Campos em uso no layout"}
            </div>
            <div className={`${EMP_TOOLBAR_SEARCH_WRAP} mb-3 w-full`}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  sidebarMode === "available" ? "Procurar campo disponível" : "Procurar campo em uso"
                }
                className={`${EMP_TOOLBAR_SEARCH_INPUT} pr-7`}
              />
              <Search className="emp-toolbar-search-icon pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5b6b80]" />
            </div>
            <div
              className="emp-layout-config-available-list flex flex-1 flex-col gap-1 overflow-auto pr-1"
              onDragOver={(event) => event.preventDefault()}
            >
              {sidebarMode === "available" ? (
                availableFields.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">Solte aqui para remover do painel.</div>
                ) : (
                  availableFields.map(renderAvailableField)
                )
              ) : filteredUsedFields.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  {search.trim() ? "Nenhum campo em uso encontrado." : "Nenhum campo em uso no layout."}
                </div>
              ) : (
                filteredUsedFields.map(renderUsedField)
              )}
            </div>
          </aside>

          <section className="emp-layout-config-transfer flex flex-col items-center justify-center gap-2 border-r border-[#d6dce8] bg-[#f8fafc] px-1">
            <ToolbarBtn
              disabled={!isEditing || panelFieldIds.length === 0}
              onClick={removeAllFields}
              className="emp-layout-config-transfer-btn"
              title="Remover todos"
            >
              <EmpToolbarIcon icon={ChevronsLeft} nav />
            </ToolbarBtn>
            <ToolbarBtn
              disabled={!isEditing || availableFields.length === 0}
              onClick={addAllFields}
              className="emp-layout-config-transfer-btn"
              title="Adicionar todos"
            >
              <EmpToolbarIcon icon={ChevronsRight} nav />
            </ToolbarBtn>
          </section>

          <main
            className="emp-layout-config-main flex min-w-0 flex-col overflow-hidden bg-white"
            data-active-card-span={String(activeCardSpan)}
          >
            <div className="emp-layout-config-panel-shell flex min-h-0 flex-1 flex-col">
              <div className="emp-form-tabs emp-form-tabs-launch relative flex min-h-[34px] items-end justify-start pl-2 pr-2">
                <div className="emp-form-tab-nav-group emp-layout-config-panel-actions relative z-20 mr-1.5 flex h-[30px] shrink-0 items-center gap-1.5 self-center">
                  {isEditing && (
                    <ToolbarBtn onClick={createPanel} className="emp-toolbar-btn-new" title="Novo painel">
                      <EmpToolbarIcon icon={Plus} />
                    </ToolbarBtn>
                  )}
                  {isEditing && (
                    <ToolbarBtn
                      disabled={!activePanel || activePanelIsSystem || activePanelIsFixed}
                      onClick={deletePanel}
                      className="emp-toolbar-btn-delete"
                      title="Excluir painel"
                    >
                      <EmpToolbarIcon icon={Trash2} />
                    </ToolbarBtn>
                  )}
                </div>
                <div className="emp-form-tab-list flex min-h-[32px] min-w-0 flex-1 flex-wrap items-end gap-0">
                  {draftPanels.map((panel) => {
                    const active = activePanel?.id === panel.id;
                    return (
                      <button
                        key={panel.id}
                        type="button"
                        draggable={isEditing && !fixedPanelIds.includes(panel.id)}
                        onDragStart={() => {
                          setDraggedPanelId(panel.id);
                          setActivePanelId(panel.id);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          reorderPanel(panel.id);
                        }}
                        onDrop={() => setDraggedPanelId(null)}
                        onDragEnd={() => setDraggedPanelId(null)}
                        onClick={() => {
                          setActivePanelId(panel.id);
                          setSelectedPanelFieldIds([]);
                        }}
                        onDoubleClick={() => {
                          if (isEditing && !systemPanelIds.includes(panel.id)) {
                            setEditingPanelId(panel.id);
                          }
                        }}
                        className={`emp-form-tab relative min-w-max flex-none overflow-hidden whitespace-nowrap ${
                          active ? "emp-form-tab-active z-[15]" : "emp-form-tab-inactive z-[2]"
                        } ${panel.hidden ? "emp-form-tab-hidden-panel" : ""}`}
                      >
                        {isCustomPanelByIds(panel, systemPanelIds) && <EmpCustomMarker />}
                        {isEditing && editingPanelId === panel.id && !systemPanelIds.includes(panel.id) ? (
                          <Input
                            value={panel.label || ""}
                            autoFocus
                            onClick={(event) => event.stopPropagation()}
                            onBlur={() => setEditingPanelId(null)}
                            onChange={(event) =>
                              setDraftPanels((prev) =>
                                prev.map((item) =>
                                  item.id === panel.id
                                    ? { ...item, label: formatPanelLabel(event.target.value) }
                                    : item
                                )
                              )
                            }
                            className="h-6 w-40 border-0 bg-transparent p-0 text-xs font-semibold normal-case shadow-none focus-visible:ring-0"
                          />
                        ) : (
                          <span>{formatPanelLabel(panel.label)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="emp-layout-config-cards-bar">
                {isEditing && (
                  <ToolbarBtn onClick={createCard} className="emp-toolbar-btn-new h-7 px-2 text-[11px]" title="Novo card">
                    <EmpToolbarIcon icon={Plus} />
                    <span>Card</span>
                  </ToolbarBtn>
                )}
                {activePanelCards.map((card) => {
                  const active = card.id === activeCard?.id;
                  return (
                    <div key={card.id} className="inline-flex items-center gap-0.5">
                      {isEditing && editingCardId === card.id ? (
                        <Input
                          value={card.label || ""}
                          autoFocus
                          onBlur={() => setEditingCardId(null)}
                          onChange={(event) => renameCard(card.id, event.target.value)}
                          className="h-7 w-28 border-[#dce3eb] text-[11px]"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCardId(card.id);
                            setSelectedPanelFieldIds([]);
                          }}
                          onDoubleClick={() => isEditing && setEditingCardId(card.id)}
                          onDragOver={(event) => {
                            if (!draggedFieldId || !isEditing) return;
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggedFieldId) moveFieldToCard(draggedFieldId, card.id);
                            setDraggedFieldId(null);
                          }}
                          className={`emp-layout-config-card-tab ${active ? "emp-layout-config-card-tab-active" : ""}`}
                        >
                          {card.label}
                          <span className="ml-1 text-[9px] opacity-70">
                            {(Number(card.colSpan) || 12) <= 6 ? "½" : "⬛"}
                          </span>
                        </button>
                      )}
                      {isEditing && active && activePanelCards.length > 1 && (
                        <ToolbarBtn onClick={() => deleteCard(card.id)} className="h-6 w-6" title="Excluir card">
                          <EmpToolbarIcon icon={Trash2} />
                        </ToolbarBtn>
                      )}
                      {isEditing && active && (
                        <>
                          <ToolbarBtn
                            onClick={() => toggleCardColSpan(card.id)}
                            className="h-6 px-1.5 text-[9px]"
                            title={
                              CARD_COL_SPAN_OPTIONS.find((o) => o.value === (Number(card.colSpan) <= 6 ? 12 : 6))
                                ?.label || "Alternar largura do card"
                            }
                          >
                            {(Number(card.colSpan) || 12) <= 6 ? "½→⬛" : "⬛→½"}
                          </ToolbarBtn>
                          <ToolbarBtn onClick={() => moveCard(card.id, -1)} className="h-6 w-6" title="Mover card">
                            <EmpToolbarIcon icon={ChevronLeft} />
                          </ToolbarBtn>
                          <ToolbarBtn onClick={() => moveCard(card.id, 1)} className="h-6 w-6" title="Mover card">
                            <EmpToolbarIcon icon={ChevronRight} />
                          </ToolbarBtn>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                ref={layoutPanelRef}
                className="emp-form-section emp-form-section-panel emp-form-section-panel--corp emp-layout-config-panel-body min-h-0 flex-1 overflow-auto pl-2 pr-4"
              >
                <p className="mb-2 text-[10px] text-[#64748b]">
                  Aba → Card → Linha → Campo. Card inteiro: até <strong>6</strong> por linha; card meio (½): até{" "}
                  <strong>4</strong>. Os campos da mesma linha ficam lado a lado e o espaço é redistribuído
                  automaticamente (como no formulário).
                </p>
                {isEditing && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    <ToolbarBtn onClick={appendLayoutRow} className="h-7 px-2 text-[11px]" title="Nova linha">
                      <EmpToolbarIcon icon={Plus} />
                      <span>Linha</span>
                    </ToolbarBtn>
                  </div>
                )}
                <div className="emp-layout-config-rows flex min-h-[160px] flex-col gap-3 py-2">
                  {activeCardRows.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400">Card vazio. Arraste campos ou use os botões de transferência.</div>
                  ) : (
                    activeCardRows.map((layoutRow) => {
                      const rowFields = (layoutRow.fieldIds || [])
                        .map((id) => fields.find((field) => field.id === id))
                        .filter(Boolean);
                      const rowCount = (layoutRow.fieldIds || []).filter(Boolean).length;
                      const rowMax = getMaxFieldsPerRow(getActiveCardColSpan());
                      const rowFull = rowCount >= rowMax;
                      return (
                        <div
                          key={layoutRow.id}
                          className={cn(
                            "emp-layout-config-row rounded border bg-[#f8fafc] p-2",
                            rowFull ? "border-amber-400/80" : "border-[#dce3eb]"
                          )}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-[#64748b]">
                              Linha {layoutRow.order}
                              <span className={cn("ml-1 font-semibold", rowFull && "text-amber-700")}>
                                ({rowCount}/{rowMax})
                              </span>
                            </span>
                            {isEditing && activeCardRows.length > 1 && (
                              <ToolbarBtn
                                onClick={() => removeLayoutRowById(layoutRow.id)}
                                className="h-6 w-6"
                                title="Excluir linha"
                              >
                                <EmpToolbarIcon icon={Trash2} />
                              </ToolbarBtn>
                            )}
                          </div>
                          <div
                            className="emp-layout-config-panel-fields flex min-h-[48px] w-full min-w-0 flex-nowrap items-stretch gap-2"
                            data-row-max={rowMax}
                            onDragOver={(event) => {
                              if (!isEditing) return;
                              event.preventDefault();
                              const fieldId = draggedFieldId || selectedAvailableIds[0];
                              const canDrop =
                                !fieldId ||
                                rowHasRoomForField(layoutRow, getActiveCardColSpan(), fieldId);
                              event.dataTransfer.dropEffect = canDrop ? "move" : "none";
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              const fieldId = draggedFieldId || selectedAvailableIds[0];
                              if (fieldId) moveFieldToLayoutRow(fieldId, layoutRow.id);
                              setDraggedFieldId(null);
                            }}
                          >
                            {rowFields.length === 0 && isEditing ? (
                              <span className="flex min-h-[40px] flex-1 items-center justify-center rounded border border-dashed border-[#cfd8e3] px-2 text-[10px] text-[#94a3b8]">
                                Arraste campos para esta linha
                              </span>
                            ) : null}
                            {rowFields.map((field) => renderPanelField(field, layoutRow))}
                            {(layoutRow.fieldIds || [])
                              .filter((id) => id && !fields.find((f) => f.id === id))
                              .map((orphanId) => (
                                <div
                                  key={orphanId}
                                  className="emp-layout-config-field emp-layout-config-field-panel emp-layout-config-field-optional flex min-w-0 flex-1 items-center px-2 text-[10px] text-white opacity-80"
                                  title="Campo não encontrado no catálogo"
                                >
                                  {orphanId}
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {isEditing && selectedPanelFieldIds.length === 1 && (
                  <div className="emp-layout-config-footer mt-3 flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[11px] font-semibold text-[#5b6b80]">Tipo de largura:</span>
                    {FIELD_WIDTH_TYPE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFieldWidthType(selectedPanelFieldIds[0], value)}
                        className={`emp-layout-config-footer-btn h-6 px-2 text-[10px] font-semibold ${
                          draftFieldSizes[selectedPanelFieldIds[0]] === value
                            ? "text-[#4fafff] underline underline-offset-2"
                            : "text-[#64748b]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFieldWidthType(selectedPanelFieldIds[0], "")}
                      className="emp-layout-config-footer-btn h-6 px-2 text-[10px] font-semibold text-[#64748b]"
                    >
                      Padrão do tipo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </EmpSplitToolbarLayout>

      <EmpLayoutFieldSettingsPopover
        field={fieldSettingsTarget}
        anchorRect={fieldSettingsAnchor}
        open={!!fieldSettingsTarget}
        onClose={closeFieldSettings}
        isEditing={isEditing}
        isFieldRequired={isFieldRequired}
        fixedVisibleFieldIds={fixedVisibleFieldIds}
        draftHiddenFieldIds={draftHiddenFieldIds}
        draftLockedFieldIds={draftLockedFieldIds}
        draftClearOnDuplicateFieldIds={draftClearOnDuplicateFieldIds}
        draftRequiredFieldIds={draftRequiredFieldIds}
        draftFieldDefaultValues={draftFieldDefaultValues}
        draftAggregationConfig={draftAggregationConfig}
        draftVisibilityRules={draftVisibilityRules}
        fields={fields}
        onToggleHidden={(fieldId, checked) => toggleListValue(setDraftHiddenFieldIds, fieldId, checked)}
        onToggleLocked={(fieldId, checked) => toggleListValue(setDraftLockedFieldIds, fieldId, checked)}
        onToggleClearOnDuplicate={(fieldId, checked) => toggleListValue(setDraftClearOnDuplicateFieldIds, fieldId, checked)}
        onToggleRequired={(fieldId, checked) => {
          if (checked) {
            setDraftHiddenFieldIds((prev) => prev.filter((id) => id !== fieldId));
            setDraftLockedFieldIds((prev) => prev.filter((id) => id !== fieldId));
          }
          toggleListValue(setDraftRequiredFieldIds, fieldId, checked);
        }}
        onDefaultValueChange={(fieldId, value) =>
          setDraftFieldDefaultValues((prev) => {
            const next = { ...prev };
            if (value === "" || value === null || value === undefined) delete next[fieldId];
            else next[fieldId] = value;
            return next;
          })
        }
        onToggleAggregation={setAggregationEnabled}
        onAggregationTypeChange={(fieldId, value) =>
          setDraftAggregationConfig((prev) => ({
            ...prev,
            [fieldId]: { enabled: true, type: value },
          }))
        }
        onVisibilityRuleChange={setVisibilityRule}
      />

    </div>
  );

  if (inline) return open ? content : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !inset-0 !left-0 !top-0 !h-screen !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 !rounded-none !p-0 flex flex-col overflow-hidden">
        {content}
      </DialogContent>
    </Dialog>
  );
}
