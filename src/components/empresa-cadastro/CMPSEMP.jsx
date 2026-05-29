// CMPSEMP = Configuração de Campos Personalizados de Empresa
// Padrão idêntico ao ConfiguracaoCamposLoteDialog, mas para EmpresaCadastro
import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import AutocompleteGenerico from "@/components/financeiro/AutocompleteGenerico";
import LegacyRecordToolbar from "@/components/lotes/LegacyRecordToolbar";
import SankhyaListToolbar from "@/components/common/SankhyaListToolbar";
import TopNoticeDialog from "@/components/common/TopNoticeDialog";
import ManualSelectOptionsConfig from "@/components/lotes/ManualSelectOptionsConfig";
import GuidedRelationConfig from "@/components/lotes/GuidedRelationConfig";
import VisualCalculationBuilder from "@/components/lotes/VisualCalculationBuilder";
import DecimalConfig from "@/components/lotes/DecimalConfig";
import MaskConfig from "@/components/lotes/MaskConfig";
import { montarFormulaVisual } from "@/components/lotes/camposConfigOptions";
import empresaCadastroRepository from "./empresaCadastroRepository";

const TIPOS_CAMPO = [
  { value: "text", label: "Texto" }, { value: "textarea", label: "Observação" }, { value: "number", label: "Número" },
  { value: "date", label: "Data" }, { value: "datetime", label: "Data e Hora" }, { value: "time", label: "Hora" },
  { value: "select", label: "Lista de seleção" }, { value: "option_list", label: "Lista de opções" },
  { value: "relation", label: "Relação com cadastro" }, { value: "calculado", label: "Calculado" }
];

const toSnakeCase = v => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
const toTitleCase = v => String(v || "").toLowerCase().replace(/(^|\s)([a-záàâãéèêíïóôõöúçñ])/g, m => m.toUpperCase());

const INITIAL = { label: "", field_name: "", placeholder: "", descricao: "", tipo: "text", col_span: 12, largura_coluna: 160, ordem_tabela: 999, obrigatorio: false, read_only: false, visivel_form: true, visivel_tabela: true, visivel_relatorio: true, ordenavel: true, filtravel: true, alinhamento: "left", agregacao_tipo: "none", options_source_entity: "", options_text: "", options_label_field: "nome", options_value_field: "id", relation_entity: "", relation_display_field: "nome", formula: "", calculation_builder: { items: [{ field: "", operator: "*" }, { field: "", operator: "*" }] }, campos_dependentes: [], usar_decimal: false, decimal_places: 2, usar_mascara: false, mascaras_text: "" };

