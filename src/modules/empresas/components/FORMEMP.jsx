import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/shared/ui/input";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/modules/empresas/repositories/empRepository";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import { useCadastroForm } from "@/framework/cadastro-engine/hooks/useCadastroForm.js";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";
import { getLayoutStorageKeysForModule } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
import { RenderEngine } from "@/framework/cadastro-engine/render/RenderEngine.jsx";
import CadLayoutConfigurator from "@/framework/cadastro-engine/design-system/CadLayoutConfigurator.jsx";
import CadSplitLayout from "@/framework/cadastro-engine/design-system/CadSplitLayout.jsx";
import { CadRecordToolbar } from "@/framework/cadastro-engine/design-system/CadToolbar.jsx";
import MgMotionPanel from "@/modules/empresas/layout/MgMotionPanel";
import CadTabs from "@/framework/cadastro-engine/design-system/CadTabs.jsx";

import { reportRequiredFieldErrors, clearRequiredFieldErrors, showError } from "@/shared/feedback";
import { resolveRecordOperationLabel } from "@/shared/layouts/recordOperationLabel";
import { useCadastroPageHeader } from "@/framework/cadastro-engine/hooks/useCadastroPageHeader.js";
import { useCadastroEnterNavigation } from "@/framework/cadastro-engine/keyboard/useCadastroEnterNavigation.js";
import {
  countKnownLayoutFields,
  ensureLayoutFields,
  getPanelFieldIdsFromLayout,
  pickLayoutConfig,
} from "@/framework/cadastro/layouts/empFormLayoutStore";
import { LAYOUT_MAIN_TAB_ID } from "@/framework/cadastro-engine/preferences/layoutMigration.js";
import {
  buildRequiredFormFieldErrors,
  countRequiredFormFields,
} from "@/framework/cadastro/layouts/empFormLayoutMetrics";
import FormValidationStatus from "@/framework/cadastro/formularios/FormValidationStatus";
import EmpFormImageField from "@/framework/cadastro/formularios/EmpFormImageField";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import MgCmdSelect from "@/modules/empresas/layout/MgCmdSelect";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { useAuth } from "@/shared/contexts/AuthContext";
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
  resetSeed = 0,
  actionsLocked = false,
  hideToolbar = false,
  onToolbarBridge,
}) {
  const { user } = useAuth();
  const isDuplicating = !!initialData?._isDuplicate;
  const [errors, setErrors] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [layoutToolbarBridge, setLayoutToolbarBridge] = useState(null);
  const [editMode, setEditMode] = useState(!isEditing || isDuplicating);
  const nativeLayoutFieldIdsSet = useMemo(
    () => new Set(Object.values(EMP_FORM_DEFAULT_LAYOUT).flat().filter(Boolean)),
    []
  );

  const {
    formLayoutConfig,
    activeLayoutConfig,
    layoutConfigOpen,
    setLayoutConfigOpen,
    activeTab,
    setActiveTab,
    tabs,
    defaultConfigFull,
    defaultLayout,
    applyLayoutConfig: applyLayoutConfigFromEngine,
    layoutPersistedRef,
    knownLayoutFieldIds,
  } = useCadastroForm(empresasCadastroConfig, {
    userId: user?.id,
    nativeFieldIds: nativeLayoutFieldIdsSet,
  });

  const fieldLayoutConfig = activeLayoutConfig?.fieldLayoutConfig;

  const buildFormData = (data) =>
    data
      ? { ...buildEmptyEmpresaForm(), ...data, campos_personalizados: data.campos_personalizados || {} }
      : buildEmptyEmpresaForm();
  const [formData, setFormData] = useState(() => buildFormData(initialData));
  const previousRecordKeyRef = useRef(recordKey);

  useEffect(() => {
    let next = buildFormData(initialData);
    if (initialData?._isDuplicate) {
      const layoutKey = user?.id
        ? getLayoutStorageKeysForModule(empresasCadastroConfig, user.id).layoutKey
        : null;
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
      setActiveTab(LAYOUT_MAIN_TAB_ID);
    }
  }, [
    recordKey,
    resetSeed,
    initialData?.id,
    initialData?.codempresa,
    initialData?.id_global,
    initialData?._isPersisting,
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
    clearRequiredFieldErrors();
    setFormData((prev) => ({ ...prev, [field]: normalized }));
  };

  const handleCustomChange = (fieldName, value) => {
    if (isReadOnly) return;
    setErrors((prev) => ({ ...prev, [`campos_personalizados.${fieldName}`]: false }));
    clearRequiredFieldErrors();
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

  const opcoesTipoPessoa = useMemo(
    () => [
      { id: "PJ", nome: "PESSOA JURÍDICA (PJ)" },
      { id: "PF", nome: "PESSOA FÍSICA (PF)" },
    ],
    []
  );

  const opcoesTipoVinculo = useMemo(
    () => [
      { id: "proprietario", nome: "PROPRIETÁRIO" },
      { id: "arrendatario", nome: "ARRENDATÁRIO" },
    ],
    []
  );

  const renderTipoPessoaSelect = () => {
    if (hideToolbar) {
      return (
        <MgCmdSelect
          label="Tipo de Pessoa"
          required
          value={formData.tipo_pessoa || "PJ"}
          options={opcoesTipoPessoa.map((item) => ({
            value: item.id,
            label: item.id === "PJ" ? "Pessoa Jurídica" : item.id === "PF" ? "Pessoa Física" : item.nome,
          }))}
          onChange={(next) => handleChange("tipo_pessoa", next || "PJ")}
          disabled={isReadOnly}
        />
      );
    }
    return (
      <EmpAutocomplete
        variant="select"
        items={opcoesTipoPessoa}
        value={formData.tipo_pessoa || "PJ"}
        onChange={(next) => handleChange("tipo_pessoa", next || "PJ")}
        placeholder="SELECIONE"
        displayField="nome"
        searchFields={["nome"]}
        disabled={isReadOnly}
        readOnly={isReadOnly}
        className="w-full min-w-0"
        inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
      />
    );
  };

  const renderTipoVinculoSelect = () => {
    if (hideToolbar) {
      return (
        <MgCmdSelect
          label="Proprietário/Arrendatário"
          value={formData.tipo_vinculo || ""}
          options={opcoesTipoVinculo.map((item) => ({
            value: item.id,
            label: item.id === "proprietario" ? "Proprietário" : item.id === "arrendatario" ? "Arrendatário" : item.nome,
          }))}
          onChange={(next) => handleChange("tipo_vinculo", next || "")}
          disabled={isReadOnly}
        />
      );
    }
    return (
      <EmpAutocomplete
        variant="select"
        items={opcoesTipoVinculo}
        value={formData.tipo_vinculo || ""}
        onChange={(next) => handleChange("tipo_vinculo", next || "")}
        placeholder="SELECIONE"
        displayField="nome"
        searchFields={["nome"]}
        disabled={isReadOnly}
        readOnly={isReadOnly}
        className="w-full min-w-0"
        inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
      />
    );
  };

  const renderStatusSelect = () => {
    if (hideToolbar) {
      return (
        <MgCmdSelect
          label="Ativa"
          value={formData.status || "Ativa"}
          options={[
            { value: "Ativa", label: "Ativa" },
            { value: "Inativa", label: "Inativa" },
          ]}
          onChange={(next) => handleChange("status", next || "Ativa")}
          disabled={isReadOnly}
        />
      );
    }
    return (
      <EmpAutocomplete
        variant="select"
        items={[
          { id: "Ativa", nome: "ATIVA" },
          { id: "Inativa", nome: "INATIVA" },
        ]}
        value={formData.status || "Ativa"}
        onChange={(next) => handleChange("status", next || "Ativa")}
        placeholder="SELECIONE"
        displayField="nome"
        searchFields={["nome"]}
        disabled={isReadOnly}
        readOnly={isReadOnly}
        className="w-full min-w-0"
        inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
      />
    );
  };

  const { renderCampoPersonalizado } = useFormEmpCustomFields({
    formData,
    isReadOnly,
    handleCustomChange,
    relatedOptions,
    onUploadError: () => showError("Não foi possível enviar a imagem."),
    mgPrototype: hideToolbar,
  });

  const dynamicFields = useMemo(() => [
    { id: "tipo_pessoa", name: "tipo_pessoa", label: "Tipo de Pessoa", type: "select", required: true, compact: true, errorKey: "tipo_pessoa", render: renderTipoPessoaSelect },
    { id: "tipo_vinculo", name: "tipo_vinculo", label: "Proprietário/Arrendatário", type: "select", compact: true, render: renderTipoVinculoSelect },
    {
      id: "codempresa",
      name: "codempresa",
      label: "Cód. Empresa",
      type: "text",
      widthType: "CODIGO",
      compact: true,
      readOnly: true,
      render: () =>
        hideToolbar ? (
          <input
            type="text"
            value={formData._isPersisting ? "Gerando..." : formData.codempresa || ""}
            readOnly
            placeholder={formData._isPersisting ? "Gerando..." : "AUTO"}
          />
        ) : (
          <Input
            value={formData._isPersisting ? "Gerando..." : formData.codempresa || ""}
            readOnly
            className={inputClass}
            placeholder={formData._isPersisting ? "Gerando..." : "AUTO"}
          />
        ),
    },
    { id: "razao_social", name: "razao_social", label: "Nome/Razão Social Emp.", type: "text", required: true, errorKey: "razao_social", wide: true, uppercase: true, placeholder: "NOME/RAZÃO SOCIAL" },
    { id: "status", name: "status", label: "Ativa", type: "select", widthType: "SIM_NAO", compact: true, render: renderStatusSelect },
    { id: "nome_fantasia", name: "nome_fantasia", label: "Nome fantasia", type: "text", medium: true, uppercase: true, placeholder: "NOME FANTASIA" },
    { id: "cpf_cnpj", name: "cpf_cnpj", label: formData.tipo_pessoa === "PF" ? "CPF" : "CNPJ", type: "cpf_cnpj", compact: true, placeholder: formData.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00" },
    { id: "inscricao_estadual", name: "inscricao_estadual", label: "Inscrição Estadual", type: "text", placeholder: "INSCRIÇÃO ESTADUAL" },
    { id: "telefone", name: "telefone", label: "Telefone", type: "tel", compact: true, placeholder: "(00) 0000-0000" },
    { id: "whatsapp", name: "whatsapp", label: "WhatsApp", type: "tel", compact: true, placeholder: "(00) 00000-0000" },
    { id: "email", name: "email", label: "E-mail", type: "email", placeholder: "EMAIL@EMPRESA.COM.BR" },
    { id: "logo_url", name: "logo_url", label: "Logo da Empresa", type: "image", compact: true, render: () => <EmpFormImageField value={formData.logo_url} readOnly={isReadOnly} uploading={uploadingLogo} onUpload={handleLogoUpload} onClear={() => handleChange("logo_url", "")} alt="Logo da empresa" /> },
    { id: "cep", name: "cep", label: "CEP", type: "cep", compact: true, placeholder: "00000-000" },
    { id: "endereco", name: "endereco", label: "Endereço", type: "text", medium: true, uppercase: true, placeholder: "RUA, AVENIDA..." },
    { id: "numero", name: "numero", label: "Número", type: "text", widthType: "NUMERO", compact: true, placeholder: "Nº" },
    { id: "bairro", name: "bairro", label: "Bairro", type: "text", uppercase: true, placeholder: "BAIRRO" },
    { id: "cidade", name: "cidade", label: "Cidade", type: "text", uppercase: true, placeholder: "CIDADE" },
    { id: "estado", name: "estado", label: "Estado (UF)", type: "autocomplete", widthType: "UF", compact: true, options: opcoesEstado, placeholder: "UF", displayField: "nome", searchFields: ["nome"] },
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
      wide: campo.tipo === "textarea",
      medium: ["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo),
      compact: (["number", "date", "data", "time", "calculado"].includes(campo.tipo) && !campo.usar_mascara) || ["imagem", "image", "file"].includes(campo.tipo),
      totalizable: ["number", "calculado"].includes(campo.tipo) && !campo.usar_mascara,
      options: ["select", "option_list"].includes(campo.tipo)
        ? campoEngine.getOptionsCampo(campo, relatedOptions).map((option) => ({
            id: String(option.value || option.label || ""),
            nome: String(option.label || option.value || "").toUpperCase(),
          }))
        : [],
      displayField: "nome",
      searchFields: ["nome"],
      render: (ctx) => renderCampoPersonalizado(campo, ctx),
    }))
  ], [formData, isReadOnly, opcoesEstado, uploadingLogo, camposPersonalizadosForm, relatedOptions, renderCampoPersonalizado]);

  const basePanels = useMemo(
    () => EMP_FORM_BASE_PANELS.map((panel) => ({ ...panel })),
    []
  );






  const requiredFieldStats = useMemo(() => {
    if (!activeLayoutConfig?.layout) return { total: 0, filled: 0, pending: 0, pendingFields: [] };
    const panelIds = tabs.map((panel) => panel.id);
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

  const applyLayoutConfig = (source, options) => applyLayoutConfigFromEngine(source, options);

  const tabIdsKey = useMemo(() => tabs.map((panel) => panel.id).join("|"), [tabs]);

  useEffect(() => {
    if (!formLayoutConfig || layoutConfigOpen) return;
    const activeTabValid = tabs.some((panel) => panel.id === activeTab);
    if (!activeTabValid) {
      const nextTab = tabs[0]?.id || LAYOUT_MAIN_TAB_ID;
      if (nextTab !== activeTab) setActiveTab(nextTab);
    }
  }, [formLayoutConfig, tabIdsKey, tabs, activeTab, layoutConfigOpen]);

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
        [LAYOUT_MAIN_TAB_ID, "endereco", "observacoes", "geral", "principal"].includes(panel.id) &&
        panel.hidden &&
        getPanelFieldIdsFromLayout(formLayoutConfig?.layout, panel.id).length > 0
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

  const validateForm = () => {
    const panelIds = tabs.map((panel) => panel.id);
    const nextErrors = buildRequiredFormFieldErrors({
      panelIds,
      layout: activeLayoutConfig?.layout,
      fields: dynamicFields,
      hiddenFieldIds: activeLayoutConfig?.hiddenFieldIds || [],
      requiredFieldIds: activeLayoutConfig?.requiredFieldIds || [],
      visibilityRules: activeLayoutConfig?.visibilityRules || {},
      values: formData,
      nativeRequiredFieldNames: REQUIRED_FIELDS,
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
    const isMobileViewport =
      typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
    reportRequiredFieldErrors(nextErrors, { focus: !isMobileViewport });
    return false;
  };

  const handleSubmit = (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isReadOnly || actionsLocked) return;
    if (!validateForm()) return;
    const calculated = campoEngine.aplicarCamposCalculados ? campoEngine.aplicarCamposCalculados(formData, camposPersonalizadosForm) : formData;
    const { _isDuplicate, ...clean } = { ...formData, campos_personalizados: calculated.campos_personalizados || {} };
    if (isEditing && !isDuplicating) setEditMode(false);
    onSubmit(clean);
  };

  const formRef = useCadastroEnterNavigation(!isReadOnly && editMode);

  const recordMeta = useMemo(() => {
    if (layoutConfigOpen) return null;

    const codigo =
      formData.codempresa != null && String(formData.codempresa).trim() !== ""
        ? formData.codempresa
        : null;
    const nome = String(formData.razao_social || formData.nome_empresa || "").trim() || null;

    if (!isEditing) return { codigo: null, nome: "Nova Empresa" };
    if (isDuplicating && nome) return { codigo: null, nome };
    if (isDuplicating) return { codigo: null, nome: "Duplicar empresa" };
    if (codigo && nome) return { codigo, nome };
    if (nome) return { codigo, nome };
    return null;
  }, [
    formData.codempresa,
    formData.nome_empresa,
    formData.razao_social,
    isDuplicating,
    isEditing,
    layoutConfigOpen,
  ]);

  const operationLabel = useMemo(
    () =>
      layoutConfigOpen
        ? "CONFIGURAÇÃO"
        : resolveRecordOperationLabel({
            isEditing,
            editMode,
            isDuplicating,
            isSaving: actionsLocked,
          }),
    [isEditing, editMode, isDuplicating, actionsLocked, layoutConfigOpen]
  );

  const showRequiredCounter = !isReadOnly && !layoutConfigOpen;

  useCadastroPageHeader({
    enabled: !hideToolbar,
    recordMeta,
    operationLabel,
    requiredStatus: showRequiredCounter
      ? {
          visible: true,
          filled: requiredFieldStats.filled,
          total: requiredFieldStats.total,
          pendingFields: requiredFieldStats.pendingFields,
        }
      : null,
  });

  useEffect(() => {
    if (!onToolbarBridge) return;
    onToolbarBridge({
      editMode,
      isReadOnly,
      isEditing,
      isDuplicating,
      layoutConfigOpen,
      layoutToolbar: layoutConfigOpen ? layoutToolbarBridge : null,
      recordMeta,
      onSave: () => handleSubmit(),
      onCancel,
      onEdit: () => setEditMode(true),
      onLayoutConfig: () => {
        if (filterOpen) onToggleFilter?.();
        setLayoutConfigOpen(true);
      },
    });
  }, [
    onToolbarBridge,
    editMode,
    isReadOnly,
    isEditing,
    isDuplicating,
    layoutConfigOpen,
    layoutToolbarBridge,
    recordMeta,
    onCancel,
    filterOpen,
    onToggleFilter,
  ]);

  const renderFormBody = (mgVariant = false) => (
    <div className="emp-form-body flex min-h-0 flex-1 flex-col">
      <div className="emp-form-panels-zone flex min-h-0 flex-1 flex-col">
        {!mgVariant ? (
          <CadTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            systemPanelIds={empresasCadastroConfig.systemPanelIds}
            trailing={
              <FormValidationStatus
                visible={showRequiredCounter}
                filled={requiredFieldStats.filled}
                total={requiredFieldStats.total}
                pendingFields={requiredFieldStats.pendingFields}
                className="emp-form-tabs-required-desktop"
              />
            }
          />
        ) : null}

        <MgMotionPanel
          panelKey={`${activeTab}-${resetSeed}`}
          instant={!isEditing || isDuplicating}
          className="emp-form-section emp-form-section-panel emp-form-section-panel--corp flex min-h-0 flex-1 w-full min-w-0 max-w-none"
        >
          {() => (
            <fieldset
              className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none [&_input]:cursor-default [&_textarea]:cursor-default [&_button]:cursor-default" : ""}`}
            >
              <RenderEngine
                recordKey={recordKey}
                panels={tabs}
                fields={dynamicFields}
                layout={activeLayoutConfig.layout}
                defaultLayout={defaultLayout}
                hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
                lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
                requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
                visibilityRules={activeLayoutConfig.visibilityRules || {}}
                fieldSizes={activeLayoutConfig.fieldSizes || {}}
                fieldLayoutConfig={fieldLayoutConfig}
                activePanelId={activeTab}
                values={formData}
                errors={errors}
                onChange={handleDynamicFieldChange}
                readOnly={isReadOnly}
                fieldClassName={mgVariant ? "mg-prototype-field" : ""}
              />
            </fieldset>
          )}
        </MgMotionPanel>
      </div>
    </div>
  );

  if (layoutConfigOpen) {
    return (
      <section className="cadastro-scope cadastro-emp-scope mg-empresas-scope flex h-full w-full max-w-full overflow-hidden">
        <CadLayoutConfigurator
          open={layoutConfigOpen}
          onOpenChange={setLayoutConfigOpen}
          onLayoutToolbarBridge={setLayoutToolbarBridge}
          inline
          panels={activeLayoutConfig.panels}
          fields={dynamicFields}
          layout={activeLayoutConfig.layout}
          fieldSizes={activeLayoutConfig.fieldSizes || {}}
          fieldLayoutConfig={fieldLayoutConfig}
          hiddenFieldIds={activeLayoutConfig.hiddenFieldIds || []}
          lockedFieldIds={activeLayoutConfig.lockedFieldIds || []}
          requiredFieldIds={activeLayoutConfig.requiredFieldIds || []}
          clearOnDuplicateFieldIds={activeLayoutConfig.clearOnDuplicateFieldIds || []}
          fieldDefaultValues={activeLayoutConfig.fieldDefaultValues || {}}
          aggregationConfig={activeLayoutConfig.aggregationConfig || {}}
          visibilityRules={activeLayoutConfig.visibilityRules || {}}
          defaultConfig={defaultConfigFull}
          systemPanelIds={["principais", "endereco", "observacoes", "campos_personalizados"]}
          fixedPanelIds={[]}
          fixedVisibleFieldIds={[]}
          onSave={saveLayoutConfig}
          brandTheme
        />
      </section>
    );
  }

  return (
    <div className="cadastro-scope cadastro-emp-scope erp-ui flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <style>{`
          .form-scroll-container {
            scrollbar-width: thin;
            scrollbar-color: #94a3b8 transparent;
            overflow: auto;
            scrollbar-gutter: auto;
            background: transparent;
            border: none;
            box-shadow: none;
          }
          .form-scroll-container::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          .form-scroll-container::-webkit-scrollbar-track {
            background: transparent;
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
        {hideToolbar ? null : (
          <CadSplitLayout
            className="h-full min-h-0 flex-1"
            toolbar={
              <CadRecordToolbar
                showSaveActions={editMode}
                showEditAction={isReadOnly}
                showDeleteDuplicateActions={isEditing && !editMode && !isDuplicating}
                showRecordNavigation={isEditing && !editMode && !isDuplicating}
                onSave={handleSubmit}
                onCancel={onCancel}
                onEditRecord={() => setEditMode(true)}
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
                actionsLocked={actionsLocked}
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
            <div className="form-scroll-container min-h-0 flex-1 overflow-auto">
              {renderFormBody(false)}
            </div>
          </CadSplitLayout>
        )}
        {hideToolbar ? (
          <div id="mode-registro" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className="mg-panel-tabs-strip shrink-0 px-3 md:px-5"
              style={{ background: "var(--bg-card)" }}
            >
              <CadTabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                systemPanelIds={empresasCadastroConfig.systemPanelIds}
                variant="mg"
              />
            </div>
            <div
              className={`mg-form-scroll mg-prototype-form${
                isReadOnly ? " mg-prototype-form--readonly" : ""
              }${editMode && !isReadOnly ? " mg-prototype-form--edit" : ""}`}
            >
              {renderFormBody(true)}
            </div>
          </div>
        ) : null}
        {editMode ? (
          <div className="emp-form-mobile-footer" role="toolbar" aria-label="Ações do formulário">
            <button
              type="button"
              className="emp-form-mobile-footer__btn emp-toolbar-btn emp-toolbar-btn-labeled"
              onClick={onCancel}
              disabled={actionsLocked}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="emp-form-mobile-footer__btn emp-form-mobile-footer__btn--primary emp-toolbar-btn emp-toolbar-btn-labeled emp-toolbar-btn-save"
              disabled={actionsLocked}
            >
              Salvar
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
