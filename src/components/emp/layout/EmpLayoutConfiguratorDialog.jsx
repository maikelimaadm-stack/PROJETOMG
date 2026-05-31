import React, { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import EmpConditionalVisibilityEditor from "./EmpConditionalVisibilityEditor";
import TopNoticeDialog from "@/components/common/TopNoticeDialog";
import EmpCustomMarker from "@/components/emp/shared/EmpCustomMarker";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import EmpToolbarIcon from "@/components/emp/toolbars/EmpToolbarIcon";
import {
  EMP_TOOLBAR_BTN,
  EMP_TOOLBAR_SEARCH_INPUT,
  EMP_TOOLBAR_SEARCH_WRAP,
} from "@/components/emp/toolbars/empToolbarStyles";

const DEFAULT_SYSTEM_PANEL_IDS = ["principal", "geral", "endereco", "observacoes", "campos_personalizados"];
const DEFAULT_FIXED_PANEL_IDS = ["principal"];
const DEFAULT_FIXED_VISIBLE_FIELD_IDS = ["status", "codigo_empresa"];
const AGGREGATION_OPTIONS = [
  { value: "sum", label: "Soma" },
  { value: "avg", label: "Média" },
  { value: "max", label: "Maior" },
  { value: "min", label: "Menor" },
];

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const LABELED_BTN_CLASS = "emp-toolbar-btn-labeled w-auto px-2 gap-1.5 text-[11px] font-medium";

const isCustomPanelByIds = (panel, systemPanelIds) => panel && !systemPanelIds.includes(panel.id);
const isCustomField = (field) => field?.origem === "customizado" || String(field?.id || "").startsWith("custom:");
const CustomMarker = EmpCustomMarker;
const formatPanelLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export default function EmpLayoutConfiguratorDialog({
  open,
  onOpenChange,
  panels = [],
  fields = [],
  layout = {},
  hiddenFieldIds = [],
  lockedFieldIds = [],
  requiredFieldIds = [],
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
  const [draftLayout, setDraftLayout] = useState(layout);
  const [draftHiddenFieldIds, setDraftHiddenFieldIds] = useState(hiddenFieldIds);
  const [draftLockedFieldIds, setDraftLockedFieldIds] = useState(lockedFieldIds);
  const [draftRequiredFieldIds, setDraftRequiredFieldIds] = useState(requiredFieldIds);
  const [draftAggregationConfig, setDraftAggregationConfig] = useState(aggregationConfig);
  const [draftVisibilityRules, setDraftVisibilityRules] = useState(visibilityRules);
  const [activePanelId, setActivePanelId] = useState(panels[0]?.id || "");
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedPanelFieldIds, setSelectedPanelFieldIds] = useState([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [draggedPanelId, setDraggedPanelId] = useState(null);
  const [editingPanelId, setEditingPanelId] = useState(null);
  const [requiredPopup, setRequiredPopup] = useState({ open: false, message: "" });
  const panelsScrollRef = useRef(null);

  React.useEffect(() => {
    if (!open) return;
    setDraftPanels(panels);
    setDraftLayout(layout);
    setDraftHiddenFieldIds(hiddenFieldIds);
    setDraftLockedFieldIds(lockedFieldIds);
    setDraftRequiredFieldIds(requiredFieldIds);
    setDraftAggregationConfig(aggregationConfig);
    setDraftVisibilityRules(visibilityRules);
    setActivePanelId(panels[0]?.id || "");
    setSelectedAvailableIds([]);
    setSelectedPanelFieldIds([]);
    setSearch("");
    setIsEditing(false);
    setEditingPanelId(null);
  }, [open, panels, layout, hiddenFieldIds, lockedFieldIds, requiredFieldIds, aggregationConfig, visibilityRules]);

  const activePanel = draftPanels.find((panel) => panel.id === activePanelId) || draftPanels[0];
  const usedFieldIds = useMemo(() => new Set(Object.values(draftLayout || {}).flat()), [draftLayout]);
  const panelFieldIds = draftLayout[activePanel?.id] || [];
  const panelFields = panelFieldIds.map((id) => fields.find((field) => field.id === id)).filter(Boolean);
  const selectedField = fields.find((field) => field.id === selectedPanelFieldIds[0]) || null;
  const activePanelIsSystem = systemPanelIds.includes(activePanel?.id);
  const activePanelIsFixed = fixedPanelIds.includes(activePanel?.id);
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

  const showRequiredPopup = (message) => setRequiredPopup({ open: true, message });
  const addField = () => {
    if (!selectedAvailableIds.length || !activePanel) return;
    setDraftLayout((prev) => ({
      ...prev,
      [activePanel.id]: [
        ...(prev[activePanel.id] || []),
        ...selectedAvailableIds.filter((id) => !(prev[activePanel.id] || []).includes(id)),
      ],
    }));
    setSelectedAvailableIds([]);
    setSelectedPanelFieldIds([]);
  };
  const addAllFields = () => {
    if (!activePanel) return;
    const ids = availableFields.map((field) => field.id);
    setDraftLayout((prev) => ({
      ...prev,
      [activePanel.id]: [
        ...(prev[activePanel.id] || []),
        ...ids.filter((id) => !(prev[activePanel.id] || []).includes(id)),
      ],
    }));
    setSelectedAvailableIds([]);
  };
  const removeField = () => {
    if (!selectedPanelFieldIds.length || !activePanel) return;
    if (selectedPanelFieldIds.some((id) => fixedVisibleFieldIds.includes(id))) {
      return showRequiredPopup("Código e Ativo não podem ser removidos do layout.");
    }
    setDraftLayout((prev) => ({
      ...prev,
      [activePanel.id]: (prev[activePanel.id] || []).filter((id) => !selectedPanelFieldIds.includes(id)),
    }));
    setSelectedPanelFieldIds([]);
  };
  const removeAllFields = () => {
    if (!activePanel) return;
    setDraftLayout((prev) => ({
      ...prev,
      [activePanel.id]: (prev[activePanel.id] || []).filter((id) => fixedVisibleFieldIds.includes(id)),
    }));
    setSelectedPanelFieldIds([]);
  };
  const createPanel = () => {
    const id = `painel_${Date.now()}`;
    const next = {
      id,
      label: `Painel Personalizado ${draftPanels.filter((panel) => !systemPanelIds.includes(panel.id)).length + 1}`,
    };
    setDraftPanels((prev) => [...prev, next]);
    setDraftLayout((prev) => ({ ...prev, [id]: [] }));
    setActivePanelId(id);
    setEditingPanelId(id);
    setIsEditing(true);
  };
  const deletePanel = () => {
    if (!activePanel || activePanelIsSystem) return;
    setDraftPanels((prev) => prev.filter((panel) => panel.id !== activePanel.id));
    setDraftLayout((prev) => {
      const next = { ...prev };
      delete next[activePanel.id];
      return next;
    });
    setActivePanelId(draftPanels.find((panel) => panel.id !== activePanel.id)?.id || "");
  };
  const reorderField = (targetFieldId) => {
    if (!draggedFieldId || draggedFieldId === targetFieldId || !activePanel) return;
    const list = [...panelFieldIds];
    const from = list.indexOf(draggedFieldId);
    const to = list.indexOf(targetFieldId);
    if (from < 0 || to < 0) return;
    list.splice(from, 1);
    list.splice(to, 0, draggedFieldId);
    setDraftLayout((prev) => ({ ...prev, [activePanel.id]: list }));
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
      layout: draftLayout,
      hiddenFieldIds: draftHiddenFieldIds,
      lockedFieldIds: draftLockedFieldIds,
      requiredFieldIds: draftRequiredFieldIds,
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
    setDraftPanels(defaultConfig.panels || []);
    setDraftLayout(defaultConfig.layout || {});
    setDraftHiddenFieldIds([]);
    setDraftLockedFieldIds([]);
    setDraftRequiredFieldIds([]);
    setDraftAggregationConfig({});
    setDraftVisibilityRules({});
    setActivePanelId(defaultConfig.panels?.[0]?.id || "");
  };
  const discardChanges = () => {
    setDraftPanels(panels);
    setDraftLayout(layout);
    setDraftHiddenFieldIds(hiddenFieldIds);
    setDraftLockedFieldIds(lockedFieldIds);
    setDraftRequiredFieldIds(requiredFieldIds);
    setDraftAggregationConfig(aggregationConfig);
    setDraftVisibilityRules(visibilityRules);
    setIsEditing(false);
  };
  const scrollPanels = (direction) =>
    panelsScrollRef.current?.scrollBy({ left: direction * 260, behavior: "smooth" });

  const fieldItemClass = (selected, readOnly = false) =>
    `emp-layout-config-field relative flex items-center justify-between gap-2 overflow-hidden px-2 text-left transition-colors focus-visible:outline-none ${
      selected ? "emp-layout-config-field-selected" : "emp-layout-config-field-default"
    } ${readOnly ? "emp-layout-config-field-readonly" : ""}`;

  const renderAvailableField = (field) => (
    <button
      key={field.id}
      type="button"
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
      onDragStart={() => {
        setDraggedFieldId(field.id);
        setSelectedAvailableIds([field.id]);
      }}
      onDragEnd={() => setDraggedFieldId(null)}
      className={`${fieldItemClass(selectedAvailableIds.includes(field.id), !isEditing)} emp-layout-config-field-available w-full`}
    >
      {isCustomField(field) && <CustomMarker />}
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold">{field.label}</div>
        <div className="truncate text-[10px] text-slate-500">Disponível</div>
      </div>
      {field.required && <span className="text-[10px] font-bold leading-none text-red-600">*</span>}
    </button>
  );

  const renderPanelField = (field) => (
    <button
      key={field.id}
      type="button"
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
      onDragStart={() => {
        setDraggedFieldId(field.id);
        setSelectedPanelFieldIds([field.id]);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        reorderField(field.id);
      }}
      onDrop={() => setDraggedFieldId(null)}
      onDragEnd={() => setDraggedFieldId(null)}
      className={`${fieldItemClass(selectedPanelFieldIds.includes(field.id), !isEditing)} emp-layout-config-field-panel min-w-[210px]`}
    >
      {isCustomField(field) && <CustomMarker />}
      <span className="truncate text-xs font-semibold">{field.label}</span>
      <span className="ml-2 flex items-center gap-1 opacity-90">
        {draftHiddenFieldIds.includes(field.id) && <EyeOff className="h-3 w-3" />}
        {field.required && <span className="text-[10px]">*</span>}
      </span>
    </button>
  );

  const content = (
    <div className="cadastro-emp-scope emp-layout-configurator flex h-full w-full flex-col overflow-hidden bg-white">
      {!inline && (
        <DialogHeader className="sr-only">
          <DialogTitle>Configuração de layout do formulário</DialogTitle>
        </DialogHeader>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-b border-[#d6dce8] bg-white">
        <div className="emp-layout-config-toolbar emp-toolbar flex h-[35px] min-h-[35px] max-h-[35px] shrink-0 items-center gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap border-b border-sky-100 bg-white px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            <ToolbarBtn onClick={createPanel} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new`} title="Novo painel">
              <EmpToolbarIcon icon={Plus} strokeWidth={2.5} />
              <span>Novo</span>
            </ToolbarBtn>
          )}
          {isEditing && (
            <ToolbarBtn
              disabled={!activePanel || activePanelIsSystem || activePanelIsFixed}
              onClick={deletePanel}
              className={LABELED_BTN_CLASS}
              title="Excluir painel"
            >
              <EmpToolbarIcon icon={Trash2} />
              <span>Excluir</span>
            </ToolbarBtn>
          )}
          {isEditing && (
            <ToolbarBtn onClick={handleSave} className={LABELED_BTN_CLASS} title="Salvar">
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

        <div className="grid min-h-0 flex-1 grid-cols-[320px_45px_1fr] border-t border-[#d6dce8]">
          <aside className="flex flex-col overflow-hidden border-r border-[#d6dce8] bg-white p-2">
            <div className="mb-2 text-sm font-semibold text-[#1a1f26]">Campos disponíveis</div>
            <div className={`${EMP_TOOLBAR_SEARCH_WRAP} mb-3 w-full`}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Procurar campo"
                className={`${EMP_TOOLBAR_SEARCH_INPUT} pr-7`}
              />
              <Search className="emp-toolbar-search-icon pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5b6b80]" />
            </div>
            <div
              className="emp-layout-config-available-list flex flex-1 flex-col gap-1 overflow-auto pr-1"
              onDragOver={(event) => event.preventDefault()}
            >
              {availableFields.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">Solte aqui para remover do painel.</div>
              ) : (
                availableFields.map(renderAvailableField)
              )}
            </div>
          </aside>

          <section className="flex flex-col items-center justify-center gap-1.5 border-r border-[#d6dce8] bg-[#f8fafc]">
            <ToolbarBtn disabled={!isEditing || panelFieldIds.length === 0} onClick={removeAllFields} title="Remover todos">
              <EmpToolbarIcon icon={ChevronsLeft} nav />
            </ToolbarBtn>
            <ToolbarBtn disabled={!isEditing || selectedPanelFieldIds.length === 0} onClick={removeField} title="Remover">
              <EmpToolbarIcon icon={ChevronLeft} nav />
            </ToolbarBtn>
            <ToolbarBtn disabled={!isEditing || selectedAvailableIds.length === 0} onClick={addField} title="Adicionar">
              <EmpToolbarIcon icon={ChevronRight} nav />
            </ToolbarBtn>
            <ToolbarBtn disabled={!isEditing || availableFields.length === 0} onClick={addAllFields} title="Adicionar todos">
              <EmpToolbarIcon icon={ChevronsRight} nav />
            </ToolbarBtn>
          </section>

          <main className="emp-layout-config-main flex min-w-0 flex-col overflow-hidden bg-white">
            <div className="emp-layout-config-panel-shell flex min-h-0 flex-1 flex-col">
              <div className="emp-form-tabs relative flex h-7 items-end justify-start bg-white pl-2 pr-2">
                <div className="emp-form-tab-nav-group relative z-20 mr-1.5 flex h-7 shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollPanels(-1)}
                    className={`${EMP_TOOLBAR_BTN} emp-form-tab-nav-btn`}
                    title="Rolar painéis"
                    aria-label="Rolar painéis para a esquerda"
                  >
                    <EmpToolbarIcon icon={ChevronLeft} nav />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollPanels(1)}
                    className={`${EMP_TOOLBAR_BTN} emp-form-tab-nav-btn`}
                    title="Rolar painéis"
                    aria-label="Rolar painéis para a direita"
                  >
                    <EmpToolbarIcon icon={ChevronRight} nav />
                  </button>
                </div>
                <div
                  ref={panelsScrollRef}
                  className="emp-form-tab-list flex h-7 min-w-0 flex-1 items-end overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
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
                        className={`emp-form-tab relative z-10 min-w-max flex-none overflow-hidden whitespace-nowrap ${
                          active ? "emp-form-tab-active" : "emp-form-tab-inactive"
                        }`}
                      >
                        {isCustomPanelByIds(panel, systemPanelIds) && <CustomMarker />}
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

              <div className="emp-form-section emp-form-section-panel emp-layout-config-panel-body min-h-0 flex-1 overflow-auto pl-2 pr-4">
                <div
                  className="emp-layout-config-panel-fields flex min-h-[160px] flex-wrap content-start gap-2"
                  onDragOver={(event) => event.preventDefault()}
                >
                  {panelFields.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400">Painel vazio.</div>
                  ) : (
                    panelFields.map(renderPanelField)
                  )}
                </div>
              </div>
            </div>

            <div className="emp-layout-config-footer flex h-10 shrink-0 items-center gap-3 border-t border-[#d6dce8] bg-[#f8fafc] px-2 py-2">
              <label className="flex items-center gap-2 text-[12px] text-[#1a1f26]">
                <span>Oculto:</span>
                <ToggleSwitch
                  checked={!!selectedField && draftHiddenFieldIds.includes(selectedField.id)}
                  disabled={
                    !selectedField ||
                    !isEditing ||
                    selectedField.required ||
                    fixedVisibleFieldIds.includes(selectedField.id)
                  }
                  onChange={(checked) => toggleListValue(setDraftHiddenFieldIds, selectedField?.id, checked)}
                  className="emp-form-toggle-switch"
                  checkedClassName="emp-form-toggle-switch-on"
                />
              </label>
              <label className="flex items-center gap-2 text-[12px] text-[#1a1f26]">
                <span>Bloqueado:</span>
                <ToggleSwitch
                  checked={!!selectedField && draftLockedFieldIds.includes(selectedField.id)}
                  disabled={!selectedField || !isEditing || selectedField.required}
                  onChange={(checked) => toggleListValue(setDraftLockedFieldIds, selectedField?.id, checked)}
                  className="emp-form-toggle-switch"
                  checkedClassName="emp-form-toggle-switch-on"
                />
              </label>
              <label className="flex items-center gap-2 text-[12px] text-[#1a1f26]">
                <span>Totalizar:</span>
                <ToggleSwitch
                  checked={!!selectedField && !!draftAggregationConfig[selectedField.id]?.enabled}
                  disabled={!selectedField || !selectedField?.totalizable || !isEditing}
                  onChange={(checked) => setAggregationEnabled(selectedField?.id, checked)}
                  className="emp-form-toggle-switch"
                  checkedClassName="emp-form-toggle-switch-on"
                />
              </label>
              <EmpConditionalVisibilityEditor
                selectedField={selectedField}
                fields={fields}
                visibilityRules={draftVisibilityRules}
                onChange={setVisibilityRule}
                disabled={!isEditing}
              />
              <Select
                value={selectedField ? draftAggregationConfig[selectedField.id]?.type || "sum" : "sum"}
                onValueChange={(value) =>
                  selectedField &&
                  setDraftAggregationConfig((prev) => ({
                    ...prev,
                    [selectedField.id]: { enabled: true, type: value },
                  }))
                }
                disabled={!selectedField || !draftAggregationConfig[selectedField.id]?.enabled || !isEditing}
              >
                <SelectTrigger className="emp-layout-config-select h-6 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGGREGATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </main>
        </div>
      </div>

      <TopNoticeDialog
        open={requiredPopup.open}
        onOpenChange={(nextOpen) => setRequiredPopup((prev) => ({ ...prev, open: nextOpen }))}
        badge="AVISO"
        title="Atenção"
        description={requiredPopup.message}
        type="warning"
        confirmText={null}
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
