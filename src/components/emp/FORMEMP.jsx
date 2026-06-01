import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/components/emp/empRepository";
import campoEngine from "@/components/emp/empCampoEngine";
import EmpAutocomplete from "@/components/emp/shared/EmpAutocomplete";
import TopNoticeDialog from "@/components/common/TopNoticeDialog";
import LegacyRecordToolbar from "@/components/emp/toolbars/EmpRecordToolbar";
import LegacyTabs from "@/components/emp/toolbars/EmpTabs";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import EmpDynamicFormRenderer from "@/components/emp/layout/EmpDynamicFormRenderer";
import EmpLayoutConfiguratorDialog from "@/components/emp/layout/EmpLayoutConfiguratorDialog";
import EmpFieldLayoutConfigDialog from "@/components/emp/layout/EmpFieldLayoutConfigDialog";
import empFormLayoutStore, {
  normalizeLayoutConfig,
} from "@/components/emp/layout/empFormLayoutStore";
import { countRequiredFormFields } from "@/components/emp/layout/empFormLayoutMetrics";
import EmpBubbleCounter from "@/components/emp/shared/EmpBubbleCounter";
import EmpOptionListControl from "@/components/emp/shared/EmpOptionListControl";
import EmpFormImageField from "@/components/emp/shared/EmpFormImageField";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronRight } from "lucide-react";

const ESTADOS_BR = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const UPPER_FIELDS = ["razao_social", "nome_fantasia", "cpf_cnpj", "inscricao_estadual", "email", "cep", "endereco", "numero", "bairro", "cidade", "estado", "observacoes"];
const REQUIRED_FIELDS = ["razao_social", "tipo_pessoa"];
const FORM_LAYOUT_KEY = "cadastro_emp_form_layout_config";
const TABLE_AGGREGATION_KEY = "emp_table_aggregation_config";

const inputClass = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-white px-1";

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

