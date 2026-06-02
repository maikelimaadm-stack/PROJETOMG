import React, { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Filter, FilterX, X, ArrowDownAZ, ArrowUpZA, Check } from "lucide-react";
import { toast } from "sonner";
import LegacyRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import { EMP_TOOLBAR_BTN } from "@/framework/cadastro/toolbars/empToolbarStyles";
import TopNoticeDialog from "@/shared/components/TopNoticeDialog";
import EmpRelationConfig from "@/framework/cadastro/fields/EmpRelationConfig";
import EmpManualOptionsConfig from "@/framework/cadastro/fields/EmpManualOptionsConfig";
import EmpCalculationBuilder from "@/framework/cadastro/fields/EmpCalculationBuilder";
import EmpDecimalConfig from "@/framework/cadastro/fields/EmpDecimalConfig";
import EmpMaskConfig from "@/framework/cadastro/fields/EmpMaskConfig";
import { montarCamposDisponiveis, montarFormulaVisual } from "@/framework/cadastro/fields/empFieldConfigOptions";

const TIPOS_CAMPO = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Observação" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
  { value: "datetime", label: "Data e Hora" },
  { value: "time", label: "Hora" },
  { value: "select", label: "Lista de seleção" },
  { value: "option_list", label: "Lista de opções" },
  { value: "relation", label: "Relação com cadastro" },
  { value: "calculado", label: "Calculado" }
];

const toSnakeCase = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
const toTitleCase = (v) => String(v || "").toLowerCase().replace(/(^|\s)([a-záàâãéèêíïóôõöúçñ])/g, (m) => m.toUpperCase());

const patchCamposCache = (queryClient, updater) => {
  queryClient.setQueriesData({ queryKey: ["emp-campos-personalizados"] }, (previous) => {
    if (!Array.isArray(previous)) return previous;
    return updater(previous);
  });
};

const getCampoId = (campo) => campo?.id || campo?.field_id || null;

const initialForm = {
  label: "", field_name: "", placeholder: "", descricao: "", tipo: "text",
  aplicacao_modo: "todas", empresa_id: null,
  col_span: 12, largura_coluna: 160, ordem_tabela: 999,
  obrigatorio: false, read_only: false, visivel_form: true, visivel_tabela: true, visivel_relatorio: true,
  ordenavel: true, filtravel: true, alinhamento: "left", agregacao_tipo: "none", agregacao_campo_base: "",
  options_source_entity: "", options_text: "", options_label_field: "nome", options_value_field: "id",
  relation_entity: "", relation_display_field: "nome", formula: "",
  calculation_builder: { items: [{ field: "", operator: "*" }, { field: "", operator: "*" }] },
  campos_dependentes: [], usar_decimal: false, decimal_places: 2, usar_mascara: false, mascaras_text: ""
};

const FILTER_POPOVER_WIDTH = 272;
const FILTER_ICON_CLASS = "w-3 h-3 shrink-0";

const CAMPO_CONFIG_FIELD_BOX =
  "border-[0.5px] border-[#c5ced8] rounded-[2px] bg-white focus-within:border-[#21c45d] transition-colors overflow-hidden [&_input]:h-[22px] [&_input]:border-0 [&_input]:rounded-none [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_button]:h-[22px] [&_button]:border-0 [&_button]:rounded-none [&_button]:shadow-none [&_textarea]:min-h-[48px] [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:shadow-none [&_textarea]:focus-visible:ring-0";

