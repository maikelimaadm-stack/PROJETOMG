import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/shared/ui/input";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/modules/empresas/repositories/empRepository";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import { reportRequiredFieldErrors, clearRequiredFieldErrors, showError } from "@/shared/feedback";
import LegacyRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";
import { useErpPageHeader } from "@/shared/layouts/ErpPageHeaderContext";
import LegacyTabs from "@/framework/cadastro/toolbars/EmpTabs";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpDynamicFormRenderer from "@/framework/cadastro/layouts/EmpDynamicFormRenderer";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import EmpLayoutConfiguratorDialog from "@/framework/cadastro/configurators/EmpLayoutConfiguratorDialog";
import EmpFieldLayoutConfigDialog from "@/framework/cadastro/configurators/EmpFieldLayoutConfigDialog";
import empFormLayoutStore, {
  countKnownLayoutFields,
  ensureLayoutFields,
  getLayoutStorageKeys,
  normalizeLayoutConfig,
  pickLayoutConfig,
  readStoredLayoutConfig,
  writeStoredLayoutConfig,
} from "@/framework/cadastro/layouts/empFormLayoutStore";
import {
  initEmpresasFormLayoutLocal,
  scheduleEmpresasFormLayoutSync,
  syncEmpresasFormLayoutRemote,
} from "@/framework/cadastro/layouts/userLayoutPreferencesSync";
import { countRequiredFormFields } from "@/framework/cadastro/layouts/empFormLayoutMetrics";
import EmpBubbleCounter from "@/framework/cadastro/toolbars/EmpBubbleCounter";
import EmpFormImageField from "@/framework/cadastro/formularios/EmpFormImageField";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { useAuth } from "@/shared/contexts/AuthContext";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  ESTADOS_BR,
  UPPER_FIELDS,
  REQUIRED_FIELDS,
  inputClass,
  applyDuplicateFieldClears,
  buildEmptyEmpresaForm,
  buildEmpFormDefaultConfig,
  EMP_FORM_BASE_PANELS,
  EMP_FORM_DEFAULT_LAYOUT,
  NATIVE_FIELDS,
} from "./formEmp.constants";
import { useFormEmpCustomFields } from "./formEmp.customFields";