const applyDuplicateFieldClears = (data, clearFieldIds = []) => {
  if (!data?._isDuplicate || !clearFieldIds.length) return data;
  const next = { ...data, campos_personalizados: { ...(data.campos_personalizados || {}) } };
  clearFieldIds.forEach((fieldId) => {
    if (fieldId === "codigo_empresa") return;
    if (String(fieldId).startsWith("custom:")) {
      next.campos_personalizados[String(fieldId).replace(/^custom:/, "")] = "";
      return;
    }
    if (fieldId === "status") next.status = "Ativa";
    else if (fieldId === "tipo_pessoa") next.tipo_pessoa = "PJ";
    else next[fieldId] = "";
  });
  return next;
};

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
  searchValue = "", onSearchChange,
  initialData, isEditing
}) {
  const isDuplicating = !!initialData?._isDuplicate;
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("geral");
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [fieldLayoutConfigOpen, setFieldLayoutConfigOpen] = useState(false);
  const [layoutPresetsState, setLayoutPresetsState] = useState(() => empFormLayoutStore.getState());
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
    let next = buildFormData(initialData);
    if (initialData?._isDuplicate) {
      const saved = localStorage.getItem(FORM_LAYOUT_KEY);
      let clearIds = formLayoutConfig?.clearOnDuplicateFieldIds || [];
      if (!clearIds.length && saved) {
        try {
          clearIds = JSON.parse(saved).clearOnDuplicateFieldIds || [];
        } catch {
          clearIds = [];
        }
      }
      next = applyDuplicateFieldClears(next, clearIds);
    }
    setFormData(next);
    setErrors({});
    setEditMode(!isEditing || !!initialData?._isDuplicate);
    setActiveTab("geral");
  }, [initialData?.id, initialData?.codigo_empresa, initialData?._isDuplicate, isEditing, formLayoutConfig?.clearOnDuplicateFieldIds]);

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
    const customInputClass = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1";

    if (campo.tipo === "textarea") {
      return <Textarea value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={fieldReadOnly} className={`text-xs uppercase bg-transparent px-1 ${readOnlyClass}`} rows={campo.rows || 2} />;
    }

    if (campo.tipo === "calculado") {
      const calculatedValue = campoEngine.calcularCampo(formData, campo);
      const places = Math.min(6, Math.max(0, Number(campo.decimal_places ?? 2)));
      return <Input value={Number(calculatedValue || 0).toLocaleString("pt-BR", campo.usar_decimal ? { minimumFractionDigits: places, maximumFractionDigits: places } : { maximumFractionDigits: 2 })} readOnly placeholder="CALCULADO" className={`${customInputClass} bg-slate-50`} />;
    }

    if (campo.tipo === "option_list") {
      const options = campoOptions.map((option) => ({ value: String(option.value || option.label || "").toUpperCase(), label: String(option.label || option.value || "").toUpperCase() }));
      return <EmpOptionListControl options={options} value={value} onChange={(nextValue) => handleCustomChange(campo.field_name, nextValue)} disabled={fieldReadOnly} placeholder={(campo.placeholder || "SELECIONE UMA OU MAIS OPÇÕES").toUpperCase()} />;
    }

    if (campo.tipo === "select" || campo.tipo === "relation") {
      const options = campoOptions.map((option) => ({ id: String(option.value || option.label || ""), nome: String(option.label || option.value || "").toUpperCase() })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
      return <EmpAutocomplete items={options} value={value} onChange={(nextValue) => handleCustomChange(campo.field_name, nextValue || "")} placeholder={(campo.placeholder || "BUSCAR OPÇÃO...").toUpperCase()} displayField="nome" searchFields={["nome"]} disabled={fieldReadOnly} readOnly={fieldReadOnly} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1" />;
    }

    if (campo.tipo === "time") {
      return <Input type="time" value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} readOnly={fieldReadOnly} className={`${customInputClass} ${readOnlyClass}`} />;
    }

    if (["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo)) {
      const dateTimeValue = splitDateTimeValue(value);
      return <div className="grid grid-cols-2 gap-1"><Input type="date" value={dateTimeValue.date} onChange={(e) => handleCustomDateTimeChange(campo.field_name, "date", e.target.value)} readOnly={fieldReadOnly} className={`${customInputClass} ${readOnlyClass}`} /><Input type="time" value={dateTimeValue.time} onChange={(e) => handleCustomDateTimeChange(campo.field_name, "time", e.target.value)} readOnly={fieldReadOnly} className={`${customInputClass} ${readOnlyClass}`} /></div>;
    }

    if (campo.tipo === "number" && campo.usar_mascara) {
      return <Input type="text" inputMode="numeric" value={formatMaskedNumber(value, campo)} onChange={(e) => handleCustomChange(campo.field_name, formatMaskedNumber(e.target.value, campo))} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={fieldReadOnly} className={`${customInputClass} ${readOnlyClass}`} />;
    }

    if (["imagem", "image", "file"].includes(campo.tipo)) {
      return (
        <EmpFormImageField
          value={value}
          readOnly={fieldReadOnly}
          onUpload={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            base44.integrations.Core.UploadFile({ file })
              .then(({ file_url }) => handleCustomChange(campo.field_name, file_url))
              .catch(() => setNoticeDialog({ open: true, title: "Erro ao enviar", description: "Não foi possível enviar a imagem." }));
          }}
          onClear={() => handleCustomChange(campo.field_name, "")}
          alt={campo.label || "Imagem"}
        />
      );
    }

    return <Input type={campo.tipo === "number" ? "number" : campo.tipo === "date" ? "date" : "text"} value={value} onChange={(e) => handleCustomChange(campo.field_name, e.target.value)} placeholder={(campo.placeholder || campo.label || "").toUpperCase()} readOnly={fieldReadOnly} className={`${customInputClass} ${campo.uppercase ? "uppercase" : ""} ${readOnlyClass}`} />;
  };

  const dynamicFields = useMemo(() => [
    { id: "razao_social", name: "razao_social", label: "Razão Social", type: "text", required: true, errorKey: "razao_social", wide: true, uppercase: true, placeholder: "RAZÃO SOCIAL OU NOME COMPLETO" },
    { id: "status", name: "status", label: "Ativa", type: "switch", compact: true, render: () => <ToggleSwitch checked={formData.status !== "Inativa"} onChange={(checked) => handleChange("status", checked ? "Ativa" : "Inativa")} disabled={isReadOnly} className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" /> },
    { id: "codigo_empresa", name: "codigo_empresa", label: "Código", type: "text", compact: true, readOnly: true, render: () => <Input value={formData.codigo_empresa || ""} readOnly className={inputClass} placeholder="AUTO" /> },
    { id: "nome_fantasia", name: "nome_fantasia", label: "Nome Fantasia", type: "text", wide: true, uppercase: true, placeholder: "NOME FANTASIA" },
    { id: "tipo_pessoa", name: "tipo_pessoa", label: "Tipo de Pessoa", type: "autocomplete", required: true, compact: true, errorKey: "tipo_pessoa", options: opcoesTipoPessoa, placeholder: "PF / PJ", displayField: "nome", searchFields: ["nome"] },
    { id: "cpf_cnpj", name: "cpf_cnpj", label: formData.tipo_pessoa === "PF" ? "CPF" : "CNPJ", type: "text", compact: true, placeholder: formData.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00" },
    { id: "inscricao_estadual", name: "inscricao_estadual", label: "Inscrição Estadual", type: "text", compact: true, placeholder: "INSCRIÇÃO ESTADUAL" },
    { id: "telefone", name: "telefone", label: "Telefone", type: "text", compact: true, placeholder: "(00) 0000-0000" },
    { id: "whatsapp", name: "whatsapp", label: "WhatsApp", type: "text", compact: true, placeholder: "(00) 00000-0000" },
    { id: "email", name: "email", label: "E-mail", type: "text", placeholder: "EMAIL@EMPRESA.COM.BR" },
    { id: "logo_url", name: "logo_url", label: "Logo da Empresa", type: "image", compact: true, render: () => <EmpFormImageField value={formData.logo_url} readOnly={isReadOnly} uploading={uploadingLogo} onUpload={handleLogoUpload} onClear={() => handleChange("logo_url", "")} alt="Logo da empresa" /> },
    { id: "cep", name: "cep", label: "CEP", type: "text", compact: true, placeholder: "00000-000" },
    { id: "endereco", name: "endereco", label: "Endereço", type: "text", wide: true, uppercase: true, placeholder: "RUA, AVENIDA..." },
    { id: "numero", name: "numero", label: "Número", type: "text", compact: true, placeholder: "Nº" },
    { id: "bairro", name: "bairro", label: "Bairro", type: "text", uppercase: true, placeholder: "BAIRRO" },
    { id: "cidade", name: "cidade", label: "Cidade", type: "text", uppercase: true, placeholder: "CIDADE" },
    { id: "estado", name: "estado", label: "Estado (UF)", type: "autocomplete", compact: true, options: opcoesEstado, placeholder: "UF", displayField: "nome", searchFields: ["nome"] },
    { id: "observacoes", name: "observacoes", label: "Observações", type: "textarea", wide: true, uppercase: true, placeholder: "OBSERVAÇÕES GERAIS..." },
    ...camposPersonalizadosForm.map((campo) => ({ id: `custom:${campo.field_name}`, name: campo.field_name, label: campo.label, type: campo.tipo, origem: "customizado", optionsMode: ["select", "option_list"].includes(campo.tipo) && !(campo.options_source_entity || campo.relation_entity) ? "manual" : "", required: campo.obrigatorio, errorKey: `campos_personalizados.${campo.field_name}`, wide: ["textarea", "option_list"].includes(campo.tipo), medium: ["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo), compact: (["number", "date", "time", "calculado"].includes(campo.tipo) && !campo.usar_mascara) || ["imagem", "image", "file"].includes(campo.tipo), totalizable: ["number", "calculado"].includes(campo.tipo) && !campo.usar_mascara, options: ["select", "option_list"].includes(campo.tipo) ? campoEngine.getOptionsCampo(campo, relatedOptions).map((option) => ({ id: String(option.value || option.label || ""), nome: String(option.label || option.value || "").toUpperCase() })) : [], displayField: "nome", searchFields: ["nome"], render: () => renderCampoPersonalizado(campo) }))
  ], [formData, isReadOnly, opcoesEstado, opcoesTipoPessoa, uploadingLogo, camposPersonalizadosForm, relatedOptions]);

  const basePanels = [
    { id: "principal", label: "Principal" },
    { id: "geral", label: "Geral" },
    { id: "endereco", label: "Endereço" },
    { id: "observacoes", label: "Observações" },
    ...(camposPersonalizadosForm.length > 0 ? [{ id: "campos_personalizados", label: "Campos Personalizados" }] : [])
  ];

  const defaultLayout = {
    principal: ["razao_social"],
    geral: ["nome_fantasia", "tipo_pessoa", "cpf_cnpj", "inscricao_estadual", "telefone", "whatsapp", "email", "logo_url"],
    endereco: ["cep", "endereco", "numero", "bairro", "cidade", "estado"],
    observacoes: ["observacoes"],
    campos_personalizados: camposPersonalizadosForm.map((campo) => `custom:${campo.field_name}`)
  };

  const defaultConfigFull = useMemo(
    () => ({
      panels: basePanels,
      layout: defaultLayout,
      hiddenFieldIds: [],
      lockedFieldIds: [],
      requiredFieldIds: [],
      clearOnDuplicateFieldIds: [],
      fieldDefaultValues: {},
      aggregationConfig: {},
      visibilityRules: {},
      fieldLayoutConfig: { mode: "compact", columns: 3 },
    }),
    [basePanels, defaultLayout]
  );

  const activeLayoutConfig = useMemo(() => {
    const presetConfig = empFormLayoutStore.resolvePresetConfig(
      layoutPresetsState.activePresetId,
      defaultConfigFull
    );
    const source = formLayoutConfig || presetConfig;
    return normalizeLayoutConfig(source, {
      basePanels,
      defaultLayout,
      camposPersonalizadosCount: camposPersonalizadosForm.length,
      mergeNewCustomFields: false,
    });
  }, [
    formLayoutConfig,
    layoutPresetsState.activePresetId,
    basePanels,
    defaultLayout,
    defaultConfigFull,
    camposPersonalizadosForm.length,
  ]);

  const tabs = activeLayoutConfig.panels.filter((panel) => {
    if (panel.id === "principal") return false;
    if (panel.hidden) return false;
    if (panel.id === "campos_personalizados" && camposPersonalizadosForm.length === 0) return false;
    return (activeLayoutConfig.layout?.[panel.id] || []).length > 0;
  });
  const principalLayoutFields = activeLayoutConfig.layout?.principal || [];
  const principalInUse = principalLayoutFields.length > 0;
  const fieldLayoutConfig = activeLayoutConfig.fieldLayoutConfig;
  const useDetailsPanelLayout = ["details", "detailsCompact"].includes(fieldLayoutConfig?.mode);
  const standalonePrincipalInUse = principalInUse && !useDetailsPanelLayout;
  const detailPanels = [
    ...(principalInUse ? activeLayoutConfig.panels.filter((panel) => panel.id === "principal" && !panel.hidden) : []),
    ...tabs,
  ];
  const [collapsedDetailPanelIds, setCollapsedDetailPanelIds] = useState([]);
  const toggleDetailPanel = (panelId) => {
    setCollapsedDetailPanelIds((prev) =>
      prev.includes(panelId) ? prev.filter((id) => id !== panelId) : [...prev, panelId]
    );
  };

  const requiredFieldStats = useMemo(() => {
    const panelIds = ["principal", ...tabs.map((panel) => panel.id)];
    return countRequiredFormFields({
      panelIds,
      layout: activeLayoutConfig.layout,
      fields: dynamicFields,
      hiddenFieldIds: activeLayoutConfig.hiddenFieldIds || [],
      requiredFieldIds: activeLayoutConfig.requiredFieldIds || [],
      visibilityRules: activeLayoutConfig.visibilityRules || {},
      values: formData,
      nativeRequiredFieldNames: REQUIRED_FIELDS,
    });
  }, [tabs, activeLayoutConfig, dynamicFields, formData]);

  const applyLayoutConfig = (source, { updateActiveTab = true } = {}) => {
    const normalized = normalizeLayoutConfig(source, {
      basePanels,
      defaultLayout,
      camposPersonalizadosCount: camposPersonalizadosForm.length,
      mergeNewCustomFields: false,
    });
    setFormLayoutConfig(normalized);
    localStorage.setItem(FORM_LAYOUT_KEY, JSON.stringify(normalized));
    localStorage.setItem(TABLE_AGGREGATION_KEY, JSON.stringify(normalized.aggregationConfig || {}));
    window.dispatchEvent(new Event("emp-layout-updated"));
    empFormLayoutStore.persistActiveConfig(normalized);
    setLayoutPresetsState(empFormLayoutStore.getState());
    if (updateActiveTab) {
      const visiblePanels = normalized.panels.filter((panel) => !panel.hidden && panel.id !== "principal");
      if (!visiblePanels.some((panel) => panel.id === activeTab)) {
        setActiveTab(visiblePanels[0]?.id || "geral");
      }
    }
    return normalized;
  };

  const handleApplyLayoutPreset = (presetId) => {
    empFormLayoutStore.setActivePreset(presetId);
    const config = empFormLayoutStore.resolvePresetConfig(presetId, defaultConfigFull);
    applyLayoutConfig(config);
  };

  const handleCreateLayoutPreset = ({ name, sourcePresetId }) => {
    empFormLayoutStore.createPreset({ name, sourcePresetId, defaultConfig: defaultConfigFull });
    const config = empFormLayoutStore.resolvePresetConfig(
      empFormLayoutStore.getActivePresetId(),
      defaultConfigFull
    );
    applyLayoutConfig(config);
  };

  const handleDeleteLayoutPreset = (presetId) => {
    empFormLayoutStore.deletePreset(presetId);
    const config = empFormLayoutStore.resolvePresetConfig(
      empFormLayoutStore.getActivePresetId(),
      defaultConfigFull
    );
    applyLayoutConfig(config);
  };

  const handleRenameLayoutPreset = ({ presetId, name }) => {
    empFormLayoutStore.renamePreset(presetId, name);
    setLayoutPresetsState(empFormLayoutStore.getState());
  };

  const saveLayoutConfig = (nextConfig) => {
    applyLayoutConfig({
      ...activeLayoutConfig,
      ...nextConfig,
    });
  };

  const saveFieldLayoutConfig = (nextFieldLayoutConfig) => {
    applyLayoutConfig({
      ...activeLayoutConfig,
      fieldLayoutConfig: nextFieldLayoutConfig,
    });
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
        <EmpLayoutConfiguratorDialog
          open={layoutConfigOpen}
          onOpenChange={setLayoutConfigOpen}
          inline
          panels={activeLayoutConfig.panels}
          fields={dynamicFields}
          layout={activeLayoutConfig.layout}
          hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
          lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
          requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
          clearOnDuplicateFieldIds={activeLayoutConfig.clearOnDuplicateFieldIds || []}
          fieldDefaultValues={activeLayoutConfig.fieldDefaultValues || {}}
          aggregationConfig={activeLayoutConfig.aggregationConfig || {}}
          visibilityRules={activeLayoutConfig.visibilityRules || {}}
          defaultConfig={defaultConfigFull}
          layoutPresets={layoutPresetsState.presets}
          activePresetId={layoutPresetsState.activePresetId}
          onPresetApply={handleApplyLayoutPreset}
          onCreateLayoutPreset={handleCreateLayoutPreset}
          onRenameLayoutPreset={handleRenameLayoutPreset}
          onDeleteLayoutPreset={handleDeleteLayoutPreset}
          systemPanelIds={["principal", "geral", "endereco", "observacoes", "campos_personalizados"]}
          fixedPanelIds={["principal"]}
          fixedVisibleFieldIds={[]}
          onSave={saveLayoutConfig}
          brandTheme
        />
      </section>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white">
      <TopNoticeDialog open={noticeDialog.open} onOpenChange={(open) => setNoticeDialog((prev) => ({ ...prev, open }))} badge="AVISO" title={noticeDialog.title} description={noticeDialog.description} type="warning" confirmText="Entendi" />
      <EmpFieldLayoutConfigDialog
        open={fieldLayoutConfigOpen}
        onOpenChange={setFieldLayoutConfigOpen}
        fieldLayoutConfig={fieldLayoutConfig}
        onSave={saveFieldLayoutConfig}
      />
      <form onSubmit={handleSubmit} className="bg-white h-full min-h-0 overflow-hidden flex flex-col">
        <style>{`
          .form-scroll-container {
            scrollbar-width: thin;
            scrollbar-color: #94a3b8 #ffffff;
            overflow: scroll;
            scrollbar-gutter: stable both-edges;
            background: #ffffff;
          }
          .form-scroll-container::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          .form-scroll-container::-webkit-scrollbar-track {
            background: #ffffff;
          }
          .form-scroll-container::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .form-scroll-container::-webkit-scrollbar-thumb:hover {
            background-color: #94a3b8;
          }
        `}</style>
        <LegacyRecordToolbar
          title={`${formData.codigo_empresa ? `${formData.codigo_empresa} - ` : ""}${formData.razao_social || (isDuplicating ? "Duplicar empresa" : isEditing ? "Editar empresa" : "Nova empresa")}`}
          badgeLabel="EMPRESA"
          operationLabel={operationLabel}
          showSaveActions={editMode}
          showEditAction={isReadOnly}
          showDeleteDuplicateActions={isEditing && !editMode && !isDuplicating}
          showRecordNavigation={isEditing && !editMode && !isDuplicating}
          onSave={handleSubmit}
          onCancel={onCancel}
          onEditRecord={() => setEditMode(true)}
          onSettingsClick={onSettingsClick}
          onLayoutConfigClick={() => { if (filterOpen) onToggleFilter?.(); setLayoutConfigOpen(true); }}
          onFieldLayoutConfigClick={() => { if (filterOpen) onToggleFilter?.(); setFieldLayoutConfigOpen(true); }}
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
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          showSearch
        />

        <div className="flex-1 min-h-0 pb-6 pr-2 form-scroll-container">
          <div className={`emp-form-body flex flex-col ${standalonePrincipalInUse ? "" : "emp-form-body-no-principal"}`}>
            {standalonePrincipalInUse && (
              <div className="emp-form-section emp-form-section-principal w-max min-w-[920px] max-w-none pl-2 pr-4">
                <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}>
                  <EmpDynamicFormRenderer
                    panels={activeLayoutConfig.panels}
                    fields={dynamicFields}
                    layout={activeLayoutConfig.layout}
                    hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                    lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                    requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                    visibilityRules={activeLayoutConfig.visibilityRules || {}}
                    fieldLayoutConfig={fieldLayoutConfig}
                    activePanelId="principal"
                    values={formData}
                    errors={errors}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                  />
                </fieldset>
              </div>
            )}

            <div className={`emp-form-panels-zone flex min-h-0 flex-1 flex-col ${standalonePrincipalInUse ? "" : "emp-form-panels-zone-no-principal"} ${useDetailsPanelLayout ? "emp-form-panels-zone-details" : ""}`}>
              {!useDetailsPanelLayout ? (
                <>
                  <LegacyTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    trailing={
                      <EmpBubbleCounter
                        value={`${requiredFieldStats.filled}/${requiredFieldStats.total}`}
                        title="Campos obrigatórios preenchidos"
                        className="emp-toolbar-bubble-counter"
                      />
                    }
                  />

                  <div className="emp-form-section emp-form-section-panel min-h-[380px] w-full min-w-[920px] max-w-none pl-2 pr-4">
                    <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}>
                      <EmpDynamicFormRenderer
                        panels={tabs}
                        fields={dynamicFields}
                        layout={activeLayoutConfig.layout}
                        hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                        lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                        requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                        visibilityRules={activeLayoutConfig.visibilityRules || {}}
                        fieldLayoutConfig={fieldLayoutConfig}
                        activePanelId={activeTab}
                        values={formData}
                        errors={errors}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                      />
                    </fieldset>
                  </div>
                </>
              ) : (
                <div className="emp-form-details-panels flex flex-col gap-2">
                  <div className="emp-form-details-summary flex items-center justify-end pr-2">
                    <EmpBubbleCounter
                      value={`${requiredFieldStats.filled}/${requiredFieldStats.total}`}
                      title="Campos obrigatórios preenchidos"
                      className="emp-toolbar-bubble-counter"
                    />
                  </div>
                  {detailPanels.map((panel) => (
                    <div key={panel.id} className={`emp-form-section emp-form-section-panel emp-form-section-panel-detail w-full min-w-[920px] max-w-none pl-2 pr-4 ${collapsedDetailPanelIds.includes(panel.id) ? "emp-form-section-panel-detail-collapsed" : ""}`}>
                      <button
                        type="button"
                        className="emp-form-detail-panel-title"
                        onClick={() => toggleDetailPanel(panel.id)}
                        aria-expanded={!collapsedDetailPanelIds.includes(panel.id)}
                      >
                        {collapsedDetailPanelIds.includes(panel.id) ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        <span>{panel.label || panel.name}</span>
                      </button>
                      {!collapsedDetailPanelIds.includes(panel.id) && (
                        <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}>
                          <EmpDynamicFormRenderer
                            panels={detailPanels}
                            fields={dynamicFields}
                            layout={activeLayoutConfig.layout}
                            hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                            lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                            requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                            visibilityRules={activeLayoutConfig.visibilityRules || {}}
                            fieldLayoutConfig={fieldLayoutConfig}
                            activePanelId={panel.id}
                            values={formData}
                            errors={errors}
                            onChange={handleChange}
                            readOnly={isReadOnly}
                          />
                        </fieldset>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}