import React, { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Plus,
  Reply,
  Search,
  Settings,
  SkipBack,
  SkipForward,
  Trash2,
  X,
} from "lucide-react";
import EmpLayoutFieldSettingsPopover from "@/framework/cadastro/layouts/EmpLayoutFieldSettingsPopover";
import EmpLayoutFieldStatusIcons from "@/framework/cadastro/layouts/EmpLayoutFieldStatusIcons";
import { showWarning } from "@/shared/feedback";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import { useContainerWidth } from "@/framework/cadastro-engine/render/useContainerWidth.js";
import { cn } from "@/shared/utils/utils";
import useMgSegSlider from "@/modules/empresas/layout/useMgSegSlider";
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
  resolveConfiguredCardRows,
  rowHasRoomForField,
  createRowId,
  insertFieldsIntoRowAtEdge,
  previewReorderRowAtTarget,
} from "@/framework/cadastro/layouts/empFormLayoutRows";
import {
  ensureCardRows as ensureCardRowsHelper,
  placeFieldsOnCard,
  previewSwapFieldWithTarget,
  stripFieldsFromAllCards,
  updateCardRowsOnly,
  previewMoveFieldsAtTarget,
  previewReorderCardsAtTarget,
  updatePanelCardsOnly,
} from "@/framework/cadastro/layouts/layoutConfiguratorMutations.js";
import {
  selectAvailableField,
  selectPanelField,
  resolveDragInsertEdge,
  resolveDragInsertEdgeVertical,
} from "@/framework/cadastro/layouts/layoutConfiguratorDrag.js";
import {
  cloneCardsByPanel,
  isDragLeaveWithinContainer,
} from "@/framework/cadastro/layouts/layoutConfiguratorDragSession.js";
import {
  getMaxFieldsPerRow,
  resolveCardColSpan,
} from "@/framework/cadastro/layouts/empFormFieldWidthPresets";

const DEFAULT_SYSTEM_PANEL_IDS = ["principais", "endereco", "observacoes", "campos_personalizados"];
const DEFAULT_FIXED_PANEL_IDS = [];
const DEFAULT_FIXED_VISIBLE_FIELD_IDS = [];

const LayoutToolbarBtn = ({ className = "", children, ...props }) => (
  <button type="button" className={`ios-btn tb-btn ${className}`} {...props}>
    {children}
  </button>
);

const LayoutIconBtn = ({ className = "", children, ...props }) => (
  <LayoutToolbarBtn className={`tb-btn-ghost tb-btn-icon ${className}`} {...props}>
    {children}
  </LayoutToolbarBtn>
);