export default function FORMEMP({
  onSubmit, onCancel, onAttachClick, attachDisabled = false,
  onToggleView, total = 0, currentIndex = 0,
  onNew, onFirst, onPrevious, onNext, onLast,
  onDelete, onDuplicate, onRefresh,
  filterOpen = false, filterActive = false, onToggleFilter, onClearFilter,
  searchValue = "", onSearchChange,
  initialData,
  isEditing,
  recordKey,
}) {
  const { user } = useAuth();
  const isDuplicating = !!initialData?._isDuplicate;
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("geral");
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [fieldLayoutConfigOpen, setFieldLayoutConfigOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editMode, setEditMode] = useState(!isEditing || isDuplicating);
  const [formLayoutConfig, setFormLayoutConfig] = useState(null);
  const layoutPersistedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) {
      setFormLayoutConfig(null);
      layoutPersistedRef.current = false;
      return undefined;
    }

    const defaults = buildEmpFormDefaultConfig();
    const nativeIds = new Set(Object.values(EMP_FORM_DEFAULT_LAYOUT).flat().filter(Boolean));
    const localConfig = initEmpresasFormLayoutLocal(user.id);
    const repaired = ensureLayoutFields(localConfig, defaults, { knownFieldIds: nativeIds }) || defaults;
    if (JSON.stringify(pickLayoutConfig(repaired)) !== JSON.stringify(pickLayoutConfig(localConfig || {}))) {
      writeStoredLayoutConfig(repaired);
    }
    layoutPersistedRef.current = true;
    setFormLayoutConfig(repaired);
    syncEmpresasFormLayoutRemote(user.id);

    const handleLayoutHydrated = () => {
      const stored = readStoredLayoutConfig();
      if (!stored) return;
      layoutPersistedRef.current = false;
      const next = ensureLayoutFields(stored, defaults, { knownFieldIds: nativeIds }) || defaults;
      setFormLayoutConfig(next);
    };
    window.addEventListener("emp-layout-hydrated", handleLayoutHydrated);
    return () => window.removeEventListener("emp-layout-hydrated", handleLayoutHydrated);
  }, [user?.id]);

  const buildFormData = (data) =>
    data
      ? { ...buildEmptyEmpresaForm(), ...data, campos_personalizados: data.campos_personalizados || {} }
      : buildEmptyEmpresaForm();
  const [formData, setFormData] = useState(() => buildFormData(initialData));
  const previousRecordKeyRef = useRef(recordKey);

  useEffect(() => {
    let next = buildFormData(initialData);
    if (initialData?._isDuplicate) {
      const layoutKey = user?.id ? getLayoutStorageKeys(user.id).legacyKey : null;
      const saved = layoutKey ? localStorage.getItem(layoutKey) : null;
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
    const isRecordNavigation =
      isEditing &&
      !initialData?._isDuplicate &&
      previousRecordKeyRef.current &&
      recordKey &&
      previousRecordKeyRef.current !== recordKey &&
      recordKey !== "new" &&
      recordKey !== "duplicate";
    previousRecordKeyRef.current = recordKey;
    setFormData(next);
    setErrors({});
    setEditMode(!isEditing || !!initialData?._isDuplicate);
    if (!isRecordNavigation) {
      setActiveTab("geral");
    }
  }, [
    recordKey,
    initialData?.id,
    initialData?.codempresa,
    initialData?.updatedAt,
    initialData?._isDuplicate,
    isEditing,
    formLayoutConfig?.clearOnDuplicateFieldIds,
  ]);

  const { data: camposPersonalizados = [], isFetched: camposPersonalizadosReady } = useQuery({
    queryKey: ["emp-campos-personalizados"],
    queryFn: () => empRepository.listCamposPersonalizados(),
    initialData: [],
    staleTime: 60_000,
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
    initialData: {},
    placeholderData: (previous) => previous ?? {},
    staleTime: 120_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  const isReadOnly = isEditing && !isDuplicating && !editMode;

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
      const { file_url } = await AnexosApi.uploadFile(file);
      setFormData((prev) => ({ ...prev, logo_url: file_url }));
    } catch {
      showError("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const opcoesEstado = useMemo(() => ESTADOS_BR.map((item) => ({ id: item, nome: item })), []);

  const renderTipoPessoaSelect = () => (
    <select
      value={formData.tipo_pessoa || "PJ"}
      onChange={(event) => handleChange("tipo_pessoa", event.target.value)}
      disabled={isReadOnly}
      className={`${inputClass} w-full`}
    >
      <option value="PJ">PESSOA JURÍDICA (PJ)</option>
      <option value="PF">PESSOA FÍSICA (PF)</option>
    </select>
  );

  const renderTipoVinculoSelect = () => (
    <select
      value={formData.tipo_vinculo || ""}
      onChange={(event) => handleChange("tipo_vinculo", event.target.value)}
      disabled={isReadOnly}
      className={`${inputClass} w-full`}
    >
      <option value="">SELECIONE</option>
      <option value="proprietario">PROPRIETÁRIO</option>
      <option value="arrendatario">ARRENDATÁRIO</option>
    </select>
  );

  const { renderCampoPersonalizado } = useFormEmpCustomFields({
    formData,
    isReadOnly,
    handleCustomChange,
    relatedOptions,
    onUploadError: () => showError("Não foi possível enviar a imagem."),
  });

  const dynamicFields = useMemo(() => [
    { id: "tipo_pessoa", name: "tipo_pessoa", label: "Tipo de Pessoa", type: "select", required: true, compact: true, errorKey: "tipo_pessoa", render: renderTipoPessoaSelect },
    { id: "tipo_vinculo", name: "tipo_vinculo", label: "Proprietário/Arrendatário", type: "select", compact: true, render: renderTipoVinculoSelect },
    { id: "codempresa", name: "codempresa", label: "Cód. Empresa", type: "text", compact: true, readOnly: true, render: () => <Input value={formData.codempresa || ""} readOnly className={inputClass} placeholder="AUTO" /> },
    { id: "razao_social", name: "razao_social", label: "Nome/Razão Social Emp.", type: "text", required: true, errorKey: "razao_social", wide: true, uppercase: true, placeholder: "NOME/RAZÃO SOCIAL" },
    { id: "status", name: "status", label: "Ativa", type: "switch", compact: true, render: () => <ToggleSwitch checked={formData.status !== "Inativa"} onChange={(checked) => handleChange("status", checked ? "Ativa" : "Inativa")} disabled={isReadOnly} className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" /> },
    { id: "nome_fantasia", name: "nome_fantasia", label: "Nome fantasia", type: "text", wide: true, uppercase: true, placeholder: "NOME FANTASIA" },
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
    ...camposPersonalizadosForm.map((campo) => ({
      id: `custom:${campo.field_name}`,
      name: campo.field_name,
      label: campo.label,
      type: campo.tipo,
      origem: "customizado",
      dataField: `campos_personalizados.${campo.field_name}`,
      getValue: (values) => values.campos_personalizados?.[campo.field_name] ?? "",
      optionsMode: ["select", "option_list"].includes(campo.tipo) && !(campo.options_source_entity || campo.relation_entity) ? "manual" : "",
      required: campo.obrigatorio,
      errorKey: `campos_personalizados.${campo.field_name}`,
      wide: ["textarea", "option_list"].includes(campo.tipo),
      medium: ["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo),
      compact: (["number", "date", "time", "calculado"].includes(campo.tipo) && !campo.usar_mascara) || ["imagem", "image", "file"].includes(campo.tipo),
      totalizable: ["number", "calculado"].includes(campo.tipo) && !campo.usar_mascara,
      options: ["select", "option_list"].includes(campo.tipo)
        ? campoEngine.getOptionsCampo(campo, relatedOptions).map((option) => ({
            id: String(option.value || option.label || ""),
            nome: String(option.label || option.value || "").toUpperCase(),
          }))
        : [],
      displayField: "nome",
      searchFields: ["nome"],
      render: () => renderCampoPersonalizado(campo),
    }))
  ], [formData, isReadOnly, opcoesEstado, uploadingLogo, camposPersonalizadosForm, relatedOptions]);

  const basePanels = useMemo(
    () => EMP_FORM_BASE_PANELS.map((panel) => ({ ...panel })),
    []
  );

  const defaultLayout = useMemo(
    () => ({
      principal: [...EMP_FORM_DEFAULT_LAYOUT.principal],
      geral: [...EMP_FORM_DEFAULT_LAYOUT.geral],
      endereco: [...EMP_FORM_DEFAULT_LAYOUT.endereco],
      observacoes: [...EMP_FORM_DEFAULT_LAYOUT.observacoes],
    }),
    []
  );

  const defaultConfigFull = useMemo(() => buildEmpFormDefaultConfig(), []);

  const nativeLayoutFieldIds = useMemo(
    () => new Set(Object.values(defaultLayout).flat().filter(Boolean)),
    [defaultLayout]
  );

  const knownLayoutFieldIds = useMemo(() => {
    const ids = new Set(nativeLayoutFieldIds);
    dynamicFields.forEach((field) => ids.add(field.id));
    return ids;
  }, [dynamicFields, nativeLayoutFieldIds]);

  const activeLayoutConfig = useMemo(() => {
    const source =
      ensureLayoutFields(formLayoutConfig, defaultConfigFull, {
        knownFieldIds: knownLayoutFieldIds,
      }) || defaultConfigFull;
    return normalizeLayoutConfig(source, {
      basePanels,
      defaultLayout,
      camposPersonalizadosCount: 0,
      mergeNewCustomFields: false,
    });
  }, [formLayoutConfig, basePanels, defaultLayout, defaultConfigFull, knownLayoutFieldIds]);

  const formPanels = useMemo(
    () =>
      activeLayoutConfig.panels.filter(
        (panel) => panel.id !== "principal" && !panel.hidden
      ),
    [activeLayoutConfig.panels]
  );

  const tabs = useMemo(
    () =>
      activeLayoutConfig.panels.filter((panel) => {
        if (panel.id === "principal") return false;
        if (panel.hidden) return false;
        if (panel.id === "campos_personalizados" && camposPersonalizadosForm.length === 0) return false;
        const panelFields = activeLayoutConfig.layout?.[panel.id] || [];
        const fallbackFields = defaultLayout?.[panel.id] || [];
        return panelFields.length > 0 || fallbackFields.length > 0;
      }),
    [activeLayoutConfig.panels, activeLayoutConfig.layout, camposPersonalizadosForm.length, defaultLayout]
  );
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

  const requiredCounterTone =
    requiredFieldStats.total > 0 && requiredFieldStats.filled >= requiredFieldStats.total
      ? "complete"
      : "incomplete";

  const applyLayoutConfig = (source, { updateActiveTab = true } = {}) => {
    const ensured =
      ensureLayoutFields(source, defaultConfigFull, { knownFieldIds: knownLayoutFieldIds }) ||
      defaultConfigFull;
    const normalized = normalizeLayoutConfig(ensured, {
      basePanels,
      defaultLayout,
      camposPersonalizadosCount: 0,
      mergeNewCustomFields: false,
    });
    const { aggregationKey } = getLayoutStorageKeys(user?.id);
    setFormLayoutConfig(normalized);
    writeStoredLayoutConfig(normalized);
    localStorage.setItem(aggregationKey, JSON.stringify(normalized.aggregationConfig || {}));
    window.dispatchEvent(new Event("emp-layout-updated"));
    empFormLayoutStore.persistActiveConfig(normalized);
    if (user?.id) scheduleEmpresasFormLayoutSync(user.id);
    if (updateActiveTab) {
      const visiblePanels = normalized.panels.filter((panel) => !panel.hidden && panel.id !== "principal");
      if (!visiblePanels.some((panel) => panel.id === activeTab)) {
        setActiveTab(visiblePanels[0]?.id || "geral");
      }
    }
    return normalized;
  };

  const tabIdsKey = useMemo(() => tabs.map((panel) => panel.id).join("|"), [tabs]);

  useEffect(() => {
    if (!formLayoutConfig || layoutConfigOpen) return;
    const activeTabValid =
      tabs.some((panel) => panel.id === activeTab) ||
      formPanels.some((panel) => panel.id === activeTab);
    if (!activeTabValid) {
      const nextTab = tabs[0]?.id || formPanels[0]?.id || "geral";
      if (nextTab !== activeTab) setActiveTab(nextTab);
    }
  }, [formLayoutConfig, tabIdsKey, formPanels, activeTab, layoutConfigOpen]);

  useEffect(() => {
    if (!user?.id || !formLayoutConfig || layoutConfigOpen || layoutPersistedRef.current) return;

    const repaired =
      ensureLayoutFields(formLayoutConfig, defaultConfigFull, {
        knownFieldIds: knownLayoutFieldIds,
      }) || defaultConfigFull;
    const storedKnownCount = countKnownLayoutFields(formLayoutConfig?.layout, knownLayoutFieldIds);
    const repairedKnownCount = countKnownLayoutFields(repaired?.layout, knownLayoutFieldIds);
    const hasHiddenSystemPanels = (formLayoutConfig?.panels || []).some(
      (panel) =>
        ["geral", "endereco", "observacoes", "principal"].includes(panel.id) &&
        panel.hidden &&
        (formLayoutConfig?.layout?.[panel.id] || []).length > 0
    );
    const layoutDiffers =
      JSON.stringify(pickLayoutConfig(repaired)) !== JSON.stringify(pickLayoutConfig(formLayoutConfig));

    if (
      storedKnownCount === 0 ||
      repairedKnownCount > storedKnownCount ||
      hasHiddenSystemPanels ||
      layoutDiffers
    ) {
      layoutPersistedRef.current = true;
      applyLayoutConfig(repaired, { updateActiveTab: true });
    }
  }, [user?.id, formLayoutConfig, layoutConfigOpen, defaultConfigFull, knownLayoutFieldIds]);

  const handleDynamicFieldChange = (fieldName, value) => {
    const field = dynamicFields.find((item) => item.name === fieldName);
    if (field?.origem === "customizado") {
      handleCustomChange(fieldName, value);
      return;
    }
    handleChange(fieldName, value);
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
    clearRequiredFieldErrors();
    if (Object.keys(nextErrors).length === 0) return true;
    reportRequiredFieldErrors(nextErrors);
    return false;
  };

  const handleSubmit = (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isReadOnly) return;
    if (!validateForm()) return;
    const calculated = campoEngine.aplicarCamposCalculados ? campoEngine.aplicarCamposCalculados(formData, camposPersonalizadosForm) : formData;
    const { _isDuplicate, ...clean } = { ...formData, campos_personalizados: calculated.campos_personalizados || {} };
    if (isEditing && !isDuplicating) setEditMode(false);
    onSubmit(clean);
  };

  const operationLabel = isDuplicating ? "NOVO REGISTRO DUPLICADO" : isEditing ? editMode ? "EDIÇÃO DE REGISTRO" : "VISUALIZAÇÃO DE REGISTRO" : "NOVO REGISTRO";
  const { setPageHeader, clearPageHeader } = useErpPageHeader();

  const recordHeaderTitle = useMemo(() => {
    const code = String(formData.codempresa || "").trim();
    const name = String(formData.razao_social || "").trim();
    if (code && name) return `${code} - ${name}`;
    if (code) return code;
    if (name) return name;
    if (isDuplicating) return "Duplicar empresa";
    if (!isEditing) return "Nova empresa";
    return null;
  }, [formData.codempresa, formData.razao_social, isDuplicating, isEditing]);

  useEffect(() => {
    if (layoutConfigOpen || fieldLayoutConfigOpen) {
      setPageHeader({
        recordTitle: null,
        operationLabel: "Configuração",
        contextSuffix: "Configuração de layout",
      });
      return;
    }

    setPageHeader({
      recordTitle: recordHeaderTitle,
      operationLabel,
      contextSuffix: null,
    });
  }, [
    recordHeaderTitle,
    operationLabel,
    layoutConfigOpen,
    fieldLayoutConfigOpen,
    setPageHeader,
  ]);

  useEffect(() => () => clearPageHeader(), [clearPageHeader]);

  if (layoutConfigOpen) {
    return (
      <section className="cadastro-emp-scope w-full h-full max-w-full overflow-hidden">
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
    <div className="cadastro-emp-scope erp-ui flex h-full min-h-0 flex-col overflow-hidden">
      <EmpFieldLayoutConfigDialog
        open={fieldLayoutConfigOpen}
        onOpenChange={setFieldLayoutConfigOpen}
        fieldLayoutConfig={fieldLayoutConfig}
        onSave={saveFieldLayoutConfig}
      />
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
        <EmpSplitToolbarLayout
          className="h-full min-h-0 flex-1"
          toolbar={
            <LegacyRecordToolbar
              showSaveActions={editMode}
              showEditAction={isReadOnly}
              showDeleteDuplicateActions={isEditing && !editMode && !isDuplicating}
              showRecordNavigation={isEditing && !editMode && !isDuplicating}
              onSave={handleSubmit}
              onCancel={onCancel}
              onEditRecord={() => setEditMode(true)}
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
          }
        >
        <div className="form-scroll-container min-h-0 flex-1 overflow-auto pb-6 pr-2">
          <div className={`emp-form-body flex flex-col ${standalonePrincipalInUse ? "" : "emp-form-body-no-principal"}`}>
            {standalonePrincipalInUse && (
              <div className="emp-form-section emp-form-section-principal w-full min-w-[920px] max-w-none pl-2 pr-4">
                <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}>
                  <EmpDynamicFormRenderer
                    panels={activeLayoutConfig.panels}
                    fields={dynamicFields}
                    layout={activeLayoutConfig.layout}
                    defaultLayout={defaultLayout}
                    hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                    lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                    requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                    visibilityRules={activeLayoutConfig.visibilityRules || {}}
                    fieldLayoutConfig={fieldLayoutConfig}
                    activePanelId="principal"
                    values={formData}
                    errors={errors}
                    onChange={handleDynamicFieldChange}
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
                        tone={requiredCounterTone}
                        className="emp-toolbar-bubble-counter"
                      />
                    }
                  />

                  <div className="emp-form-section emp-form-section-panel min-h-[380px] w-full min-w-[920px] max-w-none pl-2 pr-4">
                    <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}>
                      <EmpDynamicFormRenderer
                        panels={formPanels}
                        fields={dynamicFields}
                        layout={activeLayoutConfig.layout}
                        defaultLayout={defaultLayout}
                        hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                        lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                        requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                        visibilityRules={activeLayoutConfig.visibilityRules || {}}
                        fieldLayoutConfig={fieldLayoutConfig}
                        activePanelId={activeTab}
                        values={formData}
                        errors={errors}
                        onChange={handleDynamicFieldChange}
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
                      tone={requiredCounterTone}
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
                            defaultLayout={defaultLayout}
                            hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                            lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                            requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                            visibilityRules={activeLayoutConfig.visibilityRules || {}}
                            fieldLayoutConfig={fieldLayoutConfig}
                            activePanelId={panel.id}
                            values={formData}
                            errors={errors}
                            onChange={handleDynamicFieldChange}
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
        </EmpSplitToolbarLayout>
      </form>
    </div>
  );
}