import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/components/emp/empRepository";
import campoEngine from "@/services/campoEngine";
import AutocompleteGenerico from "@/components/financeiro/AutocompleteGenerico";
import TopNoticeDialog from "@/components/common/TopNoticeDialog";
import LegacyRecordToolbar from "@/components/lotes/LegacyRecordToolbar";
import LegacyTabs from "@/components/lotes/LegacyTabs";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import { base44 } from "@/api/base44Client";

const ESTADOS_BR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const UPPER_FIELDS = ["razao_social","nome_fantasia","cpf_cnpj","inscricao_estadual","email","cep","endereco","numero","bairro","cidade","estado","observacoes"];
const REQUIRED_FIELDS = ["razao_social","tipo_pessoa"];

const inputClass = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1";

function FL({ label, required, error, children, wide = false, compact = false }) {
  return (
    <div className={`grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1 ${wide ? "md:col-span-2" : ""}`}>
      <label className="text-[12px] text-slate-600 text-right leading-none">
        {label}:{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className={`${wide ? "min-h-6" : "h-6"} ${compact ? "w-44 max-w-full" : "w-full"} border ${error ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"} rounded-[1.5px] focus-within:border-green-500 transition-colors overflow-hidden [&_input]:h-[22px] [&_input]:border-0 [&_input]:rounded-none [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_button]:h-[22px] [&_button]:border-0 [&_button]:rounded-none [&_button]:shadow-none [&_textarea]:min-h-[48px] [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:shadow-none [&_textarea]:focus-visible:ring-0`}>
        {children}
      </div>
    </div>
  );
}

const buildEmpty = () => ({
  codigo_empresa: "", razao_social: "", nome_fantasia: "", tipo_pessoa: "PJ",
  cpf_cnpj: "", inscricao_estadual: "", telefone: "", whatsapp: "", email: "",
  logo_url: "", cep: "", endereco: "", numero: "", bairro: "", cidade: "",
  estado: "", observacoes: "", status: "Ativa", campos_personalizados: {}
});

// Native fields that should never appear in the custom fields tab
const NATIVE_FIELDS = new Set([
  "codigo_empresa","razao_social","nome_fantasia","tipo_pessoa","cpf_cnpj",
  "inscricao_estadual","telefone","whatsapp","email","logo_url","cep",
  "endereco","numero","bairro","cidade","estado","observacoes","status",
  "campos_personalizados"
]);

export default function FORMEMP({
  onSubmit, onCancel, onSettingsClick, onAttachClick, attachDisabled = false,
  onToggleView, total = 0, currentIndex = 0,
  onNew, onFirst, onPrevious, onNext, onLast,
  onDelete, onDuplicate, onRefresh,
  filterOpen = false, filterActive = false, onToggleFilter, onClearFilter,
  initialData, isEditing
}) {
  const isDuplicating = !!initialData?._isDuplicate;
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("geral");
  const [noticeDialog, setNoticeDialog] = useState({ open: false, title: "", description: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editMode, setEditMode] = useState(!isEditing || isDuplicating);

  const buildFormData = (data) => data ? { ...buildEmpty(), ...data, campos_personalizados: data.campos_personalizados || {} } : buildEmpty();
  const [formData, setFormData] = useState(() => buildFormData(initialData));

  useEffect(() => {
    setFormData(buildFormData(initialData));
    setErrors({});
    setEditMode(!isEditing || !!initialData?._isDuplicate);
    setActiveTab("geral");
  }, [initialData?.id, initialData?.codigo_empresa, initialData?._isDuplicate, isEditing]);

  const { data: camposPersonalizados = [] } = useQuery({
    queryKey: ["emp-campos-personalizados"],
    queryFn: () => empRepository.listCamposPersonalizados(),
    initialData: []
  });

  const camposPersonalizadosForm = useMemo(() =>
    camposPersonalizados
      .map(campoEngine.normalize)
      .filter((c) => c.ativo !== false && c.visivel_form !== false && !NATIVE_FIELDS.has(c.field_name)),
    [camposPersonalizados]
  );

  const isReadOnly = isEditing && !isDuplicating && !editMode;

  const handleChange = (field, value) => {
    if (isReadOnly) return;
    const normalized = UPPER_FIELDS.includes(field) && typeof value === "string" ? value.toUpperCase() : value;
    setErrors((p) => ({ ...p, [field]: undefined }));
    setFormData((p) => ({ ...p, [field]: normalized }));
  };

  const handleCustomChange = (fieldName, value) => {
    if (isReadOnly) return;
    setFormData((p) => ({ ...p, campos_personalizados: { ...(p.campos_personalizados || {}), [fieldName]: value } }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData((p) => ({ ...p, logo_url: file_url }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    REQUIRED_FIELDS.forEach((f) => { if (!String(formData?.[f] || "").trim()) errs[f] = true; });
    setErrors(errs);
    if (Object.keys(errs).length === 0) return true;
    setNoticeDialog({ open: true, title: "Campos obrigatórios", description: "Preencha os campos obrigatórios antes de salvar." });
    return false;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isReadOnly) return;
    if (!validateForm()) return;
    const { _isDuplicate, ...clean } = formData;
    onSubmit(clean);
  };

  const opcoesEstado = useMemo(() => ESTADOS_BR.map((e) => ({ id: e, nome: e })), []);
  const opcoesTipoPessoa = [{ id: "PF", nome: "PESSOA FÍSICA (PF)" }, { id: "PJ", nome: "PESSOA JURÍDICA (PJ)" }];

  const tabs = [
    { id: "geral", label: "Geral" },
    { id: "endereco", label: "Endereço" },
    { id: "observacoes", label: "Observações" },
    ...(camposPersonalizadosForm.length > 0 ? [{ id: "campos_personalizados", label: "Campos Personalizados" }] : [])
  ];

  const operationLabel = isDuplicating ? "NOVO REGISTRO DUPLICADO"
    : isEditing ? (editMode ? "EDIÇÃO DE REGISTRO" : "VISUALIZAÇÃO DE REGISTRO")
    : "NOVO REGISTRO";

  const renderCampoPersonalizado = (campo) => {
    const value = formData.campos_personalizados?.[campo.field_name] || "";
    const isDisabled = campo.read_only || isReadOnly;
    if (campo.tipo === "textarea") return <Textarea value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} disabled={isDisabled} className="text-xs uppercase bg-transparent px-1 min-h-[48px] border-0 rounded-none shadow-none focus-visible:ring-0 [resize:none]" />;
    if (campo.tipo === "select" || campo.tipo === "option_list") {
      const opts = (campoEngine.getOptionsCampo ? campoEngine.getOptionsCampo(campo, {}) : []).map((o) => ({ id: String(o.value || o.label || ""), nome: String(o.label || o.value || "").toUpperCase() }));
      return <AutocompleteGenerico items={opts} value={value} onChange={(v) => handleCustomChange(campo.field_name, v || "")} placeholder={(campo.placeholder || "BUSCAR OPÇÃO...").toUpperCase()} displayField="nome" searchFields={["nome"]} disabled={isDisabled} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1 [resize:none]" />;
    }
    return <Input type={campo.tipo === "number" ? "number" : campo.tipo === "date" ? "date" : "text"} value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} disabled={isDisabled} className={`${inputClass} [resize:none]`} />;
  };

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white">
      <TopNoticeDialog open={noticeDialog.open} onOpenChange={(o) => setNoticeDialog((p) => ({ ...p, open: o }))} badge="AVISO" title={noticeDialog.title} description={noticeDialog.description} type="warning" confirmText="Entendi" />
      <form onSubmit={handleSubmit} className="bg-white h-full min-h-0 overflow-hidden flex flex-col">
        <LegacyRecordToolbar
          title={`${formData.codigo_empresa ? `${formData.codigo_empresa} - ` : ""}${formData.razao_social || (isDuplicating ? "Duplicar empresa" : isEditing ? "Editar empresa" : "Nova empresa")}`}
          badgeLabel="EMPRESA"
          operationLabel={operationLabel}
          showSaveActions={editMode}
          onSave={handleSubmit}
          showEditAction={isReadOnly}
          showDeleteDuplicateActions={isEditing && !editMode && !isDuplicating}
          onCancel={onCancel}
          onEditRecord={() => setEditMode(true)}
          onSettingsClick={onSettingsClick}
          onToggleView={onToggleView}
          total={total} currentIndex={currentIndex}
          onNew={onNew} onFirst={onFirst} onPrevious={onPrevious} onNext={onNext} onLast={onLast}
          onDelete={onDelete} onDuplicate={onDuplicate} onRefresh={onRefresh}
          filterOpen={filterOpen} filterActive={filterActive}
          onToggleFilter={onToggleFilter} onClearFilter={onClearFilter}
          onAttachClick={onAttachClick} attachDisabled={attachDisabled}
        />

        <div className="flex-1 min-h-0 overflow-y-auto pb-6 pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
          <div className="border-0 p-0 m-0 min-w-0">
            {/* Painel Principal - sempre visível */}
            <div className="px-4 md:px-8 py-2 max-w-[780px] space-y-1">
              <FL label="Razão Social" required error={errors.razao_social}>
                <Input value={formData.razao_social} onChange={(e) => handleChange("razao_social", e.target.value)} placeholder="RAZÃO SOCIAL OU NOME COMPLETO" className={`${inputClass} uppercase`} disabled={isReadOnly} />
              </FL>
              <div className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1">
                <label className="text-[12px] text-slate-600 text-right leading-none">Ativa:</label>
                <div className="h-6 flex items-center px-1">
                  <ToggleSwitch checked={formData.status !== "Inativa"} onChange={(c) => handleChange("status", c ? "Ativa" : "Inativa")} disabled={isReadOnly} />
                </div>
              </div>
              <FL label="Código" compact>
                <Input value={formData.codigo_empresa || ""} readOnly className={`${inputClass} text-right bg-slate-50`} placeholder="AUTO" />
              </FL>
            </div>

            {/* Tabs */}
            <LegacyTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* Conteúdo das tabs */}
            <div className="min-h-[360px] px-4 md:px-8 py-2 max-w-[780px] space-y-1">

              {activeTab === "geral" && (
                <div className="space-y-1">
                  <FL label="Nome Fantasia" wide>
                    <Input value={formData.nome_fantasia} onChange={(e) => handleChange("nome_fantasia", e.target.value)} placeholder="NOME FANTASIA" className={`${inputClass} uppercase`} disabled={isReadOnly} />
                  </FL>
                  <FL label="Tipo de Pessoa" required error={errors.tipo_pessoa} compact>
                    <AutocompleteGenerico items={opcoesTipoPessoa} value={formData.tipo_pessoa || ""} onChange={(v) => handleChange("tipo_pessoa", v || "PJ")} placeholder="PF / PJ" displayField="nome" searchFields={["nome"]} disabled={isReadOnly} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1" />
                  </FL>
                  <FL label={formData.tipo_pessoa === "PF" ? "CPF" : "CNPJ"} compact>
                    <Input value={formData.cpf_cnpj} onChange={(e) => handleChange("cpf_cnpj", e.target.value)} placeholder={formData.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} className={inputClass} disabled={isReadOnly} />
                  </FL>
                  <FL label="Inscrição Estadual" compact>
                    <Input value={formData.inscricao_estadual} onChange={(e) => handleChange("inscricao_estadual", e.target.value)} placeholder="INSCRIÇÃO ESTADUAL" className={inputClass} disabled={isReadOnly} />
                  </FL>
                  <FL label="Telefone" compact>
                    <Input value={formData.telefone} onChange={(e) => handleChange("telefone", e.target.value)} placeholder="(00) 0000-0000" className={inputClass} disabled={isReadOnly} />
                  </FL>
                  <FL label="WhatsApp" compact>
                    <Input value={formData.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} placeholder="(00) 00000-0000" className={inputClass} disabled={isReadOnly} />
                  </FL>
                  <FL label="E-mail">
                    <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="EMAIL@EMPRESA.COM.BR" className={inputClass} disabled={isReadOnly} />
                  </FL>
                  <div className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1">
                    <label className="text-[12px] text-slate-600 text-right leading-none">Logo da Empresa:</label>
                    <div className="min-h-[36px] border border-slate-300 bg-white rounded-[1.5px] flex items-center gap-2 px-2 py-1">
                      {formData.logo_url && <img src={formData.logo_url} alt="Logo" className="h-8 w-8 object-contain border border-slate-200 rounded-sm bg-white" />}
                      {!isReadOnly && (
                        <label className="cursor-pointer text-[11px] text-slate-600 hover:text-green-700 underline">
                          {uploadingLogo ? "Enviando..." : formData.logo_url ? "Trocar logo" : "Selecionar logo"}
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                        </label>
                      )}
                      {!isReadOnly && formData.logo_url && <button type="button" onClick={() => handleChange("logo_url", "")} className="text-[11px] text-red-500 hover:text-red-700 underline ml-1">Remover</button>}
                      {!formData.logo_url && isReadOnly && <span className="text-[11px] text-slate-400">Sem logo</span>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "endereco" && (
                <div className="space-y-1">
                  <FL label="CEP" compact>
                    <Input value={formData.cep} onChange={(e) => handleChange("cep", e.target.value)} placeholder="00000-000" className={inputClass} disabled={isReadOnly} />
                  </FL>
                  <FL label="Endereço" wide>
                    <Input value={formData.endereco} onChange={(e) => handleChange("endereco", e.target.value)} placeholder="RUA, AVENIDA..." className={`${inputClass} uppercase`} disabled={isReadOnly} />
                  </FL>
                  <FL label="Número" compact>
                    <Input value={formData.numero} onChange={(e) => handleChange("numero", e.target.value)} placeholder="Nº" className={inputClass} disabled={isReadOnly} />
                  </FL>
                  <FL label="Bairro">
                    <Input value={formData.bairro} onChange={(e) => handleChange("bairro", e.target.value)} placeholder="BAIRRO" className={`${inputClass} uppercase`} disabled={isReadOnly} />
                  </FL>
                  <FL label="Cidade">
                    <Input value={formData.cidade} onChange={(e) => handleChange("cidade", e.target.value)} placeholder="CIDADE" className={`${inputClass} uppercase`} disabled={isReadOnly} />
                  </FL>
                  <FL label="Estado (UF)" compact>
                    <AutocompleteGenerico items={opcoesEstado} value={formData.estado || ""} onChange={(v) => handleChange("estado", v || "")} placeholder="UF" displayField="nome" searchFields={["nome"]} disabled={isReadOnly} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1" />
                  </FL>
                </div>
              )}

              {activeTab === "observacoes" && (
                <div className="space-y-1">
                  <FL label="Observações" wide>
                    <Textarea value={formData.observacoes} onChange={(e) => handleChange("observacoes", e.target.value)} placeholder="OBSERVAÇÕES GERAIS..." className="text-xs uppercase bg-transparent px-1 min-h-[80px] border-0 rounded-none shadow-none focus-visible:ring-0" disabled={isReadOnly} />
                  </FL>
                </div>
              )}

              {activeTab === "campos_personalizados" && camposPersonalizadosForm.length > 0 && <>
                {camposPersonalizadosForm.map((campo) => (
                  <FL key={campo.field_name} label={campo.label} required={campo.obrigatorio} wide={["textarea", "option_list"].includes(campo.tipo)} compact={["number", "date", "time"].includes(campo.tipo)}>
                    {renderCampoPersonalizado(campo)}
                  </FL>
                ))}
              </>}

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}