function Field({ label, children, wide = false, compact = false, required = false }) {
  return (
    <div className={`grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1 ${wide ? "md:col-span-2" : ""}`}>
      <label className="text-[12px] text-slate-600 text-right leading-none">{label}:{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className={`${wide ? "min-h-6" : "h-6"} ${compact ? "w-44 max-w-full" : "w-full"} border border-slate-300 bg-white focus-within:border-green-500 transition-colors overflow-hidden [&_input]:h-[22px] [&_input]:border-0 [&_input]:rounded-none [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_button]:h-[22px] [&_button]:border-0 [&_button]:rounded-none [&_textarea]:min-h-[48px] [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:shadow-none [&_textarea]:focus-visible:ring-0`}>{children}</div>
    </div>
  );
}

export default function CMPSEMP({ open, onOpenChange, inline = false }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notice, setNotice] = useState({ open: false, title: "", description: "", type: "warning", onConfirm: null, confirmText: "Entendi", cancelText: "" });

  const { data: campos = [], isLoading } = useQuery({ queryKey: ["emp-campos-personalizados"], queryFn: () => empresaCadastroRepository.listCamposPersonalizados(), enabled: open, initialData: [] });

  const selectedId = selectedIds[0] || null;
  const selectedCampo = campos.find(c => (c.id || c.field_id) === selectedId) || campos[0] || null;
  const selectedIndex = Math.max(0, campos.findIndex(c => (c.id || c.field_id) === (selectedCampo?.id || selectedCampo?.field_id)));
  const isReadOnly = !!editingId && !isDuplicating && !editMode;
  const hasInvalidCalc = form.tipo === "calculado" && (form.calculation_builder?.items || []).some(i => !i.field);
  const camposCalculo = useMemo(() => campos.filter(c => ["number", "calculado"].includes(c.tipo) && c.id !== editingId).map(c => ({ value: c.field_name, label: c.label })), [campos, editingId]);

  const showNotice = opts => setNotice({ open: true, type: "warning", onConfirm: null, confirmText: "Entendi", cancelText: "", ...opts });

  const buildPayload = () => {
    const items = form.calculation_builder?.items || [];
    const formula = form.tipo === "calculado" ? montarFormulaVisual(items) : "";
    const deps = items.map(i => i.field).filter(Boolean);
    const hasManual = ["select", "option_list"].includes(form.tipo);
    const manualOpts = hasManual ? [...new Set([...String(form.options_text || "").split("\n").map(i => i.trim().toUpperCase()).filter(Boolean)])].map(i => ({ value: i, label: i })) : [];
    return { ...form, field_name: editingId ? form.field_name : toSnakeCase(form.label), col_span: 12, largura_coluna: 160, ordem_tabela: 999, read_only: form.tipo === "calculado", ordenavel: true, filtravel: !["textarea"].includes(form.tipo), alinhamento: form.tipo === "number" && form.usar_mascara ? "left" : ["number", "calculado"].includes(form.tipo) ? "right" : "left", options: manualOpts, options_text: hasManual ? manualOpts.map(o => o.label).join("\n") : "", agregacao_tipo: form.tipo === "number" && form.usar_mascara ? undefined : form.agregacao_tipo === "none" ? undefined : form.agregacao_tipo, formula, calculation_builder: { items }, campos_dependentes: deps, decimal_places: Math.min(6, Math.max(0, Number(form.decimal_places) || 0)), usar_decimal: ["number", "calculado"].includes(form.tipo) && !form.usar_mascara && !!form.usar_decimal, usar_mascara: form.tipo === "number" && !form.usar_decimal && !!form.usar_mascara, mascaras_text: form.tipo === "number" && form.usar_mascara ? String(form.mascaras_text || "").split("\n").map(i => i.trim()).filter(Boolean).join("\n") : "", visivel_form: true, label: toTitleCase(form.label), placeholder: String(form.placeholder || "").toUpperCase(), descricao: String(form.descricao || "").toUpperCase() };
  };

  const saveMutation = useMutation({ mutationFn: () => { const p = buildPayload(); return editingId ? empresaCadastroRepository.updateCampoPersonalizado(editingId, p) : empresaCadastroRepository.createCampoPersonalizado(p); }, onSuccess: async saved => { await queryClient.invalidateQueries({ queryKey: ["emp-campos-personalizados"] }); const updated = await empresaCadastroRepository.listCamposPersonalizados(); const target = updated.find(c => c.id === (saved?.id || editingId)) || saved; if (target) loadForm(target); toast.success(editingId ? "Campo atualizado." : "Campo criado."); } });
  const deleteMutation = useMutation({ mutationFn: campo => empresaCadastroRepository.deleteCampoPersonalizado(campo), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["emp-campos-personalizados"] }); toast.success("Campo excluído."); }, onError: err => showNotice({ title: "Erro", description: err.message || "Não foi possível excluir." }) });

  const reset = () => { setForm(INITIAL); setEditingId(null); setIsDirty(false); setIsDuplicating(false); setEditMode(false); setShowForm(false); };

  const loadForm = campo => {
    const items = campo.calculation_builder?.items || (campo.campos_dependentes || []).map((f, i) => ({ field: f, operator: i === 0 ? "*" : "*" }));
    setEditingId(campo.id || campo.field_id); setSelectedIds([campo.id || campo.field_id]); setIsDirty(false); setIsDuplicating(false); setEditMode(false); setShowForm(true);
    setForm({ ...INITIAL, ...campo, options_text: campo.options_text || (campo.options || []).map(o => o.label || o.value || o).join("\n"), agregacao_tipo: campo.agregacao_tipo || "none", calculation_builder: { items: items.length ? items : INITIAL.calculation_builder.items }, usar_decimal: !!campo.usar_decimal, decimal_places: campo.decimal_places ?? 2, usar_mascara: !!campo.usar_mascara, mascaras_text: campo.mascaras_text || "" });
  };

  const updateForm = (field, value) => {
    if (isReadOnly) return;
    setIsDirty(true);
    const upper = ["placeholder", "descricao"];
    const final = upper.includes(field) && typeof value === "string" ? value.toUpperCase() : value;
    setForm(prev => {
      const next = { ...prev, [field]: final, ...(field === "label" && !editingId ? { field_name: toSnakeCase(final) } : {}) };
      if (field === "usar_decimal" && value) { next.usar_mascara = false; next.mascaras_text = ""; }
      if (field === "usar_mascara" && value) { next.usar_decimal = false; next.agregacao_tipo = "none"; }
      if (field === "tipo") { next.agregacao_tipo = "none"; next.usar_decimal = ["number", "calculado"].includes(value); next.usar_mascara = false; next.mascaras_text = ""; next.read_only = value === "calculado"; next.visivel_form = value !== "calculado"; if (!["select", "option_list"].includes(value)) { next.options = []; next.options_text = ""; } next.options_source_entity = ""; next.options_label_field = "nome"; next.options_value_field = "id"; if (value !== "relation") { next.relation_entity = ""; next.relation_display_field = "nome"; } if (value !== "calculado") { next.calculation_builder = INITIAL.calculation_builder; next.formula = ""; next.campos_dependentes = []; } }
      return next;
    });
  };

  const handleSubmit = e => {
    e.preventDefault(); if (isReadOnly) return;
    const labelTrim = form.label.trim().toUpperCase();
    const fn = editingId ? form.field_name : toSnakeCase(labelTrim);
    if (!labelTrim || !fn) return showNotice({ title: "Campo obrigatório", description: "Informe o nome do campo." });
    const dup = campos.find(c => c.id !== editingId && (String(c.label || "").trim().toUpperCase() === labelTrim || String(c.field_name || "").toLowerCase() === fn.toLowerCase()));
    if (dup) return showNotice({ title: "Campo duplicado", description: `Já existe um campo com o nome "${dup.label}".` });
    if (form.tipo === "calculado" && hasInvalidCalc) return showNotice({ title: "Cálculo incompleto", description: "Complete o cálculo com campos diferentes." });
    if (form.tipo === "relation" && !form.relation_entity) return showNotice({ title: "Cadastro relacionado", description: "Selecione o cadastro relacionado." });
    if (["select", "option_list"].includes(form.tipo) && String(form.options_text || "").split("\n").map(i => i.trim()).filter(Boolean).length === 0) return showNotice({ title: "Opções obrigatórias", description: "Informe pelo menos uma opção." });
    saveMutation.mutate();
  };

  const handleDeleteSelected = () => {
    const sel = campos.filter(c => selectedIds.includes(c.id || c.field_id));
    if (!sel.length) return;
    showNotice({ title: "Confirmar exclusão", description: sel.length === 1 ? `Excluir "${sel[0].label}"?` : `Excluir ${sel.length} campos?`, type: "danger", confirmText: "Excluir", cancelText: "Cancelar", onConfirm: () => { sel.forEach(c => deleteMutation.mutate(c)); setSelectedIds([]); } });
  };

  const handleDeleteCurrent = () => { if (!selectedCampo) return; showNotice({ title: "Confirmar exclusão", description: `Excluir "${selectedCampo.label}"?`, type: "danger", confirmText: "Excluir", cancelText: "Cancelar", onConfirm: () => { deleteMutation.mutate(selectedCampo); reset(); } }); };

  const handleDuplicate = () => {
    if (!selectedCampo) return;
    const { id, field_id, created_date, updated_date, created_by, ...copy } = selectedCampo;
    setForm({ ...INITIAL, ...copy, options_text: copy.options_text || (copy.options || []).map(o => o.label || o.value || o).join("\n"), label: `${selectedCampo.label} - Cópia`, field_name: "", agregacao_tipo: selectedCampo.agregacao_tipo || "none", usar_decimal: !!selectedCampo.usar_decimal, decimal_places: selectedCampo.decimal_places ?? 2, usar_mascara: !!selectedCampo.usar_mascara, mascaras_text: selectedCampo.mascaras_text || "" });
    setEditingId(null); setSelectedIds([]); setIsDirty(true); setIsDuplicating(true); setEditMode(true); setShowForm(true);
  };

  const navigate = index => { const next = Math.min(Math.max(index, 0), campos.length - 1); const c = campos[next]; if (c) { setSelectedIds([c.id || c.field_id]); loadForm(c); } };
  const opLabel = isDuplicating ? "NOVO REGISTRO DUPLICADO" : editingId ? editMode ? "EDIÇÃO DE REGISTRO" : "VISUALIZAÇÃO DE REGISTRO" : "NOVO REGISTRO";

  const content = (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white">
      <TopNoticeDialog open={notice.open} onOpenChange={o => setNotice(prev => ({ ...prev, open: o }))} badge={notice.type === "danger" ? "EXCLUIR" : "AVISO"} title={notice.title} description={notice.description} type={notice.type} confirmText={notice.confirmText} cancelText={notice.cancelText} onConfirm={notice.onConfirm} />
      {!inline && <DialogHeader className="sr-only"><DialogTitle>Campos Personalizados - Empresa</DialogTitle></DialogHeader>}
      {showForm ?
        <form onSubmit={handleSubmit} className="bg-white flex-1 min-h-0 flex flex-col overflow-hidden">
          <LegacyRecordToolbar title={form.label || (editingId ? "EDITAR CAMPO" : "NOVO CAMPO")} badgeLabel="CAMPO PERSONALIZADO" operationLabel={opLabel} showSaveActions={editMode} showEditAction={isReadOnly} showDeleteDuplicateActions={!!editingId && !editMode && !isDuplicating} onSave={() => handleSubmit({ preventDefault: () => {} })} onCancel={() => { if (editingId && !isDuplicating) { const orig = campos.find(c => c.id === editingId); if (orig) { loadForm(orig); return; } } reset(); }} onEditRecord={() => setEditMode(true)} onToggleView={() => { if (showForm) { reset(); return; } if (selectedCampo && selectedIds.length <= 1) loadForm(selectedCampo); }} onBack={() => onOpenChange(false)} onNew={() => { setForm(INITIAL); setEditingId(null); setSelectedIds([]); setIsDirty(true); setIsDuplicating(false); setEditMode(true); setShowForm(true); }} total={campos.length} currentIndex={selectedIndex} onFirst={() => navigate(0)} onPrevious={() => navigate(selectedIndex - 1)} onNext={() => navigate(selectedIndex + 1)} onLast={() => navigate(campos.length - 1)} onDelete={handleDeleteCurrent} onDuplicate={handleDuplicate} showUtilityActions={false} />
          <fieldset className={`flex-1 overflow-y-auto ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}>
            <div className="px-4 md:px-8 py-2 space-y-1 max-w-[780px]">
              <Field label="Nome do campo" required><Input value={form.label} onChange={e => updateForm("label", e.target.value)} placeholder="EX: CONTATO RESPONSÁVEL" className="h-[22px] text-xs uppercase border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1" /></Field>
              <Field label="Tipo"><AutocompleteGenerico items={TIPOS_CAMPO.map(t => ({ ...t, id: t.value }))} value={form.tipo} onChange={v => updateForm("tipo", v)} placeholder="BUSCAR TIPO..." displayField="label" searchFields={["label", "value"]} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1 uppercase" /></Field>
              <Field label="Texto de ajuda"><Input value={form.placeholder} onChange={e => updateForm("placeholder", e.target.value)} placeholder="TEXTO MOSTRADO NO CAMPO" className="h-[22px] text-xs uppercase border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1" /></Field>
              <Field label="Descrição"><Input value={form.descricao} onChange={e => updateForm("descricao", e.target.value)} placeholder="EXPLICAÇÃO OPCIONAL" className="h-[22px] text-xs uppercase border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1" /></Field>
              {["select", "option_list"].includes(form.tipo) && <ManualSelectOptionsConfig form={form} updateForm={updateForm} />}
              {form.tipo === "relation" && <GuidedRelationConfig form={form} updateForm={updateForm} mode="relation" />}
              {form.tipo === "calculado" && <VisualCalculationBuilder value={form.calculation_builder?.items || []} fields={camposCalculo} onChange={items => updateForm("calculation_builder", { items })} />}
              <DecimalConfig form={form} updateForm={updateForm} />
              <MaskConfig form={form} updateForm={updateForm} />
              <Field label="Prévia" wide><div className="px-2 py-1 text-xs text-slate-700 uppercase bg-slate-50 min-h-[36px]">{form.label || "Nome do campo"}: {form.tipo === "calculado" ? montarFormulaVisual(form.calculation_builder?.items || []) || "Calculado automaticamente" : form.placeholder || "Valor do campo"}</div></Field>
              <div className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1 pt-1"><span className="text-[12px] text-slate-600 text-right leading-none">Exibir em:</span><div className="flex items-center gap-4">{[["obrigatorio", "Obrigatório"], ["visivel_tabela", "Tabela"], ["visivel_relatorio", "Relatório"]].map(([f, l]) => <button key={f} type="button" onClick={() => updateForm(f, !form[f])} className="h-[22px] flex items-center gap-1.5 bg-transparent"><span className="text-[12px] text-slate-600">{l}:</span><ToggleSwitch checked={!!form[f]} onChange={v => updateForm(f, v)} disabled={isReadOnly} /></button>)}</div></div>
            </div>
          </fieldset>
        </form> :
        <div className="flex-1 min-h-0 overflow-hidden bg-white flex flex-col">
          <SankhyaListToolbar viewMode="table" total={campos.length} currentIndex={selectedIndex} onNew={() => { setForm(INITIAL); setEditingId(null); setSelectedIds([]); setIsDirty(true); setIsDuplicating(false); setEditMode(true); setShowForm(true); }} onToggleView={() => { if (selectedCampo && selectedIds.length <= 1) loadForm(selectedCampo); }} onBack={() => onOpenChange(false)} toggleViewDisabled={!selectedCampo || selectedIds.length > 1} onDelete={handleDeleteSelected} attachDisabled selectedCount={selectedIds.length} title="Campos Personalizados - Empresa" recordLabel="" showUtilityActions={false} showSearch={false} />
          <div className="overflow-auto flex-1 min-h-0">
            <Table className="w-full min-w-[600px] border-separate border-spacing-0 table-fixed">
              <TableHeader className="bg-white">
                <TableRow className="sticky top-0 z-40 bg-white">
                  <TableHead className="sticky top-0 z-40 relative align-middle text-gray-900 px-2 text-xs font-medium text-left border-r border-b border-gray-300 bg-white whitespace-nowrap h-7 w-[260px]">Campo</TableHead>
                  <TableHead className="sticky top-0 z-40 relative align-middle text-gray-900 px-2 text-xs font-medium text-left border-r border-b border-gray-300 bg-white whitespace-nowrap h-7 w-[140px]">Tipo</TableHead>
                  <TableHead className="sticky top-0 z-40 relative align-middle text-gray-900 px-2 text-xs font-medium text-left border-r border-b border-gray-300 bg-white whitespace-nowrap h-7">Uso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-xs text-slate-400">Carregando...</TableCell></TableRow> :
                  campos.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-xs text-slate-400">Nenhum campo criado.</TableCell></TableRow> :
                    campos.map((campo, index) => (
                      <TableRow key={campo.id || campo.field_id} className={`${selectedIds.includes(campo.id || campo.field_id) ? "bg-green-500 hover:bg-green-600 text-white" : index % 2 === 0 ? "bg-gray-100 hover:bg-gray-200" : "bg-white hover:bg-gray-100"} transition-colors border-b cursor-pointer select-none`} onClick={e => { const id = campo.id || campo.field_id; setSelectedIds(prev => e.ctrlKey || e.metaKey ? prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id] : [id]); }} onDoubleClick={() => selectedIds.length <= 1 && loadForm(campo)}>
                        <TableCell className={`h-7 px-2 py-0 text-xs leading-7 align-middle border-r border-b whitespace-nowrap overflow-hidden text-ellipsis font-medium ${selectedIds.includes(campo.id || campo.field_id) ? "text-white border-green-600" : "text-gray-700 border-gray-300"}`}>{campo.label}</TableCell>
                        <TableCell className={`h-7 px-2 py-0 text-xs leading-7 align-middle border-r border-b whitespace-nowrap overflow-hidden text-ellipsis ${selectedIds.includes(campo.id || campo.field_id) ? "text-white border-green-600" : "text-gray-700 border-gray-300"}`}>{TIPOS_CAMPO.find(t => t.value === campo.tipo)?.label || campo.tipo}</TableCell>
                        <TableCell className={`h-7 px-2 py-0 text-xs align-middle border-r border-b whitespace-nowrap overflow-hidden ${selectedIds.includes(campo.id || campo.field_id) ? "text-white border-green-600" : "text-gray-700 border-gray-300"}`}>
                          <div className="h-full flex items-center gap-1 overflow-hidden">
                            {campo.visivel_form && <Badge variant="outline" className="text-[10px] bg-white/90 text-slate-700">Form</Badge>}
                            {campo.visivel_tabela && <Badge variant="outline" className="text-[10px] bg-white/90 text-slate-700">Tabela</Badge>}
                            {campo.usar_decimal && <Badge variant="secondary" className="text-[10px]">{campo.decimal_places ?? 2} dec.</Badge>}
                            {campo.usar_mascara && <Badge variant="secondary" className="text-[10px]">Máscara</Badge>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </div>
      }
    </div>
  );

  if (inline) return open ? content : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !w-screen !max-w-none !h-screen !max-h-none overflow-hidden flex flex-col !p-0 !rounded-none">{content}</DialogContent>
    </Dialog>
  );
}