const LayoutLabeledBtn = ({ className = "", children, ...props }) => (
  <LayoutToolbarBtn className={`tb-btn-ghost tb-btn-labeled ${className}`} {...props}>
    {children}
  </LayoutToolbarBtn>
);

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
  onLayoutToolbarBridge,
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
  const [isEditing, setIsEditing] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [draggedRowId, setDraggedRowId] = useState(null);
  const [draggedPanelId, setDraggedPanelId] = useState(null);
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverRowId, setDragOverRowId] = useState(null);
  const [dragOverCardId, setDragOverCardId] = useState(null);
  const [dragOverPanelId, setDragOverPanelId] = useState(null);
  const [editingPanelId, setEditingPanelId] = useState(null);
  const [fieldLastPanelId, setFieldLastPanelId] = useState({});
  const [fieldSettingsTarget, setFieldSettingsTarget] = useState(null);
  const [fieldSettingsAnchor, setFieldSettingsAnchor] = useState(null);
  const wasOpenRef = useRef(false);
  const suppressFieldClickRef = useRef(false);
  const dragFieldIdsRef = useRef([]);
  const lastFieldPreviewKeyRef = useRef("");
  const lastFieldHoverTargetRef = useRef("");
  const lastFieldDropTargetRef = useRef({ targetFieldId: null, edge: "before" });
  const fieldPreviewAppliedRef = useRef(false);
  const dragDropCommittedRef = useRef(false);
  const dragStartCardsByPanelRef = useRef(null);
  const finishFieldDragRef = useRef(() => {});
  const panelSegRef = useRef(null);
  const panelSliderRef = useRef(null);
  const cardSegRef = useRef(null);
  const cardSliderRef = useRef(null);
  const layoutToolbarHandlersRef = useRef({});

  const ensureTrailingDraftRow = (rows, cardId) => {
    if (!rows.length) return [createEmptyLayoutRow(cardId, [])];
    const last = rows[rows.length - 1];
    if ((last.fieldIds || []).length > 0) {
      return [...rows, createEmptyLayoutRow(cardId, rows)];
    }
    return rows;
  };

  const stripEmptyRowsFromCardsByPanel = (cardsByPanel) => {
    const next = { ...cardsByPanel };
    Object.keys(next).forEach((panelId) => {
      next[panelId] = {
        cards: (next[panelId]?.cards || []).map((card) => {
          const rows = resolveConfiguredCardRows(card).filter((row) => (row.fieldIds || []).length > 0);
          const fieldIds = flattenRowsToFieldIds({ rows });
          return normalizeLayoutCardV3({
            ...card,
            rows: rows.length ? rows : undefined,
            fieldIds,
          });
        }),
      };
    });
    return next;
  };

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

  useMgSegSlider(panelSegRef, panelSliderRef, ".seg-tab.active", [
    activePanelId,
    draftPanels,
    isEditing,
    editingPanelId,
  ]);

  useMgSegSlider(cardSegRef, cardSliderRef, ".seg-tab.active", [
    activeCardId,
    activePanelCards,
    isEditing,
    editingCardId,
  ]);

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

  const displayRows = useMemo(() => {
    if (isEditing) return activeCardRows;
    return activeCardRows.filter((row) => (row.fieldIds || []).length > 0);
  }, [activeCardRows, isEditing]);

  React.useEffect(() => {
    const dragging =
      !!draggedFieldId || !!draggedRowId || !!draggedPanelId || !!draggedCardId;
    if (!isEditing || !activeCard || !activePanel || dragging) return;
    const rows = ensureCardRows(activeCard);
    const ensured = ensureTrailingDraftRow(rows, activeCard.id);
    if (ensured.length !== rows.length) {
      updateActiveCardRows(ensured);
    }
  }, [
    isEditing,
    activeCard?.id,
    activePanel?.id,
    activeCardRows.length,
    draggedFieldId,
    draggedRowId,
    draggedPanelId,
    draggedCardId,
  ]);

  const draftLayoutFlat = useMemo(() => flattenLayoutFromCards(draftCardsByPanel), [draftCardsByPanel]);
  const usedFieldIds = useMemo(() => new Set(Object.values(draftLayoutFlat).flat()), [draftLayoutFlat]);
  const panelFieldIds = flattenRowsToFieldIds({ rows: activeCardRows });

  const fieldSelectionSetters = {
    setSelectedAvailableIds,
    setSelectedPanelFieldIds,
  };

  const ensureCardRows = (card) => ensureCardRowsHelper(card);

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
    let enforcedRows = enforceMaxFieldsPerCardRows(
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
    if (isEditing) {
      enforcedRows = ensureTrailingDraftRow(enforcedRows, activeCard.id);
    }
    const fieldIds = flattenRowsToFieldIds({ rows: enforcedRows });
    const normalizedRows = enforcedRows;
    const nextCardsByPanel = updateCardRowsOnly({
      cardsByPanel: draftCardsByPanel,
      panelId: activePanel.id,
      cardId: activeCard.id,
      rows: normalizedRows,
      fieldIds,
    });
    applyCardsState(nextCardsByPanel);
  };

  const updateActiveCardFieldIds = (fieldIds) => {
    const allowed = new Set(fieldIds);
    const rows = ensureCardRows(activeCard).map((row) => ({
      ...row,
      fieldIds: (row.fieldIds || []).filter((id) => allowed.has(id)),
    }));
    updateActiveCardRows(rows.length ? rows : [createEmptyLayoutRow(activeCard?.id || "card")]);
  };

  const moveFieldToCard = (fieldId, targetCardId) => {
    moveFieldsToCard([fieldId], targetCardId);
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

  const isFieldRequired = (field) => !!field?.required || draftRequiredFieldIds.includes(field?.id);
  const getAvailableFieldOriginLabel = (fieldId) =>
    getPanelLabelById(fieldLastPanelId[fieldId] || findDefaultPanelForField(fieldId, defaultFlatLayout));

  const resolveTargetCardIdForPanel = (panelId, preferredCardId = null) => {
    if (panelId === activePanelId) return preferredCardId || activeCardId;
    const cards = draftCardsByPanel[panelId]?.cards || [];
    if (preferredCardId && cards.some((card) => card.id === preferredCardId)) return preferredCardId;
    return cards[0]?.id || DEFAULT_VIRTUAL_CARD_ID;
  };

  const showRequiredPopup = (message) => showWarning(message);
  const clearSelections = () => {
    suppressFieldClickRef.current = false;
    setSelectedAvailableIds([]);
    setSelectedPanelFieldIds([]);
  };

  const markFieldDragCommitted = () => {
    dragDropCommittedRef.current = true;
  };

  const startFieldDrag = ({ fieldId, from, fieldIds }) => {
    dragStartCardsByPanelRef.current = cloneCardsByPanel(draftCardsByPanel);
    dragDropCommittedRef.current = false;
    dragFieldIdsRef.current = fieldIds;
    lastFieldPreviewKeyRef.current = "";
    lastFieldHoverTargetRef.current = "";
    lastFieldDropTargetRef.current = { targetFieldId: null, edge: "before", targetRowId: null };
    fieldPreviewAppliedRef.current = false;
    setDraggedFrom(from);
    setDraggedFieldId(fieldId);
  };

  const finishFieldDrag = () => {
    if (!dragDropCommittedRef.current && dragStartCardsByPanelRef.current) {
      setDraftCardsByPanel(dragStartCardsByPanelRef.current);
    }
    dragStartCardsByPanelRef.current = null;
    dragDropCommittedRef.current = false;

    suppressFieldClickRef.current = true;
    window.setTimeout(() => {
      suppressFieldClickRef.current = false;
    }, 50);
    dragFieldIdsRef.current = [];
    lastFieldPreviewKeyRef.current = "";
    lastFieldHoverTargetRef.current = "";
    lastFieldDropTargetRef.current = { targetFieldId: null, edge: "before", targetRowId: null };
    fieldPreviewAppliedRef.current = false;
    setDraggedFieldId(null);
    setDraggedFrom(null);
    setDragOverRowId(null);
    setDragOverCardId(null);
    setDragOverPanelId(null);
    setSelectedAvailableIds([]);
    setSelectedPanelFieldIds([]);
  };

  finishFieldDragRef.current = finishFieldDrag;

  React.useEffect(() => {
    if (!open || !isEditing) return undefined;

    const handleWindowDragEnd = () => {
      if (dragFieldIdsRef.current.length) {
        finishFieldDragRef.current();
      }
    };

    window.addEventListener("dragend", handleWindowDragEnd);
    return () => window.removeEventListener("dragend", handleWindowDragEnd);
  }, [open, isEditing]);

  const isDragging =
    !!draggedFieldId || !!draggedRowId || !!draggedPanelId || !!draggedCardId;

  const finishRowDrag = () => {
    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  const applyCardRows = (nextRows) => {
    updateActiveCardRows(
      nextRows.map((row, index) => ({
        ...row,
        id: row.id || createRowId(activeCard.id, index + 1),
        order: index + 1,
      }))
    );
  };

  const findFieldRowId = (rows, fieldId) =>
    rows.find((row) => (row.fieldIds || []).includes(fieldId))?.id || null;

  const trackFieldDropTarget = (targetFieldId, edge = "before") => {
    lastFieldDropTargetRef.current = { targetFieldId, edge, targetRowId: null };
  };

  const trackRowDropTarget = (targetRowId, edge = "after") => {
    lastFieldDropTargetRef.current = { targetFieldId: null, targetRowId, edge };
  };

  const trackFieldDropPreview = (targetFieldId, edge = "auto") => {
    if (!isEditing || !draggedFieldId || draggedRowId || !targetFieldId) return;
    const ids = resolveDragFieldIds();
    if (!ids.length || ids.includes(targetFieldId)) return;
    trackFieldDropTarget(targetFieldId, edge);
  };

  const previewReorderRowAt = (targetRowId, edge = "auto") => {
    if (!draggedRowId || !targetRowId || !activePanel || !activeCard || !isEditing) return;
    const rows = ensureCardRows(activeCard);
    const nextRows = previewReorderRowAtTarget(rows, draggedRowId, targetRowId, edge);
    if (!nextRows) return;
    applyCardRows(nextRows);
  };

  const previewReorderPanelAt = (targetPanelId, edge = "auto") => {
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
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = next.splice(from, 1);
    let insertAt = to;
    if (edge === "before") {
      insertAt = next.findIndex((panel) => panel.id === targetPanelId);
    } else if (edge === "after") {
      insertAt = next.findIndex((panel) => panel.id === targetPanelId) + 1;
    }
    if (insertAt < 0) return;
    next.splice(insertAt, 0, moved);
    setDraftPanels(next);
  };

  const previewReorderCardAt = (targetCardId, edge = "auto") => {
    if (!draggedCardId || !targetCardId || !activePanel || !isEditing) return;
    const cards = activePanelCards;
    const nextCards = previewReorderCardsAtTarget(cards, draggedCardId, targetCardId, edge);
    if (!nextCards) return;
    applyCardsState(updatePanelCardsOnly({ cardsByPanel: draftCardsByPanel, panelId: activePanel.id, cards: nextCards }));
  };

  const canInsertFieldsIntoRow = (rows, rowId, fieldIds, colSpan) => {
    const row = rows.find((item) => item.id === rowId);
    if (!row) return false;
    const max = getMaxFieldsPerRow(colSpan);
    const incoming = fieldIds.filter((id) => !(row.fieldIds || []).includes(id)).length;
    const remaining = (row.fieldIds || []).filter((id) => !fieldIds.includes(id)).length;
    return remaining + incoming <= max;
  };

  const canDropFieldsAtTarget = ({
    targetPanelId = activePanelId,
    targetCardId = activeCardId,
    targetRowId = null,
    targetFieldId = null,
    showWarningOnFail = false,
    cardsByPanel = draftCardsByPanel,
    fieldIds = null,
  } = {}) => {
    const ids = fieldIds || resolveDragFieldIds();
    if (!ids.length) return true;

    if (!targetRowId && !targetFieldId) return true;

    const panelCards = cardsByPanel[targetPanelId]?.cards || [];
    const targetCard = panelCards.find((card) => card.id === targetCardId);
    if (!targetCard) return true;

    const rows = ensureCardRows(targetCard);
    const row =
      targetRowId
        ? rows.find((item) => item.id === targetRowId)
        : rows.find((item) => (item.fieldIds || []).includes(targetFieldId));
    if (!row) return true;

    const colSpan = resolveCardColSpan(targetCard.colSpan);
    if (targetFieldId && ids.every((id) => (row.fieldIds || []).includes(id))) {
      return true;
    }
    const canInsert = canInsertFieldsIntoRow(rows, row.id, ids, colSpan);
    const draggedFieldRowId = ids.length === 1 ? findFieldRowId(rows, ids[0]) : null;
    const canSwapSingleLayoutField =
      !!targetFieldId &&
      ids.length === 1 &&
      draggedFrom === "panel" &&
      usedFieldIds.has(ids[0]) &&
      draggedFieldRowId === row.id;
    if (!canInsert && canSwapSingleLayoutField) return true;
    if (!canInsert && showWarningOnFail) {
      showRequiredPopup(
        `Não foi possível mover os campos selecionados. Esta linha aceita no máximo ${getMaxFieldsPerRow(colSpan)} campos. Nenhum campo foi movido.`
      );
    }
    return canInsert;
  };

  const areFieldsInTargetRow = (cardsByPanel, panelId, cardId, rowId, fieldIds) => {
    const card = (cardsByPanel[panelId]?.cards || []).find((item) => item.id === cardId);
    const row = ensureCardRows(card).find((item) => item.id === rowId);
    if (!row) return false;
    const rowFieldIds = row.fieldIds || [];
    return fieldIds.every((id) => rowFieldIds.includes(id));
  };

  const commitFieldDropOnField = (targetFieldId) => {
    const ids = resolveDragFieldIds();
    if (!isEditing || !draggedFieldId || !targetFieldId || ids.length !== 1) return false;
    if (draggedFrom !== "panel" || !usedFieldIds.has(ids[0])) return false;

    let committed = false;
    setDraftCardsByPanel((currentCardsByPanel) => {
      const card = (currentCardsByPanel[activePanelId]?.cards || []).find(
        (item) => item.id === activeCardId
      );
      const rows = ensureCardRows(card);
      const targetRow = rows.find((row) => (row.fieldIds || []).includes(targetFieldId));
      if (!targetRow) return currentCardsByPanel;

      const sourceRowId = findFieldRowId(rows, ids[0]);
      if (!sourceRowId || sourceRowId !== targetRow.id) return currentCardsByPanel;

      const colSpan = resolveCardColSpan(card?.colSpan);
      if (canInsertFieldsIntoRow(rows, targetRow.id, ids, colSpan)) return currentCardsByPanel;

      const swappedCardsByPanel = previewSwapFieldWithTarget({
        cardsByPanel: currentCardsByPanel,
        draggedFieldId: ids[0],
        targetFieldId,
        targetPanelId: activePanelId,
        targetCardId: activeCardId,
      });
      if (!swappedCardsByPanel) return currentCardsByPanel;
      committed = true;
      fieldPreviewAppliedRef.current = true;
      return swappedCardsByPanel;
    });
    return committed;
  };

  const commitMoveFieldsToRow = (targetRowId, edge = "after") => {
    const ids = resolveDragFieldIds();
    if (!isEditing || !activePanel || !activeCard || !targetRowId || !ids.length) return false;

    let committed = false;
    setDraftCardsByPanel((currentCardsByPanel) => {
      const canDrop = canDropFieldsAtTarget({
        targetPanelId: activePanelId,
        targetCardId: activeCardId,
        targetRowId,
        showWarningOnFail: true,
        cardsByPanel: currentCardsByPanel,
        fieldIds: ids,
      });
      if (!canDrop) return currentCardsByPanel;

      const card = (currentCardsByPanel[activePanelId]?.cards || []).find(
        (item) => item.id === activeCardId
      );
      const nextCardsByPanel = previewMoveFieldsAtTarget({
        cardsByPanel: currentCardsByPanel,
        panelId: activePanelId,
        cardId: activeCardId,
        fieldIds: ids,
        card: card || activeCard,
        targetRowId,
        edge,
      });
      if (!nextCardsByPanel) return currentCardsByPanel;

      committed = true;
      fieldPreviewAppliedRef.current = true;
      return nextCardsByPanel;
    });
    return committed;
  };

  const commitMoveFieldsToField = (targetFieldId, edge = "auto") => {
    const ids = resolveDragFieldIds();
    if (!isEditing || !activePanel || !activeCard || !targetFieldId || !ids.length) return false;

    let committed = false;
    setDraftCardsByPanel((currentCardsByPanel) => {
      const canDrop = canDropFieldsAtTarget({
        targetPanelId: activePanelId,
        targetCardId: activeCardId,
        targetFieldId,
        showWarningOnFail: false,
        cardsByPanel: currentCardsByPanel,
        fieldIds: ids,
      });
      if (!canDrop) return currentCardsByPanel;

      const card = (currentCardsByPanel[activePanelId]?.cards || []).find(
        (item) => item.id === activeCardId
      );
      const nextCardsByPanel = previewMoveFieldsAtTarget({
        cardsByPanel: currentCardsByPanel,
        panelId: activePanelId,
        cardId: activeCardId,
        fieldIds: ids,
        card: card || activeCard,
        targetFieldId,
        edge,
      });
      if (!nextCardsByPanel) {
        committed = true;
        return currentCardsByPanel;
      }

      committed = true;
      fieldPreviewAppliedRef.current = true;
      return nextCardsByPanel;
    });
    return committed;
  };

  const resolveDragFieldIds = () => {
    if (!draggedFieldId) return [];
    if (dragFieldIdsRef.current.length) return [...dragFieldIdsRef.current];
    if (draggedFrom === "available" && selectedAvailableIds.includes(draggedFieldId)) {
      return [...selectedAvailableIds];
    }
    if (draggedFrom === "panel" && selectedPanelFieldIds.includes(draggedFieldId)) {
      return [...selectedPanelFieldIds];
    }
    return [draggedFieldId];
  };

  const removeFieldsByIds = (fieldIds) => {
    const ids = (fieldIds || []).filter(Boolean);
    if (!ids.length || !activePanel || !activeCard || !isEditing) return;
    setFieldLastPanelId((prev) => {
      const next = { ...prev };
      ids.forEach((fieldId) => {
        if (!fixedVisibleFieldIds.includes(fieldId)) next[fieldId] = activePanel.id;
      });
      return next;
    });
    const allowed = new Set(
      (panelFieldIds || []).filter(
        (id) => fixedVisibleFieldIds.includes(id) || !ids.includes(id)
      )
    );
    updateActiveCardFieldIds([...allowed]);
    setSelectedPanelFieldIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const dropFieldsToAvailable = () => {
    if (!isEditing || draggedFrom !== "panel") return;
    markFieldDragCommitted();
    removeFieldsByIds(resolveDragFieldIds());
    finishFieldDrag();
  };

  const moveFieldsToPanel = (fieldIds, targetPanelId, targetCardId = null) => {
    const ids = (fieldIds || []).filter(Boolean);
    if (!ids.length || !targetPanelId || !isEditing) return;

    let nextCardsByPanel = stripFieldsFromAllCards(draftCardsByPanel, ids);
    const panelCards = nextCardsByPanel[targetPanelId]?.cards || [];
    const targetCard =
      panelCards.find((card) => card.id === targetCardId) || panelCards[0];
    if (!targetCard) return;

    nextCardsByPanel = placeFieldsOnCard({
      cardsByPanel: nextCardsByPanel,
      panelId: targetPanelId,
      cardId: targetCard.id,
      fieldIds: ids,
      card: targetCard,
    });

    applyCardsState(nextCardsByPanel);
    setActivePanelId(targetPanelId);
    setActiveCardId(targetCard.id);
    setSelectedPanelFieldIds(ids);
    setSelectedAvailableIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const moveFieldsToCard = (fieldIds, targetCardId, preferredRowId = null) => {
    if (!activePanel || !targetCardId || !isEditing) return;
    const ids = (fieldIds || []).filter(Boolean);
    if (!ids.length) return;
    const targetCard = (draftCardsByPanel[activePanel.id]?.cards || []).find(
      (card) => card.id === targetCardId
    );
    if (!targetCard) return;

    const nextCardsByPanel = placeFieldsOnCard({
      cardsByPanel: draftCardsByPanel,
      panelId: activePanel.id,
      cardId: targetCardId,
      fieldIds: ids,
      card: targetCard,
      preferredRowId,
    });

    applyCardsState(nextCardsByPanel);
    setActiveCardId(targetCardId);
    setSelectedPanelFieldIds(ids);
    setSelectedAvailableIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const addFieldsByIds = (fieldIds, targetRowId = null) => {
    moveFieldsToCard(fieldIds, activeCard?.id, targetRowId);
  };

  const addFieldById = (fieldId, targetRowId = null) => {
    addFieldsByIds([fieldId], targetRowId);
  };
  const addAllFields = () => {
    if (!activePanel || !activeCard || !isEditing) return;
    addFieldsByIds(availableFields.map((field) => field.id));
  };
  const removeFieldById = (fieldId) => {
    removeFieldsByIds([fieldId]);
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

  const removeLayoutRowById = (rowId) => {
    if (!activePanel || !activeCard || !isEditing) return;
    const rows = ensureCardRows(activeCard);
    const nextRows = deleteLayoutRow(rows, rowId);
    updateActiveCardRows(
      nextRows.length ? nextRows : [createEmptyLayoutRow(activeCard.id)]
    );
  };

  const handleDraftAddRow = () => {
    if (!activePanel || !activeCard || !isEditing) return;
    const rows = ensureCardRows(activeCard);
    const lastIndex = rows.length - 1;
    const last = rows[lastIndex];
    const isLastDraft = !(last?.fieldIds || []).length;

    if (isLastDraft && lastIndex >= 0) {
      const beforeDraft = rows.slice(0, lastIndex);
      const newRow = createEmptyLayoutRow(activeCard.id, rows);
      updateActiveCardRows([...beforeDraft, newRow, last]);
      return;
    }

    updateActiveCardRows(ensureTrailingDraftRow(rows, activeCard.id));
  };

  const commitDropOnDraftRow = () => {
    const ids = resolveDragFieldIds();
    if (!isEditing || !activePanel || !activeCard || !ids.length) return false;

    const rows = ensureCardRows(activeCard);
    const lastIndex = rows.length - 1;
    const last = rows[lastIndex];
    if (lastIndex < 0 || (last?.fieldIds || []).length > 0) return false;

    const beforeDraft = rows.slice(0, lastIndex);
    const newRow = createEmptyLayoutRow(activeCard.id, rows);
    const colSpan = getActiveCardColSpan();

    if (!canInsertFieldsIntoRow([newRow], newRow.id, ids, colSpan)) {
      showRequiredPopup(
        `Não foi possível mover os campos selecionados. Esta linha aceita no máximo ${getMaxFieldsPerRow(colSpan)} campos. Nenhum campo foi movido.`
      );
      return false;
    }

    const nextRows = insertFieldsIntoRowAtEdge([...beforeDraft, newRow, last], ids, newRow.id, "after");
    markFieldDragCommitted();
    updateActiveCardRows(nextRows);
    return true;
  };

  const moveFieldToLayoutRow = (targetRowId) => {
    const ids = resolveDragFieldIds();
    if (!ids.length || !activeCard?.id) return;

    const colSpan = getActiveCardColSpan();
    const rows = ensureCardRows(activeCard);
    if (!canInsertFieldsIntoRow(rows, targetRowId, ids, colSpan)) {
      showWarning(
        `Esta linha já tem o máximo de ${getMaxFieldsPerRow(colSpan)} campos. Escolha outra linha ou crie uma nova.`
      );
      return;
    }

    const nextRows = insertFieldsIntoRowAtEdge(rows, ids, targetRowId, "after");
    applyCardRows(nextRows);
    markFieldDragCommitted();
    finishFieldDrag();
  };

  const reorderLayoutRowById = (targetRowId) => {
    previewReorderRowAt(targetRowId);
    finishRowDrag();
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
    setSelectedPanelFieldIds([]);
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
    const nextCards = existing.filter((card) => card.id !== cardId);
    const nextCardsByPanel = { ...draftCardsByPanel, [activePanel.id]: { cards: nextCards } };
    applyCardsState(nextCardsByPanel);
    setActiveCardId(nextCards[0]?.id || DEFAULT_VIRTUAL_CARD_ID);
    setSelectedPanelFieldIds([]);
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
    const cleanedCardsByPanel = stripEmptyRowsFromCardsByPanel(draftCardsByPanel);
    onSave?.({
      panels: draftPanels,
      layout: buildLayoutV3FromCards(cleanedCardsByPanel),
      fieldSizes: draftFieldSizes,
      hiddenFieldIds: draftHiddenFieldIds,
      lockedFieldIds: draftLockedFieldIds,
      requiredFieldIds: draftRequiredFieldIds,
      clearOnDuplicateFieldIds: draftClearOnDuplicateFieldIds,
      fieldDefaultValues: draftFieldDefaultValues,
      aggregationConfig: draftAggregationConfig,
      visibilityRules: draftVisibilityRules,
    });
    setDraftCardsByPanel(cleanedCardsByPanel);
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

  React.useEffect(() => {
    if (!isEditing) clearSelections();
  }, [isEditing]);

  React.useEffect(() => {
    layoutToolbarHandlersRef.current = {
      onOpenChange,
      handleSave,
      discardChanges,
      restoreDefault,
    };
  });

  React.useEffect(() => {
    if (!open) {
      onLayoutToolbarBridge?.(null);
      return undefined;
    }

    onLayoutToolbarBridge?.({
      isEditing,
      onBack: () => layoutToolbarHandlersRef.current.onOpenChange(false),
      onEdit: () => setIsEditing(true),
      onSave: () => layoutToolbarHandlersRef.current.handleSave(),
      onCancel: () => layoutToolbarHandlersRef.current.discardChanges(),
      onRestore: () => layoutToolbarHandlersRef.current.restoreDefault(),
    });

    return () => onLayoutToolbarBridge?.(null);
  }, [open, isEditing, onLayoutToolbarBridge]);

  const fieldItemClass = (field, selected, readOnly = false, variant = "panel") => {
    const required = isFieldRequired(field);
    const toneClass =
      variant === "sidebar"
        ? "emp-layout-config-field-chip"
        : required
          ? "emp-layout-config-field-required"
          : "emp-layout-config-field-optional";
    return `emp-layout-config-field group relative flex items-center justify-between gap-2 overflow-hidden text-left transition-colors focus-visible:outline-none ${toneClass} ${
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
      onClick={(event) => {
        if (!isEditing) return;
        if (suppressFieldClickRef.current) {
          suppressFieldClickRef.current = false;
          return;
        }
        selectAvailableField(field.id, event, fieldSelectionSetters);
      }}
      onKeyDown={(event) => {
        if (!isEditing) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelectedAvailableIds([field.id]);
        }
      }}
      onDragStart={() => {
        const ids = selectedAvailableIds.includes(field.id)
          ? [...selectedAvailableIds]
          : [field.id];
        startFieldDrag({ fieldId: field.id, from: "available", fieldIds: ids });
        setSelectedAvailableIds(ids);
        setSelectedPanelFieldIds([]);
      }}
      onDragEnd={finishFieldDrag}
      onDoubleClick={(event) => {
        if (isEditing) openFieldSettings(field, event);
      }}
      className={`${fieldItemClass(field, selectedAvailableIds.includes(field.id), !isEditing, "sidebar")} emp-layout-config-field-available emp-layout-config-field-transition w-full cursor-pointer${draggedFieldId === field.id ? " emp-layout-config-field--dragging" : ""}`}
    >
      {isCustomField(field) && <EmpCustomMarker />}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold">{field.label}</div>
        <div className="truncate text-[10px]" style={{ color: "var(--text-3)" }}>
          {getAvailableFieldOriginLabel(field.id)}
        </div>
      </div>
      {renderFieldStatusIcons(field)}
      {renderFieldActions({ field, variant: "available" })}
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

  const renderPanelField = (field, layoutRow) => {
    const isDragging = draggedFieldId === field.id;

    return (
      <div
        key={field.id}
        className="emp-layout-config-field-slot relative min-w-0 emp-layout-config-field-transition"
        style={getPanelFieldBalanceStyle(field.id, layoutRow)}
      >
        <div
          role="button"
          tabIndex={0}
          aria-disabled={!isEditing}
          draggable={isEditing && !fixedVisibleFieldIds.includes(field.id)}
          onClick={(event) => {
            if (!isEditing) return;
            if (suppressFieldClickRef.current) {
              suppressFieldClickRef.current = false;
              return;
            }
            selectPanelField(field.id, event, fieldSelectionSetters);
          }}
          onKeyDown={(event) => {
            if (!isEditing) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setSelectedPanelFieldIds([field.id]);
              setSelectedAvailableIds([]);
            }
          }}
          onDragStart={() => {
            if (fixedVisibleFieldIds.includes(field.id)) return;
            const ids = selectedPanelFieldIds.includes(field.id)
              ? [...selectedPanelFieldIds]
              : [field.id];
            startFieldDrag({ fieldId: field.id, from: "panel", fieldIds: ids });
            setSelectedPanelFieldIds(ids);
            setSelectedAvailableIds([]);
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            trackFieldDropPreview(field.id, resolveDragInsertEdge(event));
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditing || !draggedFieldId || draggedRowId) return;
            const edge = resolveDragInsertEdge(event);
            trackFieldDropTarget(field.id, edge);
            const canDrop = canDropFieldsAtTarget({
              targetPanelId: activePanelId,
              targetCardId: activeCardId,
              targetFieldId: field.id,
              showWarningOnFail: false,
            });
            event.dataTransfer.dropEffect = canDrop ? "move" : "none";
          }}
          onDragLeave={() => {}}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const ids = resolveDragFieldIds();
            const canDrop = canDropFieldsAtTarget({
              targetPanelId: activePanelId,
              targetCardId: activeCardId,
              targetFieldId: field.id,
              showWarningOnFail: true,
              fieldIds: ids,
            });
            if (canDrop) {
              markFieldDragCommitted();
              const edge = resolveDragInsertEdge(event);
              if (!commitFieldDropOnField(field.id)) {
                commitMoveFieldsToField(field.id, edge);
              }
            }
            finishFieldDrag();
          }}
          onDragEnd={finishFieldDrag}
          className={cn(
            fieldItemClass(field, selectedPanelFieldIds.includes(field.id), !isEditing),
            "emp-layout-config-field-panel emp-layout-config-field-panel-balanced min-w-0 w-full flex-1 cursor-pointer",
            isDragging ? "emp-layout-config-field--dragging" : ""
          )}
        >
          {isCustomField(field) && <EmpCustomMarker variant="white" />}
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">{field.label}</span>
          {renderFieldStatusIcons(field)}
          {renderFieldActions({ field, variant: "panel" })}
        </div>
      </div>
    );
  };

  const content = (
    <div
      className={`cadastro-emp-scope mg-empresas-scope emp-layout-configurator flex h-full w-full flex-col overflow-hidden${isEditing ? " emp-layout-config-editing" : ""}${isDragging ? " emp-layout-config-is-dragging" : ""}`}
      data-active-card-span={String(activeCardSpan)}
      onMouseDownCapture={(event) => {
        if (event.target.closest?.(".emp-layout-config-field")) return;
        if (event.target.closest?.("[data-radix-popper-content-wrapper]")) return;
        clearSelections();
      }}
    >
      {!inline && (
        <DialogHeader className="sr-only">
          <DialogTitle>Configuração de layout do formulário</DialogTitle>
        </DialogHeader>
      )}

      <EmpSplitToolbarLayout className="min-h-0 flex-1" toolbar={null}>
        <div className="emp-layout-config-grid grid min-h-0 h-full flex-1 grid-cols-[280px_48px_minmax(0,1fr)]">
          <aside className="emp-layout-config-sidebar flex flex-col overflow-hidden">
            <div className="mb-2 text-sm font-semibold" style={{ color: "var(--text-1)" }}>
              Campos disponíveis
            </div>
            <div className="mg-search-pill emp-layout-config-sidebar-search mb-3 w-full max-w-full" role="search">
              <Search className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Procurar campo disponível"
                aria-label="Procurar campo disponível"
              />
            </div>
            <div
              className={cn(
                "emp-layout-config-available-list flex flex-1 flex-col gap-1 overflow-auto pr-1",
                draggedFrom === "panel" && isEditing ? "emp-layout-config-drop-target" : ""
              )}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggedFrom === "panel" && isEditing) {
                  event.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                dropFieldsToAvailable();
              }}
            >
              <div className="flex flex-1 flex-col gap-1">
                {availableFields.length === 0 ? (
                  <div className="py-4 text-center text-xs" style={{ color: "var(--text-3)" }}>
                    Solte aqui para remover do painel.
                  </div>
                ) : (
                  availableFields.map(renderAvailableField)
                )}
              </div>
            </div>
          </aside>

          <section className="emp-layout-config-transfer flex flex-col items-center justify-center gap-2 px-1">
            <button
              type="button"
              className="mg-nav-btn ios-btn"
              disabled={!isEditing || panelFieldIds.length === 0}
              onClick={removeAllFields}
              title="Remover todos"
            >
              <SkipBack className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="mg-nav-btn ios-btn"
              disabled={!isEditing || availableFields.length === 0}
              onClick={addAllFields}
              title="Adicionar todos"
            >
              <SkipForward className="h-3 w-3" />
            </button>
          </section>

          <main
            className="emp-layout-config-main flex min-w-0 flex-col overflow-hidden"
            data-active-card-span={String(activeCardSpan)}
          >
            <div className="mg-panel-tabs-strip emp-layout-config-panel-tabs shrink-0 px-3 md:px-5">
              <div className="flex min-h-[34px] items-end gap-2">
                <div className="emp-layout-config-panel-actions relative z-20 mr-1 flex shrink-0 items-center gap-1.5 self-center">
                  {isEditing && (
                    <LayoutIconBtn className="tb-btn-green" onClick={createPanel} title="Novo painel">
                      <Plus className="h-3.5 w-3.5" />
                    </LayoutIconBtn>
                  )}
                  {isEditing && (
                    <LayoutIconBtn
                      className="tb-btn-danger"
                      disabled={!activePanel || activePanelIsSystem || activePanelIsFixed}
                      onClick={deletePanel}
                      title="Excluir painel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </LayoutIconBtn>
                  )}
                </div>
                <div className="seg-control min-w-0 flex-1" role="tablist" ref={panelSegRef}>
                  <div className="seg-tab-slider" ref={panelSliderRef} aria-hidden="true" />
                  {draftPanels.map((panel) => {
                    const active = activePanel?.id === panel.id;
                    return (
                      <button
                        key={panel.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        draggable={isEditing && !fixedPanelIds.includes(panel.id)}
                        onDragStart={(event) => {
                          event.stopPropagation();
                          lastFieldHoverTargetRef.current = "";
                          fieldPreviewAppliedRef.current = false;
                          setDraggedPanelId(panel.id);
                        }}
                        onDragEnter={(event) => {
                          if (!draggedFieldId || !isEditing) return;
                          event.preventDefault();
                          event.stopPropagation();
                          setDragOverPanelId(panel.id);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (draggedFieldId && isEditing) {
                            event.dataTransfer.dropEffect = "move";
                            setDragOverPanelId(panel.id);
                            return;
                          }
                          if (draggedPanelId && !draggedFieldId) {
                            event.dataTransfer.dropEffect = "move";
                            previewReorderPanelAt(panel.id, resolveDragInsertEdge(event));
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverPanelId === panel.id) setDragOverPanelId(null);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setDragOverPanelId(null);
                          if (draggedFieldId && isEditing) {
                            markFieldDragCommitted();
                            moveFieldsToPanel(resolveDragFieldIds(), panel.id);
                            finishFieldDrag();
                          }
                        }}
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
                        className={`seg-tab${active ? " active" : ""}${panel.hidden ? " emp-form-tab-hidden-panel" : ""}${dragOverPanelId === panel.id ? " emp-layout-config-tab--drag-over" : ""}${draggedPanelId === panel.id ? " emp-layout-config-field--dragging" : ""}`}
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
                          formatPanelLabel(panel.label)
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mg-panel-tabs-strip emp-layout-config-card-tabs shrink-0 px-3 md:px-5">
              <div className="flex min-h-[34px] items-end gap-2">
                <div className="emp-layout-config-card-actions relative z-20 mr-1 flex shrink-0 items-center gap-1.5 self-center">
                  {isEditing && (
                    <LayoutIconBtn className="tb-btn-green" onClick={createCard} title="Novo card">
                      <Plus className="h-3.5 w-3.5" />
                    </LayoutIconBtn>
                  )}
                  {isEditing && activeCard && activePanelCards.length > 1 && (
                    <LayoutIconBtn
                      className="tb-btn-danger"
                      onClick={() => deleteCard(activeCard.id)}
                      title="Excluir card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </LayoutIconBtn>
                  )}
                  {isEditing && activeCard && (
                    <LayoutLabeledBtn
                      onClick={() => toggleCardColSpan(activeCard.id)}
                      className="h-7 px-2 text-[10px]"
                      title={
                        CARD_COL_SPAN_OPTIONS.find(
                          (o) => o.value === (Number(activeCard.colSpan) <= 6 ? 12 : 6)
                        )?.label || "Alternar largura do card"
                      }
                    >
                      {(Number(activeCard.colSpan) || 12) <= 6 ? "½→⬛" : "⬛→½"}
                    </LayoutLabeledBtn>
                  )}
                </div>
                <div className="seg-control min-w-0 flex-1" role="tablist" ref={cardSegRef}>
                  <div className="seg-tab-slider" ref={cardSliderRef} aria-hidden="true" />
                  {activePanelCards.map((card) => {
                    const active = card.id === activeCard?.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        draggable={isEditing && activePanelCards.length > 1}
                        onDragStart={(event) => {
                          event.stopPropagation();
                          lastFieldPreviewKeyRef.current = "";
                          lastFieldHoverTargetRef.current = "";
                          fieldPreviewAppliedRef.current = false;
                          setDraggedCardId(card.id);
                        }}
                        onClick={() => {
                          setActiveCardId(card.id);
                          setSelectedPanelFieldIds([]);
                        }}
                        onDoubleClick={() => isEditing && setEditingCardId(card.id)}
                        onDragOver={(event) => {
                          if (!isEditing) return;
                          event.preventDefault();
                          if (draggedCardId && !draggedFieldId) {
                            event.dataTransfer.dropEffect = "move";
                            previewReorderCardAt(card.id, resolveDragInsertEdge(event));
                            return;
                          }
                          if (!draggedFieldId) return;
                          event.dataTransfer.dropEffect = "move";
                          setDragOverCardId(card.id);
                        }}
                        onDragEnter={(event) => {
                          if (!draggedFieldId || !isEditing) return;
                          event.preventDefault();
                          event.stopPropagation();
                          setDragOverCardId(card.id);
                        }}
                        onDragLeave={() => {
                          if (dragOverCardId === card.id) setDragOverCardId(null);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          setDragOverCardId(null);
                          if (draggedFieldId) {
                            markFieldDragCommitted();
                            moveFieldsToCard(resolveDragFieldIds(), card.id);
                            finishFieldDrag();
                          }
                        }}
                        onDragEnd={() => setDraggedCardId(null)}
                        className={`seg-tab${active ? " active" : ""}${dragOverCardId === card.id ? " emp-layout-config-tab--drag-over" : ""}${draggedCardId === card.id ? " emp-layout-config-field--dragging" : ""}`}
                      >
                        {isEditing && editingCardId === card.id ? (
                          <Input
                            value={card.label || ""}
                            autoFocus
                            onClick={(event) => event.stopPropagation()}
                            onBlur={() => setEditingCardId(null)}
                            onChange={(event) => renameCard(card.id, event.target.value)}
                            className="h-6 w-28 border-0 bg-transparent p-0 text-xs font-semibold normal-case shadow-none focus-visible:ring-0"
                          />
                        ) : (
                          <>
                            {card.label}
                            <span className="ml-1 text-[9px] opacity-70">
                              {(Number(card.colSpan) || 12) <= 6 ? "½" : "⬛"}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              ref={layoutPanelRef}
              className="mg-form-scroll emp-layout-config-panel-body min-h-0 flex-1 overflow-auto px-3 md:px-5"
            >
              <p className="emp-layout-config-help mb-2 text-[10px]">
                Painel → Card → Linha → Campo. Card inteiro: até <strong>7</strong> por linha; card meio (½): até{" "}
                <strong>4</strong>. Os campos da mesma linha ficam lado a lado e o espaço é redistribuído
                automaticamente (como no formulário).
              </p>
              <div className="emp-layout-config-rows flex min-h-[160px] flex-col gap-3 py-2">
                {displayRows.length === 0 ? (
                  <div className="p-4 text-xs" style={{ color: "var(--text-3)" }}>
                    Card vazio. Arraste campos ou use os botões de transferência.
                  </div>
                ) : (
                  displayRows.map((layoutRow, rowIndex) => {
                    const rowFields = (layoutRow.fieldIds || [])
                      .map((id) => fields.find((field) => field.id === id))
                      .filter(Boolean);
                    const rowCount = (layoutRow.fieldIds || []).filter(Boolean).length;
                    const rowMax = getMaxFieldsPerRow(getActiveCardColSpan());
                    const rowFull = rowCount >= rowMax;
                    const isDraftRow =
                      isEditing &&
                      rowIndex === displayRows.length - 1 &&
                      rowCount === 0;
                    const rowDisplayNumber = displayRows
                      .slice(0, rowIndex + 1)
                      .filter((row, idx) => {
                        const isTrailingDraft =
                          isEditing &&
                          idx === displayRows.length - 1 &&
                          !(row.fieldIds || []).length;
                        return !isTrailingDraft;
                      }).length;
                    const canDeleteRow = isEditing && !isDraftRow;
                    return (
                      <div
                        key={layoutRow.id}
                        className={cn(
                          "emp-layout-config-row emp-layout-config-card-shell relative emp-layout-config-field-transition",
                          rowFull ? "emp-layout-config-row--full" : "",
                          isDraftRow ? "emp-layout-config-row--draft" : "",
                          draggedRowId === layoutRow.id ? "emp-layout-config-field--dragging" : ""
                        )}
                        onDragOver={(event) => {
                          if (!isEditing) return;
                          if (draggedRowId && draggedRowId !== layoutRow.id) {
                            event.preventDefault();
                            previewReorderRowAt(layoutRow.id, resolveDragInsertEdgeVertical(event));
                            event.dataTransfer.dropEffect = "move";
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          finishRowDrag();
                        }}
                      >
                        {!isDraftRow ? (
                          <div
                            className={cn(
                              "mb-2 flex items-center justify-between gap-2",
                              isEditing ? "emp-layout-config-row-header emp-layout-config-row-header--draggable" : ""
                            )}
                            draggable={isEditing}
                            onDragStart={() => {
                              setDraggedRowId(layoutRow.id);
                            }}
                            onDragEnd={finishRowDrag}
                          >
                            <span className="emp-layout-config-row-label text-[10px] font-bold">
                              Linha {rowDisplayNumber}
                              <span
                                className={cn("ml-1 font-semibold", rowFull && "emp-layout-config-row-label--full")}
                              >
                                ({rowCount}/{rowMax})
                              </span>
                            </span>
                            {canDeleteRow && (
                              <LayoutIconBtn
                                className="tb-btn-danger"
                                onClick={() => removeLayoutRowById(layoutRow.id)}
                                title="Excluir linha"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </LayoutIconBtn>
                            )}
                          </div>
                        ) : null}
                        <div
                          className={cn(
                            "emp-layout-config-panel-fields flex min-h-[48px] w-full min-w-0 flex-nowrap items-stretch gap-2",
                            dragOverRowId === layoutRow.id && draggedFieldId && !draggedRowId
                              ? "emp-layout-config-row-drop--active"
                              : ""
                          )}
                          data-row-max={rowMax}
                          onDragEnter={(event) => {
                            if (!isEditing || draggedRowId || !draggedFieldId) return;
                            event.preventDefault();
                            event.stopPropagation();
                            if (isDraftRow) {
                              setDragOverRowId(layoutRow.id);
                              return;
                            }
                            if (event.target.closest?.(".emp-layout-config-field-panel")) {
                              return;
                            }
                            trackRowDropTarget(layoutRow.id, "after");
                            const ids = resolveDragFieldIds();
                            const canDrop = canDropFieldsAtTarget({
                              targetPanelId: activePanelId,
                              targetCardId: activeCardId,
                              targetRowId: layoutRow.id,
                              showWarningOnFail: false,
                              fieldIds: ids,
                            });
                            if (!canDrop) return;
                            setDragOverRowId(layoutRow.id);
                          }}
                          onDragOver={(event) => {
                            if (!isEditing || draggedRowId) return;
                            event.preventDefault();
                            if (isDraftRow) {
                              if (draggedFieldId) {
                                event.dataTransfer.dropEffect = "move";
                                setDragOverRowId(layoutRow.id);
                              }
                              return;
                            }
                            const canDrop = canDropFieldsAtTarget({
                              targetPanelId: activePanelId,
                              targetCardId: activeCardId,
                              targetRowId: layoutRow.id,
                              showWarningOnFail: false,
                            });
                            event.dataTransfer.dropEffect = canDrop ? "move" : "none";
                            if (canDrop) {
                              setDragOverRowId(layoutRow.id);
                            }
                          }}
                          onDragLeave={(event) => {
                            if (isDragLeaveWithinContainer(event.currentTarget, event.relatedTarget)) return;
                            if (dragOverRowId === layoutRow.id) setDragOverRowId(null);
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            setDragOverRowId(null);
                            if (draggedRowId) return;
                            if (!draggedFieldId && !selectedAvailableIds.length) return;
                            if (isDraftRow) {
                              commitDropOnDraftRow();
                              finishFieldDrag();
                              return;
                            }
                            markFieldDragCommitted();
                            const lastTarget = lastFieldDropTargetRef.current;
                            const fieldInRow =
                              lastTarget?.targetFieldId &&
                              (layoutRow.fieldIds || []).includes(lastTarget.targetFieldId);
                            const draggedIds = resolveDragFieldIds();
                            const card = (draftCardsByPanel[activePanelId]?.cards || []).find(
                              (item) => item.id === activeCardId
                            );
                            const cardRows = ensureCardRows(card);
                            const draggedSourceRowId =
                              draggedIds.length === 1 ? findFieldRowId(cardRows, draggedIds[0]) : null;
                            const targetFieldRowId = lastTarget?.targetFieldId
                              ? findFieldRowId(cardRows, lastTarget.targetFieldId)
                              : null;
                            const sameRowReorder =
                              !!fieldInRow &&
                              !!draggedSourceRowId &&
                              draggedSourceRowId === targetFieldRowId;
                            if (sameRowReorder) {
                              if (!commitFieldDropOnField(lastTarget.targetFieldId)) {
                                commitMoveFieldsToField(lastTarget.targetFieldId, lastTarget.edge);
                              }
                            } else if (
                              lastTarget?.targetRowId === layoutRow.id ||
                              !lastTarget?.targetFieldId ||
                              targetFieldRowId !== layoutRow.id
                            ) {
                              commitMoveFieldsToRow(layoutRow.id, lastTarget?.edge || "after");
                            } else {
                              commitMoveFieldsToRow(layoutRow.id, "after");
                            }
                            finishFieldDrag();
                          }}
                        >
                          {isDraftRow ? (
                            <div className="emp-layout-config-row-draft flex min-h-[var(--mg-field-height)] flex-1 items-center justify-center gap-2 bg-white px-2">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    className="emp-layout-config-row-draft-add ios-btn tb-btn tb-btn-green tb-btn-icon"
                                    title="Adicionar linha"
                                    aria-label="Adicionar linha"
                                    onClick={handleDraftAddRow}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                  <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
                                    Arraste um campo para adicionar nova linha
                                  </span>
                                </>
                              ) : null}
                            </div>
                          ) : null}
                          {!isDraftRow && rowFields.length === 0 && isEditing ? (
                            <span className="emp-layout-config-row-dropzone flex min-h-[var(--mg-field-height)] flex-1 items-center justify-center px-2 text-[10px]">
                              Arraste campos para esta linha
                            </span>
                          ) : null}
                          {!isDraftRow ? rowFields.map((field) => renderPanelField(field, layoutRow)) : null}
                          {!isDraftRow
                            ? (layoutRow.fieldIds || [])
                                .filter((id) => id && !fields.find((f) => f.id === id))
                                .map((orphanId) => (
                                  <div
                                    key={orphanId}
                                    className="emp-layout-config-field emp-layout-config-field-panel emp-layout-config-field-optional flex min-w-0 flex-1 items-center px-2 text-[10px] text-white opacity-80"
                                    title="Campo não encontrado no catálogo"
                                  >
                                    {orphanId}
                                  </div>
                                ))
                            : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {isEditing && selectedPanelFieldIds.length === 1 && (
                <div className="emp-layout-config-footer mt-3 flex flex-wrap items-center gap-2 pt-2">
                  <span className="emp-layout-config-footer-label text-[11px] font-semibold">Tipo de largura:</span>
                  {FIELD_WIDTH_TYPE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFieldWidthType(selectedPanelFieldIds[0], value)}
                      className={`emp-layout-config-footer-btn h-6 px-2 text-[10px] font-semibold${
                        draftFieldSizes[selectedPanelFieldIds[0]] === value
                          ? " emp-layout-config-footer-btn--active"
                          : ""
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFieldWidthType(selectedPanelFieldIds[0], "")}
                    className="emp-layout-config-footer-btn h-6 px-2 text-[10px] font-semibold"
                  >
                    Padrão do tipo
                  </button>
                </div>
              )}
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
