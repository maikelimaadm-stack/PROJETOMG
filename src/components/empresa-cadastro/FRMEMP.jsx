// FRMEMP = Formulário de Empresa
import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import campoEngine from "@/services/campoEngine";
import AutocompleteGenerico from "@/components/financeiro/AutocompleteGenerico";
import TopNoticeDialog from "@/components/common/TopNoticeDialog";
import LegacyRecordToolbar from "@/components/lotes/LegacyRecordToolbar";
import LegacyTabs from "@/components/lotes/LegacyTabs";
import DynamicFormRenderer from "@/components/dynamic/DynamicFormRenderer";
import LayoutConfiguratorDialog from "@/components/dynamic/LayoutConfiguratorDialog";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import empresaCadastroRepository from "./empresaCadastroRepository";

const FL = ({ label, required, error, children, dataField, wide = false, compact = false }) =>
  <div data-field={dataField} className={`grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1 ${wide ? "md:col-span-2" : ""}`}>
    <label className="text-[12px] text-slate-600 text-right leading-none">{label}:{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <div className={`${wide ? "min-h-6" : "h-6"} ${compact ? "w-44 max-w-full" : "w-full"} border ${error ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"} rounded-[1.5px] focus-within:border-green-500 transition-colors overflow-hidden [&_input]:h-[22px] [&_input]:border-0 [&_input]:rounded-none [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_button]:h-[22px] [&_button]:border-0 [&_button]:rounded-none [&_button]:shadow-none [&_textarea]:min-h-[48px] [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:shadow-none [&_textarea]:focus-visible:ring-0`}>{children}</div>
  </div>;

const ESTADOS_BR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(s => ({ id: s, nome: s }));
const UPPERCASE_FIELDS = ["razao_social","nome_fantasia","cpf_cnpj","inscricao_estadual","endereco","bairro","cidade","estado","observacoes"];
const REQUIRED_FIELDS = ["razao_social","tipo_pessoa"];
const TIPOS_PESSOA = [{ id: "PF", nome: "PESSOA FÍSICA" }, { id: "PJ", nome: "PESSOA JURÍDICA" }];
const STATUS_OPTS = [{ id: "Ativa", nome: "ATIVA" }, { id: "Inativa", nome: "INATIVA" }];

const buildEmpty = () => ({ razao_social: "", nome_fantasia: "", tipo_pessoa: "PJ", cpf_cnpj: "", inscricao_estadual: "", telefone: "", whatsapp: "", email: "", logo_url: "", cep: "", endereco: "", numero: "", bairro: "", cidade: "", estado: "", observacoes: "", status: "Ativa", campos_personalizados: {} });

export default function FRMEMP({ onSubmit, onCancel, onSettingsClick, onAttachClick, attachDisabled = false, onToggleView, total = 0, currentIndex = 0, onNew, onFirst, onPrevious, onNext, onLast, onDelete, onDuplicate, onRefresh, filterOpen = false, filterActive = false, onToggleFilter, onClearFilter, initialData, isEditing }) {
  const isDuplicating = !!initialData?._isDuplicate;
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("principal");
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [noticeDialog, setNoticeDialog] = useState({ open: false, title: "", description: "" });
  const [isDirty, setIsDirty] = useState(!isEditing || isDuplicating);
  const [editMode, setEditMode] = useState(!isEditing || isDuplicating);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [formLayoutConfig, setFormLayoutConfig] = useState(() => {
    const s = localStorage.getItem("emp_form_layout_config");
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  });

  const buildFormData = data => data ? { ...buildEmpty(), ...data } : buildEmpty();
  const [formData, setFormData] = useState(() => buildFormData(initialData));

  React.useEffect(() => { setFormData(buildFormData(initialData)); setErrors({}); setIsDirty(!isEditing || !!initialData?._isDuplicate); setEditMode(!isEditing || !!initialData?._isDuplicate); }, [initialData?.id, initialData?.codigo_empresa, initialData?._isDuplicate, isEditing]);

  const { data: camposPersonalizados = [] } = useQuery({ queryKey: ["emp-campos-personalizados"], queryFn: () => empresaCadastroRepository.listCamposPersonalizados(), initialData: [] });

  const camposForm = useMemo(() => camposPersonalizados.map(campoEngine.normalize).filter(c => c.ativo !== false && c.visivel_form !== false), [camposPersonalizados]);

  const isReadOnly = isEditing && !isDuplicating && !editMode;
  const readOnlyCls = isReadOnly ? "cursor-default" : "";

  const handleChange = (field, value) => {
    if (isReadOnly) return;
    setIsDirty(true);
    const norm = UPPERCASE_FIELDS.includes(field) && typeof value === "string" ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [field]: norm }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleCustomChange = (fieldName, value) => {
    if (isReadOnly) return;
    setIsDirty(true);
    setErrors(prev => ({ ...prev, [`campos_personalizados.${fieldName}`]: false }));
    setFormData(prev => ({ ...prev, campos_personalizados: { ...(prev.campos_personalizados || {}), [fieldName]: value } }));
  };

  const handleLogoUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange("logo_url", file_url);
      setLogoPreview(file_url);
    } finally { setLogoUploading(false); }
  };

  const validateForm = () => {
    const errs = {};
    REQUIRED_FIELDS.forEach(f => { if (!formData[f]?.toString().trim()) errs[f] = true; });
    setErrors(errs);
    if (Object.keys(errs).length === 0) return true;
    setNoticeDialog({ open: true, title: "Campos obrigatórios", description: "Preencha os campos obrigatórios antes de salvar." });
    const first = Object.keys(errs)[0];
    document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validateForm()) return;
    onSubmit({ ...formData, razao_social: formData.razao_social?.toUpperCase() || "", nome_fantasia: formData.nome_fantasia?.toUpperCase() || "" });
  };

  const basePanels = [
    { id: "principal", label: "Principal" },
    { id: "geral", label: "Geral" },
    { id: "endereco", label: "Endereço" },
    { id: "contato", label: "Contato" },
    { id: "observacoes", label: "Observações" },
    ...(camposForm.length > 0 ? [{ id: "campos_personalizados", label: "Campos Personalizados" }] : [])
  ];

  const inputCls = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1";

  const dynamicFields = useMemo(() => [
    { id: "razao_social", name: "razao_social", label: "Razão Social", type: "text", required: true, errorKey: "razao_social", wide: true, render: () => <Input value={formData.razao_social || ""} onChange={e => handleChange("razao_social", e.target.value)} placeholder="RAZÃO SOCIAL" className={`${inputCls} uppercase`} readOnly={isReadOnly} /> },
    { id: "status", name: "status", label: "Status", type: "switch", compact: true, render: () => <div className="h-[22px] flex items-center px-1"><ToggleSwitch checked={formData.status !== "Inativa"} onChange={c => handleChange("status", c ? "Ativa" : "Inativa")} disabled={isReadOnly} /></div> },
    { id: "codigo_empresa", name: "codigo_empresa", label: "Código", type: "text", compact: true, readOnly: true, render: () => <Input value={formData.codigo_empresa || ""} readOnly className={`${inputCls} bg-slate-50`} /> },
    { id: "nome_fantasia", name: "nome_fantasia", label: "Nome Fantasia", type: "text", wide: true, render: () => <Input value={formData.nome_fantasia || ""} onChange={e => handleChange("nome_fantasia", e.target.value)} placeholder="NOME FANTASIA" className={`${inputCls} uppercase`} readOnly={isReadOnly} /> },
    { id: "tipo_pessoa", name: "tipo_pessoa", label: "Tipo Pessoa", type: "autocomplete", required: true, errorKey: "tipo_pessoa", compact: true, render: () => <AutocompleteGenerico items={TIPOS_PESSOA} value={formData.tipo_pessoa || ""} onChange={v => handleChange("tipo_pessoa", v)} placeholder="TIPO..." displayField="nome" searchFields={["nome", "id"]} disabled={isReadOnly} className="w-full" inputClassName={`${inputCls}`} /> },
    { id: "cpf_cnpj", name: "cpf_cnpj", label: "CPF / CNPJ", type: "text", compact: true, render: () => <Input value={formData.cpf_cnpj || ""} onChange={e => handleChange("cpf_cnpj", e.target.value)} placeholder="CPF OU CNPJ" className={`${inputCls} uppercase`} readOnly={isReadOnly} /> },
    { id: "inscricao_estadual", name: "inscricao_estadual", label: "Insc. Estadual", type: "text", compact: true, render: () => <Input value={formData.inscricao_estadual || ""} onChange={e => handleChange("inscricao_estadual", e.target.value)} placeholder="INSCRIÇÃO ESTADUAL" className={`${inputCls} uppercase`} readOnly={isReadOnly} /> },
    { id: "telefone", name: "telefone", label: "Telefone", type: "text", compact: true, render: () => <Input value={formData.telefone || ""} onChange={e => handleChange("telefone", e.target.value)} placeholder="(00) 00000-0000" className={inputCls} readOnly={isReadOnly} /> },
    { id: "whatsapp", name: "whatsapp", label: "WhatsApp", type: "text", compact: true, render: () => <Input value={formData.whatsapp || ""} onChange={e => handleChange("whatsapp", e.target.value)} placeholder="(00) 00000-0000" className={inputCls} readOnly={isReadOnly} /> },
    { id: "email", name: "email", label: "E-mail", type: "text", render: () => <Input type="email" value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} placeholder="EMAIL@DOMINIO.COM.BR" className={inputCls} readOnly={isReadOnly} /> },
    { id: "logo_url", name: "logo_url", label: "Logotipo", type: "text", wide: true, render: () => (
      <div className="flex items-center gap-2 px-1 py-0.5">
        {(formData.logo_url || logoPreview) && <img src={formData.logo_url || logoPreview} alt="Logo" className="h-8 w-8 object-contain border border-slate-200 rounded-sm" />}
        {!isReadOnly && <label className="cursor-pointer text-[11px] text-emerald-700 hover:underline">{logoUploading ? "Enviando..." : "Selecionar imagem..."}<input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} /></label>}
        {formData.logo_url && !isReadOnly && <button type="button" onClick={() => { handleChange("logo_url", ""); setLogoPreview(null); }} className="text-[11px] text-red-500 hover:underline ml-1">Remover</button>}
      </div>
    ) },
    { id: "cep", name: "cep", label: "CEP", type: "text", compact: true, render: () => <Input value={formData.cep || ""} onChange={e => handleChange("cep", e.target.value)} placeholder="00000-000" className={inputCls} readOnly={isReadOnly} /> },
    { id: "endereco", name: "endereco", label: "Endereço", type: "text", wide: true, render: () => <Input value={formData.endereco || ""} onChange={e => handleChange("endereco", e.target.value)} placeholder="LOGRADOURO" className={`${inputCls} uppercase`} readOnly={isReadOnly} /> },
    { id: "numero", name: "numero", label: "Número", type: "text", compact: true, render: () => <Input value={formData.numero || ""} onChange={e => handleChange("numero", e.target.value)} placeholder="Nº" className={inputCls} readOnly={isReadOnly} /> },
    { id: "bairro", name: "bairro", label: "Bairro", type: "text", render: () => <Input value={formData.bairro || ""} onChange={e => handleChange("bairro", e.target.value)} placeholder="BAIRRO" className={`${inputCls} uppercase`} readOnly={isReadOnly} /> },
    { id: "cidade", name: "cidade", label: "Cidade", type: "text", render: () => <Input value={formData.cidade || ""} onChange={e => handleChange("cidade", e.target.value)} placeholder="CIDADE" className={`${inputCls} uppercase`} readOnly={isReadOnly} /> },
    { id: "estado", name: "estado", label: "Estado (UF)", type: "autocomplete", compact: true, render: () => <AutocompleteGenerico items={ESTADOS_BR} value={formData.estado || ""} onChange={v => handleChange("estado", v)} placeholder="UF..." displayField="nome" searchFields={["nome"]} disabled={isReadOnly} className="w-full" inputClassName={inputCls} /> },
    { id: "observacoes", name: "observacoes", label: "Observações", type: "textarea", wide: true, render: () => <Textarea value={formData.observacoes || ""} onChange={e => handleChange("observacoes", e.target.value)} placeholder="OBSERVAÇÕES GERAIS..." className="text-xs uppercase bg-transparent px-1" rows={3} readOnly={isReadOnly} /> },
    ...camposForm.map(campo => ({
      id: `custom:${campo.field_name}`, name: campo.field_name, label: campo.label, type: campo.tipo,
      required: campo.obrigatorio, errorKey: `campos_personalizados.${campo.field_name}`,
      wide: ["textarea", "option_list"].includes(campo.tipo),
      compact: ["number", "date", "time", "calculado"].includes(campo.tipo) && !campo.usar_mascara,
      render: () => {
        const val = formData.campos_personalizados?.[campo.field_name] || "";
        if (campo.tipo === "textarea") return <Textarea value={val} onChange={e => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={isReadOnly} className="text-xs uppercase bg-transparent px-1" rows={campo.rows || 2} />;
        return <Input type={campo.tipo === "number" ? "number" : campo.tipo === "date" ? "date" : "text"} value={val} onChange={e => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={campo.read_only || isReadOnly} className={`${inputCls} ${campo.uppercase ? "uppercase" : ""}`} />;
      }
    }))
  ], [formData, camposForm, isReadOnly, ESTADOS_BR, logoPreview, logoUploading]);

  const defaultLayout = {
    principal: ["razao_social", "status", "codigo_empresa"],
    geral: ["nome_fantasia", "tipo_pessoa", "cpf_cnpj", "inscricao_estadual", "logo_url"],
    contato: ["telefone", "whatsapp", "email"],
    endereco: ["cep", "endereco", "numero", "bairro", "cidade", "estado"],
    observacoes: ["observacoes"],
    campos_personalizados: camposForm.map(c => `custom:${c.field_name}`)
  };

  const activeLayoutConfig = (() => {
    const src = formLayoutConfig || { panels: basePanels, layout: defaultLayout, hiddenFieldIds: [], lockedFieldIds: [], requiredFieldIds: [], aggregationConfig: {}, visibilityRules: {} };
    const panels = src.panels?.some(p => p.id === "principal") ? src.panels : [basePanels[0], ...(src.panels || basePanels)];
    return { ...src, panels, layout: { ...src.layout, principal: src.layout?.principal?.length ? src.layout.principal : defaultLayout.principal }, hiddenFieldIds: (src.hiddenFieldIds || []).filter(id => !["status", "codigo_empresa"].includes(id)) };
  })();

  const tabs = activeLayoutConfig.panels.filter(p => {
    if (p.id === "principal" || p.hidden) return false;
    if (p.id === "campos_personalizados" && camposForm.length === 0) return false;
    return (activeLayoutConfig.layout?.[p.id] || []).length > 0;
  });

  const saveLayoutConfig = next => {
    const normalized = { ...next, panels: next.panels.filter(p => p.id !== "campos_personalizados" || camposForm.length > 0), layout: { ...next.layout, principal: next.layout?.principal?.length ? next.layout.principal : defaultLayout.principal }, hiddenFieldIds: (next.hiddenFieldIds || []).filter(id => !["status", "codigo_empresa"].includes(id)) };
    setFormLayoutConfig(normalized);
    localStorage.setItem("emp_form_layout_config", JSON.stringify(normalized));
    const visible = normalized.panels.filter(p => !p.hidden && p.id !== "principal");
    if (!visible.some(p => p.id === activeTab)) setActiveTab(visible[0]?.id || "geral");
  };

  const opLabel = isDuplicating ? "NOVO REGISTRO DUPLICADO" : isEditing ? editMode ? "EDIÇÃO DE REGISTRO" : "VISUALIZAÇÃO DE REGISTRO" : "NOVO REGISTRO";

  if (layoutConfigOpen) {
    return (
      <section className="w-full h-full max-w-full bg-white overflow-hidden">
        <LayoutConfiguratorDialog open={layoutConfigOpen} onOpenChange={setLayoutConfigOpen} inline panels={activeLayoutConfig.panels} fields={dynamicFields} layout={activeLayoutConfig.layout} hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []} lockedFieldIds={activeLayoutConfig.lockedFieldIds || []} requiredFieldIds={activeLayoutConfig.requiredFieldIds || []} aggregationConfig={activeLayoutConfig.aggregationConfig || {}} visibilityRules={activeLayoutConfig.visibilityRules || {}} defaultConfig={{ panels: basePanels, layout: defaultLayout, hiddenFieldIds: [], lockedFieldIds: [], requiredFieldIds: [], aggregationConfig: {}, visibilityRules: {} }} onSave={saveLayoutConfig} />
      </section>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white">
      <TopNoticeDialog open={noticeDialog.open} onOpenChange={o => setNoticeDialog(prev => ({ ...prev, open: o }))} badge="AVISO" title={noticeDialog.title} description={noticeDialog.description} type="warning" confirmText="Entendi" />
      <form onSubmit={handleSubmit} className="bg-white h-full min-h-0 overflow-hidden flex flex-col">
        <LegacyRecordToolbar
          title={`${formData.codigo_empresa ? `${formData.codigo_empresa} - ` : ""}${formData.razao_social || (isDuplicating ? "Duplicar empresa" : isEditing ? "Editar empresa" : "Nova empresa")}`}
          badgeLabel="EMPRESA"
          operationLabel={opLabel}
          showSaveActions={editMode}
          showEditAction={isReadOnly}
          showDeleteDuplicateActions={isEditing && !editMode && !isDuplicating}
          onCancel={onCancel}
          onEditRecord={() => setEditMode(true)}
          onSettingsClick={onSettingsClick}
          onLayoutConfigClick={() => { if (filterOpen) onToggleFilter?.(); setLayoutConfigOpen(true); }}
          onToggleView={onToggleView}
          total={total} currentIndex={currentIndex}
          onNew={onNew} onFirst={onFirst} onPrevious={onPrevious} onNext={onNext} onLast={onLast}
          onDelete={onDelete} onDuplicate={onDuplicate} onRefresh={onRefresh}
          filterOpen={filterOpen} filterActive={filterActive} onToggleFilter={onToggleFilter} onClearFilter={onClearFilter}
          onAttachClick={onAttachClick} attachDisabled={attachDisabled} />
        <div className="flex-1 min-h-0 overflow-y-auto pb-6 pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
          <fieldset className={isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}>
            <div className="px-4 md:px-8 py-1 max-w-[780px]">
              <DynamicFormRenderer panels={activeLayoutConfig.panels} fields={dynamicFields} layout={activeLayoutConfig.layout} hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []} lockedFieldIds={activeLayoutConfig.lockedFieldIds || []} requiredFieldIds={activeLayoutConfig.requiredFieldIds || []} visibilityRules={activeLayoutConfig.visibilityRules || {}} activePanelId="principal" values={formData} errors={errors} onChange={handleChange} readOnly={isReadOnly} fieldClassName="rounded-[1.5px]" />
            </div>
          </fieldset>
          <LegacyTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <fieldset className={isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}>
            <div className="min-h-[360px] px-4 md:px-8 py-1">
              <div className="max-w-[780px] space-y-1">
                <DynamicFormRenderer panels={tabs} fields={dynamicFields} layout={activeLayoutConfig.layout} hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []} lockedFieldIds={activeLayoutConfig.lockedFieldIds || []} requiredFieldIds={activeLayoutConfig.requiredFieldIds || []} visibilityRules={activeLayoutConfig.visibilityRules || {}} activePanelId={activeTab} values={formData} errors={errors} onChange={handleChange} readOnly={isReadOnly} fieldClassName="rounded-[1.5px]" />
              </div>
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
}