function Field({ label, children, required = false, wide = false, compact = false, medium = false }) {
  return (
    <div className={`grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1 ${wide ? "md:col-span-2" : ""}`}>
      <label className="text-[12px] text-[#1a1f26] text-right leading-none">
        {label}:{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className={`${wide ? "min-h-6" : "h-6"} ${medium ? "w-64 max-w-full" : compact ? "w-44 max-w-full" : "w-full"} ${CAMPO_CONFIG_FIELD_BOX}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function EmpConfiguracaoCamposDialog({
  open,
  onOpenChange,
  inline = false,
  initialFieldName = null,
  repository,
  empresas = [],
}) {
  if (!repository) {
    throw new Error("EmpConfiguracaoCamposDialog requer prop repository.");
  }
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCampoIds, setSelectedCampoIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [noticeDialog, setNoticeDialog] = useState({ open: false, title: "", description: "", type: "warning", onConfirm: null, confirmText: "Entendi", cancelText: "" });
  const initialFieldAppliedRef = useRef(false);
  const [sortConfig, setSortConfig] = useState({ key: "campo", direction: "asc" });
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(null);
  const [buscaFiltroMenu, setBuscaFiltroMenu] = useState("");
  const [filtroTemp, setFiltroTemp] = useState({ colunaId: null, valores: [] });
  const [filtrosColunas, setFiltrosColunas] = useState({});
  const tableStageRef = useRef(null);
  const filterAnchorRefs = useRef({});
  const filterPanelRef = useRef(null);
  const [filterAnchorRect, setFilterAnchorRect] = useState(null);

  const { data: campos = [], isLoading, isFetching, isFetched } = useQuery({
    queryKey: ["emp-campos-personalizados", "config"],
    queryFn: () => repository.listCamposPersonalizados("config"),
    enabled: open,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    initialData: []
  });

  const camposCalculo = useMemo(() => montarCamposDisponiveis(campos, editingId), [campos, editingId]);
  const selectedCampoId = selectedCampoIds[0] || null;
  const selectedCampo = campos.find((c) => (c.id || c.field_id) === selectedCampoId) || campos[0] || null;
  const selectedIndex = Math.max(0, campos.findIndex((c) => (c.id || c.field_id) === (selectedCampo?.id || selectedCampo?.field_id)));
  const selectedHasNativeField = selectedCampoIds.some((id) => campos.find((c) => (c.id || c.field_id) === id)?.metadata?.native_select);
  const calculationItems = form.calculation_builder?.items || [];
  const hasInvalidCalculation = form.tipo === "calculado" && (calculationItems.length < 2 || calculationItems.some((i) => !i.field) || new Set(calculationItems.map((i) => i.field).filter(Boolean)).size !== calculationItems.map((i) => i.field).filter(Boolean).length);
  const isReadOnly = !!editingId && !isDuplicating && !editMode;
  const isNativeSelect = !!form.metadata?.native_select;

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = buildPayload();
      return editingId ? repository.updateCampoPersonalizado(editingId, payload) : repository.createCampoPersonalizado(payload);
    },
    onMutate: () => {
      const payload = buildPayload();
      const wasEditing = !!editingId;
      const optimisticId = editingId || `pending-${crypto.randomUUID()}`;
      const optimistic = { ...payload, id: optimisticId, field_id: optimisticId };
      const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-campos-personalizados"] });

      patchCamposCache(queryClient, (items) => {
        const exists = items.some((item) => getCampoId(item) === optimisticId);
        if (exists) {
          return items.map((item) => (getCampoId(item) === optimisticId ? { ...item, ...optimistic } : item));
        }
        return [...items, optimistic];
      });

      loadCampoForm(optimistic);
      setEditMode(false);
      toast.success(wasEditing ? "Campo atualizado." : "Campo criado.");

      return { cacheSnapshot, optimisticId, wasEditing };
    },
    onSuccess: (saved, _vars, context) => {
      const savedId = saved?.id || context?.optimisticId;
      patchCamposCache(queryClient, (items) => {
        const withoutPending = items.filter((item) => getCampoId(item) !== context?.optimisticId);
        const exists = withoutPending.some((item) => getCampoId(item) === savedId);
        if (exists) {
          return withoutPending.map((item) => (getCampoId(item) === savedId ? { ...item, ...saved } : item));
        }
        return [...withoutPending, saved];
      });
      if (saved) loadCampoForm(saved);
    },
    onError: (error, _vars, context) => {
      context?.cacheSnapshot?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      showNotice({
        title: "Erro ao salvar campo",
        description: error?.data?.message || error?.message || "Não foi possível salvar o campo.",
        type: "danger",
      });
    },
  });

  const deleteCampoOptimistic = (campo, { onAfterRemove } = {}) => {
    const campoId = getCampoId(campo);
    const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-campos-personalizados"] });

    patchCamposCache(queryClient, (items) => items.filter((item) => getCampoId(item) !== campoId));
    onAfterRemove?.();

    void repository
      .deleteCampoPersonalizado(campo)
      .then(() => {
        toast.success("Campo excluído.");
      })
      .catch((error) => {
        cacheSnapshot.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
        showNotice({
          title: "Erro ao excluir",
          description: error?.data?.message || error?.message || "Não foi possível excluir.",
          type: "danger",
        });
      });
  };

  const showNotice = ({ title, description, type = "warning", onConfirm = null, confirmText = "Entendi", cancelText = "" }) => setNoticeDialog({ open: true, title, description, type, onConfirm, confirmText, cancelText });

  const buildPayload = () => {
    const items = form.calculation_builder?.items || [];
    const formula = form.tipo === "calculado" ? montarFormulaVisual(items) : "";
    const deps = items.map((i) => i.field).filter(Boolean);
    const protectedOptions = form.metadata?.protected_options || [];
    const hasManual = ["select", "option_list"].includes(form.tipo);
    const manualOptions = hasManual ? [...new Set([...protectedOptions, ...String(form.options_text || "").split("\n").map((i) => i.trim().toUpperCase()).filter(Boolean)])].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" })).map((i) => ({ value: i, label: i, protected: protectedOptions.includes(i) })) : [];
    return { ...form, field_name: editingId ? form.field_name : toSnakeCase(form.label), aplicacao_modo: form.aplicacao_modo || (form.empresa_id ? "empresa" : "todas"), empresa_id: form.aplicacao_modo === "empresa" ? form.empresa_id : null, metadata: form.metadata || {}, col_span: 12, largura_coluna: 160, ordem_tabela: 999, read_only: form.tipo === "calculado", ordenavel: true, filtravel: !["textarea"].includes(form.tipo), alinhamento: form.tipo === "number" && form.usar_mascara ? "left" : ["number", "calculado"].includes(form.tipo) ? "right" : "left", options: manualOptions, options_text: hasManual ? manualOptions.map((o) => o.label).join("\n") : "", options_source: "", agregacao_tipo: form.tipo === "number" && form.usar_mascara ? undefined : form.agregacao_tipo === "none" ? undefined : form.agregacao_tipo, agregacao_campo_base: "", formula, calculation_builder: { items }, campos_dependentes: deps, dependencias: deps, decimal_places: Math.min(6, Math.max(0, Number(form.decimal_places) || 0)), usar_decimal: ["number", "calculado"].includes(form.tipo) && !form.usar_mascara && !!form.usar_decimal, usar_mascara: form.tipo === "number" && !form.usar_decimal && !!form.usar_mascara, mascaras_text: form.tipo === "number" && form.usar_mascara ? String(form.mascaras_text || "").split("\n").map((i) => i.trim()).filter(Boolean).join("\n") : "", visivel_form: true, label: toTitleCase(form.label), placeholder: String(form.placeholder || "").toUpperCase(), descricao: String(form.descricao || "").toUpperCase() };
  };

  const resetForm = () => { setForm(initialForm); setEditingId(null); setIsDirty(false); setIsDuplicating(false); setEditMode(false); setShowForm(false); };
  const handleToggleView = () => { if (showForm) { resetForm(); return; } if (selectedCampo && selectedCampoIds.length <= 1) handleEdit(selectedCampo); };
  const handleRowSelect = (campo, event) => {
    if (event?.target?.closest?.("button, input, [role='checkbox'], [data-radix-popper-content-wrapper]")) return;
    const id = campo.id || campo.field_id;
    if (event?.ctrlKey || event?.metaKey) {
      setSelectedCampoIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
      return;
    }
    if (selectedCampoIds.length === 1 && selectedCampoIds[0] === id) {
      setSelectedCampoIds([]);
      return;
    }
    setSelectedCampoIds([id]);
  };
  const navigateCampo = (index) => { const ni = Math.min(Math.max(index, 0), Math.max(campos.length - 1, 0)); const c = campos[ni]; if (!c) return; setSelectedCampoIds([c.id || c.field_id]); handleEdit(c); };
  const handleNew = () => { setForm(initialForm); setEditingId(null); setSelectedCampoIds([]); setIsDirty(true); setIsDuplicating(false); setEditMode(true); setShowForm(true); };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isReadOnly) return;
    const labelTrim = form.label.trim().toUpperCase();
    const fieldName = editingId ? form.field_name : toSnakeCase(labelTrim);
    if (!labelTrim || !fieldName) return showNotice({ title: "Campo obrigatório", description: "Informe o nome do campo.", confirmText: null });
    const dup = campos.find((c) => c.id !== editingId && (String(c.label || "").trim().toUpperCase() === labelTrim || String(c.field_name || "").toLowerCase() === fieldName.toLowerCase()));
    if (dup) return showNotice({ title: "Campo duplicado", description: `Já existe um campo "${dup.label}".`, confirmText: null });
    if (form.tipo === "calculado" && hasInvalidCalculation) return showNotice({ title: "Cálculo incompleto", description: "Complete o cálculo com campos diferentes.", confirmText: null });
    if (form.tipo === "relation" && !form.relation_entity) return showNotice({ title: "Cadastro relacionado", description: "Selecione o cadastro relacionado.", confirmText: null });
    if (["select", "option_list"].includes(form.tipo)) {
      const opts = [...(form.metadata?.protected_options || []), ...String(form.options_text || "").split("\n")].map((i) => i.trim().toUpperCase()).filter(Boolean);
      if (opts.length === 0) return showNotice({ title: "Opções obrigatórias", description: "Informe pelo menos uma opção.", confirmText: null });
    }
    if (form.aplicacao_modo === "empresa" && !form.empresa_id) {
      return showNotice({ title: "Empresa obrigatória", description: "Selecione a empresa para campos específicos.", confirmText: null });
    }
    saveMutation.mutate();
  };

  const updateForm = (field, value) => {
    if (isReadOnly) return;
    if (isNativeSelect && field !== "options_text") return;
    setIsDirty(true);
    const upper = ["placeholder", "descricao"];
    const finalValue = upper.includes(field) && typeof value === "string" ? value.toUpperCase() : value;
    setForm((prev) => {
      const next = { ...prev, [field]: finalValue, ...(field === "label" && !editingId ? { field_name: toSnakeCase(finalValue) } : {}) };
      if (field === "usar_decimal" && value) { next.usar_mascara = false; next.mascaras_text = ""; }
      if (field === "usar_mascara" && value) { next.usar_decimal = false; next.agregacao_tipo = "none"; }
      if (field === "tipo") { next.agregacao_tipo = "none"; next.usar_decimal = ["number", "calculado"].includes(value); next.usar_mascara = false; next.mascaras_text = ""; next.read_only = value === "calculado"; next.visivel_form = value !== "calculado"; if (!["select", "option_list"].includes(value)) { next.options = []; next.options_text = ""; } next.options_source_entity = ""; next.options_label_field = "nome"; next.options_value_field = "id"; if (value !== "relation") { next.relation_entity = ""; next.relation_display_field = "nome"; } if (value !== "calculado") { next.calculation_builder = initialForm.calculation_builder; next.formula = ""; next.campos_dependentes = []; } }
      return next;
    });
  };

  const loadCampoForm = (campo) => {
    const items = campo.calculation_builder?.items || (campo.campos_dependentes || []).map((f, i) => ({ field: f, operator: i === 0 ? "*" : "*" }));
    setEditingId(campo.id || campo.field_id); setSelectedCampoIds([campo.id || campo.field_id]); setIsDirty(false); setIsDuplicating(false); setEditMode(false); setShowForm(true);
    setForm({ ...initialForm, ...campo, aplicacao_modo: campo.empresa_id ? "empresa" : "todas", empresa_id: campo.empresa_id || null, options_text: campo.options_text || (campo.options || []).map((o) => o.label || o.value || o).join("\n"), agregacao_tipo: campo.agregacao_tipo || campo.agregacao || "none", calculation_builder: { items: items.length ? items : initialForm.calculation_builder.items }, usar_decimal: !!campo.usar_decimal, decimal_places: campo.decimal_places ?? 2, usar_mascara: !!campo.usar_mascara, mascaras_text: campo.mascaras_text || "" });
  };

  React.useEffect(() => {
    if (!open) {
      initialFieldAppliedRef.current = false;
      return;
    }
    if (!initialFieldName || initialFieldAppliedRef.current) return;
    if (!isFetched || isFetching) return;

    const normalizedName = String(initialFieldName).toLowerCase();
    const campo =
      campos.find((item) => String(item.field_name || "").toLowerCase() === normalizedName) ||
      campos.find((item) => String(item.id || item.field_id || "").toLowerCase() === normalizedName);

    if (campo) {
      loadCampoForm(campo);
      initialFieldAppliedRef.current = true;
    }
  }, [open, initialFieldName, campos, isFetched, isFetching]);

  const handleEdit = (campo) => loadCampoForm(campo);
  const handleDiscard = () => { if (editingId && !isDuplicating) { const orig = campos.find((c) => c.id === editingId); if (orig) { loadCampoForm(orig); return; } } const prev = campos.find((c) => (c.id || c.field_id) === selectedCampoIds[0]); if (prev) { loadCampoForm(prev); return; } if (campos.length > 0) { loadCampoForm(campos[0]); return; } resetForm(); };
  const handleDeleteCurrent = () => {
    if (!selectedCampo) return;
    showNotice({
      title: "Confirmar exclusão",
      description: `Excluir o campo "${selectedCampo.label}"?`,
      type: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: () => deleteCampoOptimistic(selectedCampo, { onAfterRemove: resetForm }),
    });
  };
  const handleDeleteSelected = () => {
    const sel = campos.filter((c) => selectedCampoIds.includes(c.id || c.field_id));
    if (!sel.length) return;
    showNotice({
      title: "Confirmar exclusão",
      description: sel.length === 1 ? `Excluir "${sel[0].label}"?` : `Excluir ${sel.length} campos?`,
      type: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: () => {
        const ids = new Set(sel.map((c) => getCampoId(c)));
        const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-campos-personalizados"] });

        patchCamposCache(queryClient, (items) => items.filter((item) => !ids.has(getCampoId(item))));
        setSelectedCampoIds([]);

        void Promise.all(sel.map((c) => repository.deleteCampoPersonalizado(c)))
          .then(() => {
            toast.success(sel.length === 1 ? "Campo excluído." : `${sel.length} campos excluídos.`);
          })
          .catch((error) => {
            cacheSnapshot.forEach(([key, value]) => {
              queryClient.setQueryData(key, value);
            });
            showNotice({
              title: "Erro ao excluir",
              description: error?.data?.message || error?.message || "Não foi possível excluir.",
              type: "danger",
            });
          });
      },
    });
  };
  const handleDuplicateCurrent = () => { if (!selectedCampo) return; const { id, field_id, created_date, updated_date, created_by, ...copy } = selectedCampo; setForm({ ...initialForm, ...copy, options_text: copy.options_text || (copy.options || []).map((o) => o.label || o.value || o).join("\n"), label: `${selectedCampo.label || "Campo"} - Cópia`, field_name: "", agregacao_tipo: selectedCampo.agregacao_tipo || selectedCampo.agregacao || "none", usar_decimal: !!selectedCampo.usar_decimal, decimal_places: selectedCampo.decimal_places ?? 2, usar_mascara: !!selectedCampo.usar_mascara, mascaras_text: selectedCampo.mascaras_text || "" }); setEditingId(null); setSelectedCampoIds([]); setIsDirty(true); setIsDuplicating(true); setEditMode(true); setShowForm(true); };

  const getTipoLabel = (campo) => TIPOS_CAMPO.find((tipo) => tipo.value === campo.tipo)?.label || campo.tipo || "";
  const getUsoItems = (campo) => {
    const items = [];
    if (!campo.empresa_id) items.push("GLOBAL");
    else items.push(`EMP ${campo.codempresa || ""}`.trim());
    if (campo.metadata?.native_select) items.push("NATIVA");
    if (campo.visivel_form) items.push("FORM");
    if (campo.visivel_tabela) items.push("TABELA");
    if (campo.options_source_entity || campo.relation_entity) items.push("VINCULO");
    if (campo.agregacao_tipo || campo.agregacao) items.push("TOTAL");
    if (campo.usar_decimal) items.push(`${campo.decimal_places ?? 2} DEC.`);
    if (campo.usar_mascara) items.push("MASCARA");
    return items;
  };
  const getColumnValue = (campo, colunaId) => {
    if (colunaId === "campo") return String(campo.label || "");
    if (colunaId === "tipo") return String(getTipoLabel(campo) || "");
    if (colunaId === "uso") return getUsoItems(campo).join(", ");
    return "";
  };
  const tableColumns = useMemo(() => [
    { id: "campo", label: "Campo", widthClass: "w-[260px]" },
    { id: "tipo", label: "Tipo", widthClass: "w-[150px]" },
    { id: "uso", label: "Uso", widthClass: "" },
  ], []);
  const columnOptions = useMemo(() => {
    const next = {};
    tableColumns.forEach((coluna) => {
      next[coluna.id] = Array.from(new Set(campos.map((campo) => getColumnValue(campo, coluna.id)).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    });
    return next;
  }, [campos, tableColumns]);
  const getValoresFiltro = (colunaId) => filtrosColunas[colunaId] || [];
  const setValoresFiltro = (colunaId, valores) => {
    setFiltrosColunas((prev) => ({ ...prev, [colunaId]: [...new Set(valores)] }));
  };
  const clearColumnFilter = (colunaId) => {
    setFiltrosColunas((prev) => {
      const next = { ...prev };
      delete next[colunaId];
      return next;
    });
  };
  const hasActiveFilter = (colunaId) => getValoresFiltro(colunaId).length > 0;
  const handleSort = (key) => setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  const camposFiltradosOrdenados = useMemo(() => {
    const filtrados = campos.filter((campo) =>
      tableColumns.every((coluna) => {
        const filtro = filtrosColunas[coluna.id] || [];
        if (!filtro.length) return true;
        return filtro.includes(getColumnValue(campo, coluna.id));
      })
    );
    return [...filtrados].sort((a, b) => {
      const aValue = getColumnValue(a, sortConfig.key);
      const bValue = getColumnValue(b, sortConfig.key);
      const compare = String(aValue).localeCompare(String(bValue), "pt-BR", { sensitivity: "base", numeric: true });
      return sortConfig.direction === "asc" ? compare : -compare;
    });
  }, [campos, filtrosColunas, tableColumns, sortConfig]);
  const renderFilterIcon = (active) =>
    active
      ? <FilterX className={FILTER_ICON_CLASS} strokeWidth={2} />
      : <Filter className={FILTER_ICON_CLASS} strokeWidth={2} />;

  const getRowBgClass = (index, selected) => {
    if (selected) return "emp-row-selected";
    return index % 2 === 0 ? "emp-row-even" : "emp-row-odd";
  };

  const closeFilterMenu = () => {
    setMenuFiltroAberto(null);
    setFilterAnchorRect(null);
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId: null, valores: [] });
  };

  const getFilterPanelRect = (colunaId) => {
    const el = filterAnchorRefs.current[colunaId];
    const stage = tableStageRef.current;
    if (!el || !stage) return null;
    const rect = el.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const padding = 8;
    const maxLeft = stageRect.width - FILTER_POPOVER_WIDTH - padding;
    const left = Math.min(Math.max(rect.right - FILTER_POPOVER_WIDTH - stageRect.left, padding), maxLeft);
    const top = rect.bottom + 6 - stageRect.top;
    return { columnId: colunaId, left, top, width: rect.width, height: rect.height };
  };

  const openFilterMenu = (colunaId) => {
    setFilterAnchorRect(getFilterPanelRect(colunaId));
    setMenuFiltroAberto(colunaId);
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId, valores: [...getValoresFiltro(colunaId)] });
  };

  const toggleFilterMenu = (colunaId) => {
    if (menuFiltroAberto === colunaId) {
      closeFilterMenu();
      return;
    }
    openFilterMenu(colunaId);
  };

  const updateFilterAnchorRect = () => {
    if (!menuFiltroAberto) {
      setFilterAnchorRect(null);
      return;
    }
    setFilterAnchorRect(getFilterPanelRect(menuFiltroAberto));
  };

  React.useLayoutEffect(() => {
    updateFilterAnchorRect();
    if (!menuFiltroAberto) return undefined;
    const onReflow = () => updateFilterAnchorRect();
    const raf = requestAnimationFrame(updateFilterAnchorRect);
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [menuFiltroAberto, tableColumns]);

  React.useEffect(() => {
    if (!menuFiltroAberto) return undefined;
    const onPointerDown = (event) => {
      const panel = filterPanelRef.current;
      const anchor = filterAnchorRefs.current[menuFiltroAberto];
      if (panel?.contains(event.target) || anchor?.contains(event.target)) return;
      closeFilterMenu();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeFilterMenu();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuFiltroAberto]);

  const renderFilterPopoverContent = (colunaId) => {
    const coluna = tableColumns.find((col) => col.id === colunaId);
    const options = columnOptions[colunaId] || [];
    const valoresSelecionados = filtroTemp.colunaId === colunaId ? filtroTemp.valores : getValoresFiltro(colunaId);
    const filteredOptions = options.filter((option) => String(option).toLowerCase().includes(buscaFiltroMenu.toLowerCase()));
    const allVisibleSelected = filteredOptions.length > 0 && filteredOptions.every((option) => valoresSelecionados.includes(option));
    const closeFilter = closeFilterMenu;

    return (
      <div
        ref={filterPanelRef}
        className="emp-filter-popover absolute p-0 z-[9999]"
        style={{ left: filterAnchorRect?.left ?? 0, top: filterAnchorRect?.top ?? 0 }}
      >
        <div className="emp-filter-sort-section">
          <button
            type="button"
            className="emp-filter-sort-btn"
            onClick={() => { setSortConfig({ key: colunaId, direction: "asc" }); closeFilter(); }}
          >
            <ArrowDownAZ className="w-4 h-4 mr-2 shrink-0" />
            <span>Classificar do Menor para o Maior</span>
          </button>
          <button
            type="button"
            className="emp-filter-sort-btn"
            onClick={() => { setSortConfig({ key: colunaId, direction: "desc" }); closeFilter(); }}
          >
            <ArrowUpZA className="w-4 h-4 mr-2 shrink-0" />
            <span>Classificar do Maior para o Menor</span>
          </button>
          <button
            type="button"
            className="emp-filter-sort-btn"
            disabled={!hasActiveFilter(colunaId)}
            onClick={() => { clearColumnFilter(colunaId); closeFilter(); }}
          >
            <X className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">Limpar Filtro de &apos;{coluna?.label || colunaId}&apos;</span>
          </button>
        </div>

        <div className="emp-filter-body">
          <input
            value={buscaFiltroMenu}
            onChange={(event) => setBuscaFiltroMenu(event.target.value)}
            placeholder="PESQUISAR"
            className="emp-filter-field emp-filter-search"
          />

          <div className="emp-filter-value-list">
            <label className="emp-filter-value-list-header">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={(checked) => {
                  setFiltroTemp((prev) => {
                    const restantes = prev.valores.filter((value) => !filteredOptions.includes(value));
                    return { ...prev, valores: checked ? [...new Set([...restantes, ...filteredOptions])] : restantes };
                  });
                }}
                className="emp-filter-checkbox"
              />
              <span className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap">(Selecionar Tudo)</span>
            </label>
            {filteredOptions.map((option) => (
              <label key={option} className="emp-filter-value-list-item">
                <Checkbox
                  checked={valoresSelecionados.includes(option)}
                  onCheckedChange={(checked) => {
                    setFiltroTemp((prev) => ({ ...prev, valores: checked ? [...prev.valores, option] : prev.valores.filter((item) => item !== option) }));
                  }}
                  className="emp-filter-checkbox"
                />
                <span className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={option}>{option}</span>
              </label>
            ))}
          </div>

          <div className="emp-filter-actions">
            <button
              type="button"
              title="Aplicar filtro"
              className={EMP_TOOLBAR_BTN}
              onClick={() => { setValoresFiltro(colunaId, filtroTemp.valores); closeFilter(); }}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Cancelar"
              className={EMP_TOOLBAR_BTN}
              onClick={closeFilter}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const operationLabel = isDuplicating
    ? "NOVO REGISTRO DUPLICADO"
    : editingId
      ? editMode
        ? "EDIÇÃO DE REGISTRO"
        : "VISUALIZAÇÃO DE REGISTRO"
      : "NOVO REGISTRO";

  const content = (
    <div className="cadastro-emp-scope emp-campos-config-lote w-full h-full overflow-hidden flex flex-col">
      <TopNoticeDialog open={noticeDialog.open} onOpenChange={(o) => setNoticeDialog((p) => ({ ...p, open: o }))} badge={noticeDialog.type === "danger" ? "EXCLUIR" : "AVISO"} title={noticeDialog.title} description={noticeDialog.description} type={noticeDialog.type} confirmText={noticeDialog.confirmText} cancelText={noticeDialog.cancelText} onConfirm={noticeDialog.onConfirm} />
      {!inline && <DialogHeader className="sr-only"><DialogTitle>Configuração de campos personalizados - Empresas</DialogTitle></DialogHeader>}
      {showForm ?
        <EmpSplitToolbarLayout
          className="h-full min-h-0 flex-1"
          toolbar={
            <LegacyRecordToolbar title={form.label || (editingId ? "EDITAR CAMPO" : "NOVO CAMPO")} badgeLabel="CAMPO PERSONALIZADO" operationLabel={operationLabel} showSaveActions={editMode} showEditAction={isReadOnly} showDeleteDuplicateActions={!!editingId && !editMode && !isDuplicating && !isNativeSelect} onSave={() => handleSubmit({ preventDefault: () => {} })} onCancel={handleDiscard} onEditRecord={() => setEditMode(true)} onToggleView={handleToggleView} onBack={() => onOpenChange(false)} onNew={handleNew} total={campos.length} currentIndex={selectedIndex} onFirst={() => navigateCampo(0)} onPrevious={() => navigateCampo(selectedIndex - 1)} onNext={() => navigateCampo(selectedIndex + 1)} onLast={() => navigateCampo(campos.length - 1)} onDelete={handleDeleteCurrent} onDuplicate={handleDuplicateCurrent} onSettingsClick={() => {}} showUtilityActions={false} addButtonClass="h-7 w-8 rounded-none border-y-0 border-l-0 border-r-[0.5px] border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-600 shadow-none" />
          }
        >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <fieldset className={`form-scroll-container min-h-0 flex-1 overflow-y-auto ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}>
            <div className="px-4 md:px-8 py-2 space-y-1 max-w-[780px]">
              <Field label="Nome do campo" required><Input value={form.label} onChange={(e) => updateForm("label", e.target.value)} readOnly={isNativeSelect} placeholder="EX: CONTATO RESPONSÁVEL" className="h-[22px] text-xs uppercase border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1" /></Field>
              <Field label="Tipo"><EmpAutocomplete items={TIPOS_CAMPO.map((t) => ({ ...t, id: t.value }))} value={form.tipo} onChange={(v) => updateForm("tipo", v)} placeholder="BUSCAR TIPO..." displayField="label" searchFields={["label", "value"]} disabled={isNativeSelect} readOnly={isNativeSelect} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1 uppercase" /></Field>
              <Field label="Texto de ajuda"><Input value={form.placeholder} onChange={(e) => updateForm("placeholder", e.target.value)} placeholder="TEXTO MOSTRADO NO CAMPO" className="h-[22px] text-xs uppercase border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1" /></Field>
              <Field label="Descrição"><Input value={form.descricao} onChange={(e) => updateForm("descricao", e.target.value)} placeholder="EXPLICAÇÃO OPCIONAL" className="h-[22px] text-xs uppercase border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1" /></Field>
              <div className="grid grid-cols-[190px_minmax(0,1fr)] items-start gap-1">
                <span className="text-[12px] text-[#1a1f26] text-right leading-none pt-1">Aplicação do Campo:</span>
                <div className="space-y-2 py-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="radio" name="aplicacao_modo" checked={form.aplicacao_modo !== "empresa"} disabled={isReadOnly} onChange={() => updateForm("aplicacao_modo", "todas")} />
                    Todas as Empresas do Cliente
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="radio" name="aplicacao_modo" checked={form.aplicacao_modo === "empresa"} disabled={isReadOnly} onChange={() => updateForm("aplicacao_modo", "empresa")} />
                    Empresa Específica
                  </label>
                  {form.aplicacao_modo === "empresa" ? (
                    <select
                      className="h-7 w-full max-w-md border border-slate-300 px-2 text-xs"
                      value={form.empresa_id || ""}
                      disabled={isReadOnly}
                      onChange={(event) => updateForm("empresa_id", event.target.value || null)}
                    >
                      <option value="">Selecionar Empresa</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.codempresa} - {empresa.nome_empresa || empresa.razao_social}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </div>
              {["select", "option_list"].includes(form.tipo) && <EmpManualOptionsConfig form={form} updateForm={updateForm} />}
              {form.tipo === "relation" && <EmpRelationConfig form={form} updateForm={updateForm} mode="relation" />}
              {form.tipo === "calculado" && <EmpCalculationBuilder value={form.calculation_builder?.items || []} fields={camposCalculo} onChange={(items) => updateForm("calculation_builder", { items })} />}
              <EmpDecimalConfig form={form} updateForm={updateForm} />
              <EmpMaskConfig form={form} updateForm={updateForm} />
              <Field label="Prévia" wide><div className="px-2 py-1 text-xs text-slate-700 uppercase bg-slate-50 min-h-[48px]">{form.label || "Nome do campo"}: {form.tipo === "calculado" ? montarFormulaVisual(form.calculation_builder?.items || []) || "Calculado automaticamente" : form.placeholder || "Valor do campo"}</div></Field>
              <div className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1 pt-1">
                <span className="text-[12px] text-[#1a1f26] text-right leading-none">Exibir em:</span>
                <div className="flex items-center gap-4">
                  {[["obrigatorio", "Obrigatório"], ["visivel_tabela", "Tabela"], ["visivel_relatorio", "Relatório"]].map(([field, label]) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => !isReadOnly && updateForm(field, !form[field])}
                      className="h-[22px] flex items-center gap-1.5 bg-transparent"
                    >
                      <span className="text-[12px] text-[#1a1f26]">{label}:</span>
                      <ToggleSwitch className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" checked={!!form[field]} onChange={(checked) => updateForm(field, checked)} disabled={isReadOnly} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>
        </form>
        </EmpSplitToolbarLayout>
        :
        <EmpSplitToolbarLayout
          className="h-full min-h-0 flex-1"
          toolbar={
            <SankhyaListToolbar viewMode="table" total={campos.length} currentIndex={selectedIndex} onNew={handleNew} onToggleView={handleToggleView} onBack={() => onOpenChange(false)} toggleViewDisabled={!selectedCampo || selectedCampoIds.length > 1} onDelete={selectedHasNativeField ? undefined : handleDeleteSelected} onSettingsClick={() => {}} onAttachClick={() => {}} attachDisabled selectedCount={selectedCampoIds.length} title="Campos Personalizados" recordLabel="" showUtilityActions={false} showSearch={false} addButtonClass="h-7 w-8 rounded-none border-y-0 border-l-0 border-r-[0.5px] border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-600 shadow-none" />
          }
        >
          <div className="emp-table-panel flex min-h-0 flex-1 flex-col overflow-hidden p-1.5">
            <div ref={tableStageRef} className={`emp-table-stage relative h-full min-h-0 ${menuFiltroAberto ? "overflow-visible" : "overflow-hidden"}`}>
              <div className="emp-table-shell flex h-full min-h-0 flex-col overflow-hidden bg-white shadow-none">
                <div className="emp-campos-config-table-wrap min-h-0 flex-1 overflow-auto">
                <Table className="emp-table-pro w-full min-w-[760px] border-separate border-spacing-0 table-fixed select-none">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {tableColumns.map((coluna) => {
                        const isColFiltered = hasActiveFilter(coluna.id);
                        const isFilterOpen = menuFiltroAberto === coluna.id;
                        return (
                          <TableHead
                            key={coluna.id}
                            className={`emp-th group relative sticky top-0 align-middle px-1.5 whitespace-nowrap h-[26px] py-0 select-none cursor-pointer z-40 ${coluna.widthClass}`}
                            onDoubleClick={() => handleSort(coluna.id)}
                          >
                            <div className="emp-th-label-wrap flex items-center w-full h-full leading-[26px] whitespace-nowrap overflow-hidden">
                              <span className="emp-th-label truncate font-semibold">{coluna.label}</span>
                            </div>
                            <div className="emp-th-controls absolute right-1 top-1/2 -translate-y-1/2 z-50 flex items-center gap-0.5" onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
                              <span
                                ref={(el) => {
                                  if (el) filterAnchorRefs.current[coluna.id] = el;
                                  else delete filterAnchorRefs.current[coluna.id];
                                }}
                                role="button"
                                tabIndex={0}
                                className={`emp-header-filter-icon inline-flex h-3 w-3 shrink-0 items-center justify-center cursor-pointer text-[#082e54] ${isColFiltered || isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"}`}
                                title={isColFiltered ? "Duplo clique para limpar filtro" : "Filtrar coluna"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleFilterMenu(coluna.id);
                                }}
                                onDoubleClick={(event) => {
                                  event.stopPropagation();
                                  if (!isColFiltered) return;
                                  clearColumnFilter(coluna.id);
                                  closeFilterMenu();
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    toggleFilterMenu(coluna.id);
                                  }
                                }}
                              >
                                {renderFilterIcon(isColFiltered)}
                              </span>
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isLoading || (isFetching && campos.length === 0))
                      ? <TableRow><TableCell colSpan={3} className="emp-td text-center py-8 text-xs text-slate-400">Carregando...</TableCell></TableRow>
                      : campos.length === 0
                        ? <TableRow><TableCell colSpan={3} className="emp-td text-center py-8 text-xs text-slate-400">Nenhum campo criado.</TableCell></TableRow>
                        : camposFiltradosOrdenados.length === 0
                          ? <TableRow><TableCell colSpan={3} className="emp-td text-center py-8 text-xs text-slate-400">Nenhum campo encontrado para os filtros aplicados.</TableCell></TableRow>
                          : camposFiltradosOrdenados.map((campo, index) => {
                            const id = campo.id || campo.field_id;
                            const isSelected = selectedCampoIds.includes(id);
                            const rowClass = getRowBgClass(index, isSelected);
                            return (
                              <TableRow key={id} className={`${rowClass} h-[26px] transition-colors cursor-pointer select-none hover:brightness-[0.98]`} onClick={(e) => handleRowSelect(campo, e)} onDoubleClick={() => selectedCampoIds.length <= 1 && handleEdit(campo)}>
                                <TableCell className={`emp-td py-0 h-[26px] leading-[26px] text-[12px] align-middle whitespace-nowrap overflow-hidden text-ellipsis select-none px-1.5 ${rowClass} ${isSelected ? "font-semibold" : ""}`}>
                                  {campo.label}
                                </TableCell>
                                <TableCell className={`emp-td py-0 h-[26px] leading-[26px] text-[12px] align-middle whitespace-nowrap overflow-hidden text-ellipsis select-none px-1.5 ${rowClass} ${isSelected ? "font-semibold" : ""}`}>
                                  {TIPOS_CAMPO.find((t) => t.value === campo.tipo)?.label || campo.tipo}
                                </TableCell>
                                <TableCell className={`emp-td py-0 h-[26px] leading-[26px] text-[12px] align-middle whitespace-nowrap overflow-hidden select-none px-1.5 ${rowClass} ${isSelected ? "font-semibold" : ""}`}>
                                  <div className="h-[26px] flex items-center gap-1 overflow-hidden">
                                    {campo.metadata?.native_select && <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none">Nativa</Badge>}
                                    {campo.visivel_form && <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 leading-none bg-white/90 text-slate-700">Form</Badge>}
                                    {campo.visivel_tabela && <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 leading-none bg-white/90 text-slate-700">Tabela</Badge>}
                                    {(campo.options_source_entity || campo.relation_entity) && <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none">Vínculo</Badge>}
                                    {(campo.agregacao_tipo || campo.agregacao) && <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none">Total</Badge>}
                                    {campo.usar_decimal && <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none">{campo.decimal_places ?? 2} dec.</Badge>}
                                    {campo.usar_mascara && <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none">Máscara</Badge>}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                  </TableBody>
                </Table>
                </div>
              </div>
              {menuFiltroAberto && filterAnchorRect?.columnId === menuFiltroAberto && renderFilterPopoverContent(menuFiltroAberto)}
            </div>
          </div>
        </EmpSplitToolbarLayout>
      }
    </div>
  );

  if (inline) return open ? content : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cadastro-emp-scope !fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !w-screen !max-w-none !h-screen !max-h-none overflow-hidden flex flex-col !p-0 !rounded-none">
        {content}
      </DialogContent>
    </Dialog>
  );
}