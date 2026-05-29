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
import DynamicFormRenderer from "@/components/dynamic/DynamicFormRenderer";
import LayoutConfiguratorDialog from "@/components/dynamic/LayoutConfiguratorDialog";
import CustomOptionListControl from "@/components/lotes/CustomOptionListControl";
import { base44 } from "@/api/base44Client";

const ESTADOS_BR = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const UPPER_FIELDS = ["razao_social", "nome_fantasia", "cpf_cnpj", "inscricao_estadual", "email", "cep", "endereco", "numero", "bairro", "cidade", "estado", "observacoes"];
const REQUIRED_FIELDS = ["razao_social", "tipo_pessoa"];
const FORM_LAYOUT_KEY = "cadastro_emp_form_layout_config";
const TABLE_AGGREGATION_KEY = "emp_table_aggregation_config";

const inputClass = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1";

const buildEmpty = () => ({
  codigo_empresa: "",
  razao_social: "",
  nome_fantasia: "",
  tipo_pessoa: "PJ",
  cpf_cnpj: "",
  inscricao_estadual: "",
  telefone: "",
  whatsapp: "",
  email: "",
  logo_url: "",
  cep: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  observacoes: "",
  status: "Ativa",
  campos_personalizados: {}
});

const NATIVE_FIELDS = new Set([
  "codigo_empresa", "razao_social", "nome_fantasia", "tipo_pessoa", "cpf_cnpj",
  "inscricao_estadual", "telefone", "whatsapp", "email", "logo_url", "cep",
  "endereco", "numero", "bairro", "cidade", "estado", "observacoes", "status",
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
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [noticeDialog, setNoticeDialog] = useState({ open: false, title: "", description: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editMode, setEditMode] = useState(!isEditing || isDuplicating);
  const [formLayoutConfig, setFormLayoutConfig] = useState(() => {
    const saved = localStorage.getItem(FORM_LAYOUT_KEY);
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
  });

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

  const camposPersonalizadosForm = useMemo(() => camposPersonalizados
    .map(campoEngine.normalize)
    .filter((campo) => campo.ativo !== false && campo.visivel_form !== false && !NATIVE_FIELDS.has(campo.field_name)),
    [camposPersonalizados]
  );

  const relatedSources = useMemo(() => camposPersonalizadosForm
    .map((campo) => {
      const entity = campoEngine.getOptionsSourceKey(campo);
      return campo.tipo === "relation" && entity ? { entity, labelField: campo.options_label_field || campo.relation_display_field || "nome", valueField: campo.options_value_field || "id" } : null;
    })
    .filter(Boolean),
    [camposPersonalizadosForm]
  );

  const { data: relatedOptions = {} } = useQuery({
    queryKey: ["emp-form-related-options", relatedSources.map((source) => `${source.entity}:${source.labelField}:${source.valueField}`).join("|")],
    queryFn: () => empRepository.listOptionsSources(relatedSources),
    enabled: relatedSources.length > 0,
    initialData: {}
  });

  const isReadOnly = isEditing && !isDuplicating && !editMode;
  const readOnlyClass = isReadOnly ? "cursor-default" : "";

  const handleChange = (field, value) => {
    if (isReadOnly) return;
    const normalized = UPPER_FIELDS.includes(field) && typeof value === "string" ? value.toUpperCase() : value;
    setErrors((prev) => ({ ...prev, [field]: false }));
    setFormData((prev) => ({ ...prev, [field]: normalized }));
  };

  const handleCustomChange = (fieldName, value) => {
    if (isReadOnly) return;
    setErrors((prev) => ({ ...prev, [`campos_personalizados.${fieldName}`]: false }));
    setFormData((prev) => {
      const next = {
        ...prev,
        campos_personalizados: {
          ...(prev.campos_personalizados || {}),
          [fieldName]: value
        }
      };
      return campoEngine.aplicarCamposCalculados ? campoEngine.aplicarCamposCalculados(next, camposPersonalizadosForm) : next;
    });
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData((prev) => ({ ...prev, logo_url: file_url }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const opcoesEstado = useMemo(() => ESTADOS_BR.map((item) => ({ id: item, nome: item })), []);
  const opcoesTipoPessoa = useMemo(() => [{ id: "PF", nome: "PESSOA FÍSICA (PF)" }, { id: "PJ", nome: "PESSOA JURÍDICA (PJ)" }], []);

  const splitDateTimeValue = (value) => {
    if (!value) return { date: "", time: "" };
    const [datePart, timePart = ""] = String(value).replace(" ", "T").split("T");
    return { date: datePart || "", time: timePart.slice(0, 5) || "" };
  };

  const handleCustomDateTimeChange = (fieldName, part, nextValue) => {
    const current = splitDateTimeValue(formData.campos_personalizados?.[fieldName]);
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const next = {
      ...current,
      [part]: nextValue,
      ...(part === "date" && nextValue && !current.time ? { time: horaAtual } : {})
    };
    handleCustomChange(fieldName, next.date ? `${next.date}T${next.time || "00:00"}` : "");
  };

  const onlyDigits = (value) => String(value || "").replace(/\D/g, "");
  const applyNumberMask = (digits, mask) => {
    let index = 0;
    return String(mask || "").replace(/#/g, () => digits[index++] || "").replace(/[^0-9]+$/g, "");
  };
  const getBestMask = (digits, masks) => masks.find((mask) => (mask.match(/#/g) || []).length >= digits.length) || masks[masks.length - 1] || "";
  const formatMaskedNumber = (value, campo) => {
    const masks = String(campo.mascaras_text || "").split("\n").map((item) => item.trim()).filter(Boolean).sort((a, b) => (a.match(/#/g) || []).length - (b.match(/#/g) || []).length);
    const maxDigits = Math.max(...masks.map((mask) => (mask.match(/#/g) || []).length), 0);
    const digits = onlyDigits(value).slice(0, maxDigits || undefined);
    return applyNumberMask(digits, getBestMask(digits, masks));
  };

  const renderCampoPersonalizado = (campo) => {
    const value = formData.campos_personalizados?.[campo.field_name] || "";
    const campoOptions = campoEngine.getOptionsCampo(campo, relatedOptions);
    const fieldReadOnly = campo.read_only || isReadOnly;

    if (campo.tipo === "textarea") {
      return <Textarea value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={fieldReadOnly} className={`text-xs uppercase bg-transparent px-1 ${readOnlyClass}`} rows={campo.rows || 2} />;
    }

    if (campo.tipo === "calculado") {
      const calculatedValue = campoEngine.calcularCampo(formData, campo);
      const places = Math.min(6, Math.max(0, Number(campo.decimal_places ?? 2)));
      return <Input value={Number(calculatedValue || 0).toLocaleString("pt-BR", campo.usar_decimal ? { minimumFractionDigits: places, maximumFractionDigits: places } : { maximumFractionDigits: 2 })} readOnly placeholder="CALCULADO" className={`${inputClass} bg-slate-50`} />;
    }

    if (campo.tipo === "option_list") {
      const options = campoOptions.map((option) => ({ value: String(option.value || option.label || "").toUpperCase(), label: String(option.label || option.value || "").toUpperCase() }));
      return <CustomOptionListControl options={options} value={value} onChange={(nextValue) => handleCustomChange(campo.field_name, nextValue)} disabled={fieldReadOnly} placeholder={(campo.placeholder || "SELECIONE UMA OU MAIS OPÇÕES").toUpperCase()} />;
    }

    if (campo.tipo === "select" || campo.tipo === "relation") {
      const options = campoOptions.map((option) => ({ id: String(option.value || option.label || ""), nome: String(option.label || option.value || "").toUpperCase() })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
      return <AutocompleteGenerico items={options} value={value} onChange={(nextValue) => handleCustomChange(campo.field_name, nextValue || "")} placeholder={(campo.placeholder || "BUSCAR OPÇÃO...").toUpperCase()} displayField="nome" searchFields={["nome"]} disabled={fieldReadOnly} readOnly={fieldReadOnly} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1" />;
    }

    if (campo.tipo === "time") {
      return <Input type="time" value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} readOnly={fieldReadOnly} className={`${inputClass} ${readOnlyClass}`} />;
    }

    if (["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo)) {
      const dateTimeValue = splitDateTimeValue(value);
      return <div className="grid grid-cols-2 gap-1"><Input type="date" value={dateTimeValue.date} onChange={(e) => handleCustomDateTimeChange(campo.field_name, "date", e.target.value)} readOnly={fieldReadOnly} className={`${inputClass} ${readOnlyClass}`} /><Input type="time" value={dateTimeValue.time} onChange={(e) => handleCustomDateTimeChange(campo.field_name, "time", e.target.value)} readOnly={fieldReadOnly} className={`${inputClass} ${readOnlyClass}`} /></div>;
    }

    if (campo.tipo === "number" && campo.usar_mascara) {
      return <Input type="text" inputMode="numeric" value={formatMaskedNumber(value, campo)} onChange={(e) => handleCustomChange(campo.field_name, formatMaskedNumber(e.target.value, campo))} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={fieldReadOnly} className={`${inputClass} ${readOnlyClass}`} />;
    }

    return <Input type={campo.tipo === "number" ? "number" : campo.tipo === "date" ? "date" : "text"} value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={fieldReadOnly} className={`${inputClass} ${campo.uppercase ? "uppercase" : ""} ${readOnlyClass}`} />;
  };

  const dynamicFields = useMemo(() => [
    { id: "razao_social", name: "razao_social", label: "Razão Social", type: "text", required: true, errorKey: "razao_social", wide: true, uppercase: true, placeholder: "RAZÃO SOCIAL OU NOME COMPLETO" },
    { id: "status", name: "status", label: "Ativa", type: "switch", compact: true, render: () => <div className="h-[22px] flex items-center px-1"><ToggleSwitch checked={formData.status !== "Inativa"} onChange={(checked) => handleChange("status", checked ? "Ativa" : "Inativa")} disabled={isReadOnly} /></div> },
    { id: "codigo_empresa", name: "codigo_empresa", label: "Código", type: "text", compact: true, readOnly: true, render: () => <Input value={formData.codigo_empresa || ""} readOnly className={`${inputClass} text-right bg-slate-50`} placeholder="AUTO" /> },
    { id: "nome_fantasia", name: "nome_fantasia", label: "Nome Fantasia", type: "text", wide: true, uppercase: true, placeholder: "NOME FANTASIA" },
    { id: "tipo_pessoa", name: "tipo_pessoa", label: "Tipo de Pessoa", type: "autocomplete", required: true, compact: true, errorKey: "tipo_pessoa", options: opcoesTipoPessoa, placeholder: "PF / PJ", displayField: "nome", searchFields: ["nome"] },
    { id: "cpf_cnpj", name: "cpf_cnpj", label: formData.tipo_pessoa === "PF" ? "CPF" : "CNPJ", type: "text", compact: true, placeholder: formData.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00" },
    { id: "inscricao_estadual", name: "inscricao_estadual", label: "Inscrição Estadual", type: "text", compact: true, placeholder: "INSCRIÇÃO ESTADUAL" },
    { id: "telefone", name: "telefone", label: "Telefone", type: "text", compact: true, placeholder: "(00) 0000-0000" },
    { id: "whatsapp", name: "whatsapp", label: "WhatsApp", type: "text", compact: true, placeholder: "(00) 00000-0000" },
    { id: "email", name: "email", label: "E-mail", type: "text", placeholder: "EMAIL@EMPRESA.COM.BR" },
    { id: "logo_url", name: "logo_url", label: "Logo da Empresa", type: "file", wide: true, render: () => <div className="min-h-[36px] flex items-center gap-2 px-2 py-1 bg-white"><div className="flex items-center gap-2">{formData.logo_url && <img src={formData.logo_url} alt="Logo" className="h-8 w-8 object-contain border border-slate-200 rounded-sm bg-white" />}{!isReadOnly && <label className="cursor-pointer text-[11px] text-slate-600 hover:text-green-700 underline">{uploadingLogo ? "Enviando..." : formData.logo_url ? "Trocar logo" : "Selecionar logo"}<input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} /></label>}{!isReadOnly && formData.logo_url && <button type="button" onClick={() => handleChange("logo_url", "")} className="text-[11px] text-red-500 hover:text-red-700 underline ml-1">Remover</button>}{!formData.logo_url && isReadOnly && <span className="text-[11px] text-slate-400">Sem logo</span>}</div></div> },
    { id: "cep", name: "cep", label: "CEP", type: "text", compact: true, placeholder: "00000-000" },
    { id: "endereco", name: "endereco", label: "Endereço", type: "text", wide: true, uppercase: true, placeholder: "RUA, AVENIDA..." },
    { id: "numero", name: "numero", label: "Número", type: "text", compact: true, placeholder: "Nº" },
    { id: "bairro", name: "bairro", label: "Bairro", type: "text", uppercase: true, placeholder: "BAIRRO" },
    { id: "cidade", name: "cidade", label: "Cidade", type: "text", uppercase: true, placeholder: "CIDADE" },
    { id: "estado", name: "estado", label: "Estado (UF)", type: "autocomplete", compact: true, options: opcoesEstado, placeholder: "UF", displayField: "nome", searchFields: ["nome"] },
    { id: "observacoes", name: "observacoes", label: "Observações", type: "textarea", wide: true, uppercase: true, placeholder: "OBSERVAÇÕES GERAIS..." },
    ...camposPersonalizadosForm.map((campo) => ({ id: `custom:${campo.field_name}`, name: campo.field_name, label: campo.label, type: campo.tipo, origem: "customizado", optionsMode: ["select", "option_list"].includes(campo.tipo) && !(campo.options_source_entity || campo.relation_entity) ? "manual" : "", required: campo.obrigatorio, errorKey: `campos_personalizados.${campo.field_name}`, wide: ["textarea", "option_list"].includes(campo.tipo), medium: ["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo), compact: ["number", "date", "time", "calculado"].includes(campo.tipo) && !campo.usar_mascara, totalizable: ["number", "calculado"].includes(campo.tipo) && !campo.usar_mascara, options: ["select", "option_list"].includes(campo.tipo) ? campoEngine.getOptionsCampo(campo, relatedOptions).map((option) => ({ id: String(option.value || option.label || ""), nome: String(option.label || option.value || "").toUpperCase() })) : [], displayField: "nome", searchFields: ["nome"], render: () => renderCampoPersonalizado(campo) }))
  ], [formData, isReadOnly, opcoesEstado, opcoesTipoPessoa, uploadingLogo, camposPersonalizadosForm, relatedOptions]);

  const basePanels = [
    { id: "principal", label: "Principal" },
    { id: "geral", label: "Geral" },
    { id: "endereco", label: "Endereço" },
    { id: "observacoes", label: "Observações" },
    ...(camposPersonalizadosForm.length > 0 ? [{ id: "campos_personalizados", label: "Campos Personalizados" }] : [])
  ];

  const defaultLayout = {
    principal: ["razao_social", "status", "codigo_empresa"],
    geral: ["nome_fantasia", "tipo_pessoa", "cpf_cnpj", "inscricao_estadual", "telefone", "whatsapp", "email", "logo_url"],
    endereco: ["cep", "endereco", "numero", "bairro", "cidade", "estado"],
    observacoes: ["observacoes"],
    campos_personalizados: camposPersonalizadosForm.map((campo) => `custom:${campo.field_name}`)
  };

  const activeLayoutConfig = (() => {
    const source = formLayoutConfig || { panels: basePanels, layout: defaultLayout, hiddenFieldIds: [], lockedFieldIds: [], requiredFieldIds: [], aggregationConfig: {}, visibilityRules: {} };
    const panels = source.panels?.some((panel) => panel.id === "principal") ? source.panels : [basePanels[0], ...(source.panels || basePanels)];
    const principalFields = source.layout?.principal?.length ? source.layout.principal : defaultLayout.principal;
    return {
      ...source,
      panels,
      layout: { ...defaultLayout, ...source.layout, principal: principalFields, campos_personalizados: defaultLayout.campos_personalizados },
      hiddenFieldIds: (source.hiddenFieldIds || []).filter((id) => !["status", "codigo_empresa"].includes(id))
    };
  })();

  const tabs = activeLayoutConfig.panels.filter((panel) => {
    if (panel.id === "principal") return false;
    if (panel.hidden) return false;
    if (panel.id === "campos_personalizados" && camposPersonalizadosForm.length === 0) return false;
    return (activeLayoutConfig.layout?.[panel.id] || []).length > 0;
  });

  const saveLayoutConfig = (nextConfig) => {
    const normalized = {
      ...nextConfig,
      visibilityRules: nextConfig.visibilityRules || {},
      panels: nextConfig.panels.filter((panel) => panel.id !== "campos_personalizados" || camposPersonalizadosForm.length > 0),
      layout: { ...nextConfig.layout, principal: nextConfig.layout?.principal?.length ? nextConfig.layout.principal : defaultLayout.principal, campos_personalizados: defaultLayout.campos_personalizados },
      hiddenFieldIds: (nextConfig.hiddenFieldIds || []).filter((id) => !["status", "codigo_empresa"].includes(id))
    };
    setFormLayoutConfig(normalized);
    localStorage.setItem(FORM_LAYOUT_KEY, JSON.stringify(normalized));
    localStorage.setItem(TABLE_AGGREGATION_KEY, JSON.stringify(normalized.aggregationConfig || {}));
    window.dispatchEvent(new Event("emp-layout-updated"));
    const visiblePanels = normalized.panels.filter((panel) => !panel.hidden && panel.id !== "principal");
    if (!visiblePanels.some((panel) => panel.id === activeTab)) setActiveTab(visiblePanels[0]?.id || "geral");
  };

  const validateForm = () => {
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!String(formData?.[field] || "").trim()) nextErrors[field] = true;
    });
    const customValidation = campoEngine.buildValidationSchema(camposPersonalizadosForm).safeParse(formData.campos_personalizados || {});
    if (!customValidation.success) {
      customValidation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName) nextErrors[`campos_personalizados.${fieldName}`] = true;
      });
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) return true;
    setNoticeDialog({ open: true, title: "Campos obrigatórios", description: "Preencha os campos obrigatórios antes de salvar a empresa." });
    const firstField = Object.keys(nextErrors)[0];
    document.querySelector(`[data-field="${firstField}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };

  const handleSubmit = (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isReadOnly) return;
    if (!validateForm()) return;
    const calculated = campoEngine.aplicarCamposCalculados ? campoEngine.aplicarCamposCalculados(formData, camposPersonalizadosForm) : formData;
    const { _isDuplicate, ...clean } = { ...formData, campos_personalizados: calculated.campos_personalizados || {} };
    onSubmit(clean);
  };

  const operationLabel = isDuplicating ? "NOVO REGISTRO DUPLICADO" : isEditing ? editMode ? "EDIÇÃO DE REGISTRO" : "VISUALIZAÇÃO DE REGISTRO" : "NOVO REGISTRO";

  if (layoutConfigOpen) {
    return (
      <section className="w-full h-full max-w-full bg-white overflow-hidden">
        <LayoutConfiguratorDialog
          open={layoutConfigOpen}
          onOpenChange={setLayoutConfigOpen}
          inline
          panels={activeLayoutConfig.panels}
          fields={dynamicFields}
          layout={activeLayoutConfig.layout}
          hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
          lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
          requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
          aggregationConfig={activeLayoutConfig.aggregationConfig || {}}
          visibilityRules={activeLayoutConfig.visibilityRules || {}}
          defaultConfig={{ panels: basePanels, layout: defaultLayout, hiddenFieldIds: [], lockedFieldIds: [], requiredFieldIds: [], aggregationConfig: {}, visibilityRules: {} }}
          systemPanelIds={["principal", "geral", "endereco", "observacoes", "campos_personalizados"]}
          fixedPanelIds={["principal"]}
          fixedVisibleFieldIds={["status", "codigo_empresa"]}
          onSave={saveLayoutConfig}
        />
      </section>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white">
      <TopNoticeDialog open={noticeDialog.open} onOpenChange={(open) => setNoticeDialog((prev) => ({ ...prev, open }))} badge="AVISO" title={noticeDialog.title} description={noticeDialog.description} type="warning" confirmText="Entendi" />
      <form onSubmit={handleSubmit} className="bg-white h-full min-h-0 overflow-hidden flex flex-col">
        <LegacyRecordToolbar
          title={`${formData.codigo_empresa ? `${formData.codigo_empresa} - ` : ""}${formData.razao_social || (isDuplicating ? "Duplicar empresa" : isEditing ? "Editar empresa" : "Nova empresa")}`}
          badgeLabel="EMPRESA"
          operationLabel={operationLabel}
          showSaveActions={editMode}
          showEditAction={isReadOnly}
          showDeleteDuplicateActions={isEditing && !editMode && !isDuplicating}
          onSave={handleSubmit}
          onCancel={onCancel}
          onEditRecord={() => setEditMode(true)}
          onSettingsClick={onSettingsClick}
          onLayoutConfigClick={() => { if (filterOpen) onToggleFilter?.(); setLayoutConfigOpen(true); }}
          onToggleView={onToggleView}
          total={total}
          currentIndex={currentIndex}
          onNew={onNew}
          onFirst={onFirst}
          onPrevious={onPrevious}
          onNext={onNext}
          onLast={onLast}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onRefresh={onRefresh}
          filterOpen={filterOpen}
          filterActive={filterActive}
          onToggleFilter={onToggleFilter}
          onClearFilter={onClearFilter}
          onAttachClick={onAttachClick}
          attachDisabled={attachDisabled}
        />

        <div className="flex-1 min-h-0 overflow-y-auto pb-6 pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
          <fieldset className={isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}>
            <div className="px-4 md:px-8 py-1 max-w-[780px]">
              <DynamicFormRenderer
                panels={activeLayoutConfig.panels}
                fields={dynamicFields}
                layout={activeLayoutConfig.layout}
                hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                visibilityRules={activeLayoutConfig.visibilityRules || {}}
                activePanelId="principal"
                values={formData}
                errors={errors}
                onChange={handleChange}
                readOnly={isReadOnly}
                fieldClassName="rounded-[1.5px]"
              />
            </div>
          </fieldset>

          <LegacyTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <fieldset className={isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}>
            <div className="min-h-[360px] px-4 md:px-8 py-1">
              <div className="max-w-[780px] space-y-1">
                <DynamicFormRenderer
                  panels={tabs}
                  fields={dynamicFields}
                  layout={activeLayoutConfig.layout}
                  hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                  lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                  requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                  visibilityRules={activeLayoutConfig.visibilityRules || {}}
                  activePanelId={activeTab}
                  values={formData}
                  errors={errors}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  fieldClassName="rounded-[1.5px]"
                />
              </div>
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
}) {
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

  const readOnlyClass = isReadOnly ? "cursor-default" : "";

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
        <fieldset className={isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}>
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
                    <Input value={formData.nome_fantasia} onChange={(e) => handleChange("nome_fantasia", e.target.value)} placeholder="NOME FANTASIA" className={`${inputClass} uppercase ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Tipo de Pessoa" required error={errors.tipo_pessoa} compact>
                    <AutocompleteGenerico items={opcoesTipoPessoa} value={formData.tipo_pessoa || ""} onChange={(v) => handleChange("tipo_pessoa", v || "PJ")} placeholder="PF / PJ" displayField="nome" searchFields={["nome"]} readOnly={isReadOnly} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1" />
                  </FL>
                  <FL label={formData.tipo_pessoa === "PF" ? "CPF" : "CNPJ"} compact>
                    <Input value={formData.cpf_cnpj} onChange={(e) => handleChange("cpf_cnpj", e.target.value)} placeholder={formData.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} className={`${inputClass} ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Inscrição Estadual" compact>
                    <Input value={formData.inscricao_estadual} onChange={(e) => handleChange("inscricao_estadual", e.target.value)} placeholder="INSCRIÇÃO ESTADUAL" className={`${inputClass} ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Telefone" compact>
                    <Input value={formData.telefone} onChange={(e) => handleChange("telefone", e.target.value)} placeholder="(00) 0000-0000" className={`${inputClass} ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="WhatsApp" compact>
                    <Input value={formData.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} placeholder="(00) 00000-0000" className={`${inputClass} ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="E-mail">
                    <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="EMAIL@EMPRESA.COM.BR" className={`${inputClass} ${readOnlyClass}`} readOnly={isReadOnly} />
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
                    <Input value={formData.cep} onChange={(e) => handleChange("cep", e.target.value)} placeholder="00000-000" className={`${inputClass} ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Endereço" wide>
                    <Input value={formData.endereco} onChange={(e) => handleChange("endereco", e.target.value)} placeholder="RUA, AVENIDA..." className={`${inputClass} uppercase ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Número" compact>
                    <Input value={formData.numero} onChange={(e) => handleChange("numero", e.target.value)} placeholder="Nº" className={`${inputClass} ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Bairro">
                    <Input value={formData.bairro} onChange={(e) => handleChange("bairro", e.target.value)} placeholder="BAIRRO" className={`${inputClass} uppercase ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Cidade">
                    <Input value={formData.cidade} onChange={(e) => handleChange("cidade", e.target.value)} placeholder="CIDADE" className={`${inputClass} uppercase ${readOnlyClass}`} readOnly={isReadOnly} />
                  </FL>
                  <FL label="Estado (UF)" compact>
                    <AutocompleteGenerico items={opcoesEstado} value={formData.estado || ""} onChange={(v) => handleChange("estado", v || "")} placeholder="UF" displayField="nome" searchFields={["nome"]} readOnly={isReadOnly} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1" />
                  </FL>
                </div>
              )}

              {activeTab === "observacoes" && (
                <div className="space-y-1">
                  <FL label="Observações" wide>
                    <Textarea value={formData.observacoes} onChange={(e) => handleChange("observacoes", e.target.value)} placeholder="OBSERVAÇÕES GERAIS..." className={`text-xs uppercase bg-transparent px-1 min-h-[80px] border-0 rounded-none shadow-none focus-visible:ring-0 ${readOnlyClass}`} readOnly={isReadOnly} />
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
        </fieldset>
      </form>
    </div>
  );
}