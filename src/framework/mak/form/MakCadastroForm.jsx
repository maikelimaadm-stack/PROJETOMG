import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/shared/ui/input";
import { useMakFormModuleConfig } from "@/framework/mak/form/useMakFormModuleConfig";
import { useMakModuleRequired } from "@/framework/mak/runtime/MakModuleContext.jsx";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import { useCadastroForm } from "@/framework/cadastro-engine/hooks/useCadastroForm.js";
import { getLayoutStorageKeysForModule } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
import { RenderEngine } from "@/framework/cadastro-engine/render/RenderEngine.jsx";
import CadLayoutConfigurator from "@/framework/cadastro-engine/design-system/CadLayoutConfigurator.jsx";
import CadSplitLayout from "@/framework/cadastro-engine/design-system/CadSplitLayout.jsx";
import { CadRecordToolbar } from "@/framework/cadastro-engine/design-system/CadToolbar.jsx";
import { MakMotionPanel, MakCmdSelect } from "@/framework/mak/layout";
import CadTabs from "@/framework/cadastro-engine/design-system/CadTabs.jsx";

import ErpScrollNav from "@/shared/components/ErpScrollNav";
import { ChevronLeft, ChevronRight, LayoutGrid, PanelLeft } from "lucide-react";
import { formatCadastroRecordPosition } from "@/framework/cadastro/toolbars/formatCadastroRecordCount";
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
import { stableStringify } from "@/shared/utils/stableStringify";
import { LAYOUT_MAIN_TAB_ID } from "@/framework/cadastro-engine/preferences/layoutMigration.js";
import {
  countRequiredFormFields,
} from "@/framework/cadastro/layouts/empFormLayoutMetrics";
import { runMakFormValidation } from "@/framework/mak/validation/runMakFormValidation.js";
import { useMakFormFormulaEvaluation } from "@/framework/mak/formula/useMakFormFormulaEvaluation.js";
import { runMakFormulaEvaluation } from "@/framework/mak/formula/runMakFormulaEvaluation.js";
import { useMakFormEventHandlers } from "@/framework/mak/events/useMakFormEventHandlers.js";
import { useMakFormActionHandlers } from "@/framework/mak/actions/useMakFormActionHandlers.js";
import FormValidationStatus from "@/framework/cadastro/formularios/FormValidationStatus";
import EmpFormImageField from "@/framework/cadastro/formularios/EmpFormImageField";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { useAuth } from "@/shared/contexts/AuthContext";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";

export default function MakCadastroForm({
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
  browseMode = false,
}) {
  const {
    repository: empRepository,
    cadastroConfig,
    moduleId,
    readJson: readEmpPreferencesJson,
    readStoredLaunchPanelStyle,
    writeStoredLaunchPanelStyle,
    estados: ESTADOS_BR,
    upperFields: UPPER_FIELDS,
    requiredFields: REQUIRED_FIELDS,
    inputClass,
    applyDuplicateFieldClears,
    buildEmptyRecord: buildEmptyEmpresaForm,
    basePanels: EMP_FORM_BASE_PANELS,
    defaultLayout: EMP_FORM_DEFAULT_LAYOUT,
    nativeFields: NATIVE_FIELDS,
    useRecordFieldsHook,
    useCustomFieldsHook,
    buildDynamicFields,
    mapRecordToForm,
    prepareSubmitPayload,
    validateFormExtra,
    fieldDefinitions,
    eventDefinitions,
    actionDefinitions,
    schema,
    useFormResourcesHook,
  } = useMakFormModuleConfig();
  const { labels: moduleLabels, metadata: moduleMetadata } = useMakModuleRequired();
  const searchMeta = moduleMetadata?.search ?? {};
  const recordCodeField = searchMeta.codeField ?? searchMeta.primaryField ?? "codigo";
  const recordTitleField = searchMeta.titleField ?? "nome";
  const newRecordLabel = `Nova ${moduleLabels.singular}`;
  const duplicateRecordLabel = `Duplicar ${String(moduleLabels.singular || "registro").toLowerCase()}`;

  const { user } = useAuth();
  const isDuplicating = !!initialData?._isDuplicate;
  const isLayoutBrowse = browseMode && !isEditing && !isDuplicating;
  const [errors, setErrors] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [layoutToolbarBridge, setLayoutToolbarBridge] = useState(null);
  const [editMode, setEditMode] = useState(
    isLayoutBrowse ? false : !isEditing || isDuplicating
  );
  const [launchPanelStyle, setLaunchPanelStyle] = useState(() =>
    readStoredLaunchPanelStyle()
  );
  const nativeLayoutFieldIdsSet = useMemo(
    () => new Set(Object.values(EMP_FORM_DEFAULT_LAYOUT).flat().filter(Boolean)),
    [EMP_FORM_DEFAULT_LAYOUT]
  );
  const scopeCssClass = useMemo(() => buildModeloBase1ScopeCssClass(moduleId), [moduleId]);

  const {
    isLayoutReady,
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
  } = useCadastroForm(cadastroConfig, {
    userId: user?.id,
    nativeFieldIds: nativeLayoutFieldIdsSet,
  });

  const fieldLayoutConfig = activeLayoutConfig?.fieldLayoutConfig;

  const buildFormData = (data) => {
    if (typeof mapRecordToForm === "function") {
      return data ? mapRecordToForm(data) : buildEmptyEmpresaForm();
    }
    return data
      ? { ...buildEmptyEmpresaForm(), ...data, campos_personalizados: data.campos_personalizados || {} }
      : buildEmptyEmpresaForm();
  };
  const [formData, setFormData] = useState(() => buildFormData(initialData));
  const previousRecordKeyRef = useRef(recordKey);
  const resetSignatureRef = useRef("");
  const submitRef = useRef(async () => {});
  const validateRef = useRef(() => true);
  const deleteRef = useRef(async () => {});

  const actionUi = useMemo(
    () => ({
      openDialog: (dialogId) => {
        if (dialogId === "layout-config") setLayoutConfigOpen(true);
      },
      closeDialog: (dialogId) => {
        if (dialogId === "layout-config") setLayoutConfigOpen(false);
      },
      submit: () => submitRef.current?.(),
      duplicate: () => onDuplicate?.(),
      deleteRecord: () => deleteRef.current?.(),
      refresh: () => onRefresh?.(),
    }),
    [onDuplicate, onRefresh, setLayoutConfigOpen]
  );

  useEffect(() => {
    const resetSignature = [
      recordKey ?? "",
      resetSeed,
      initialData?.id ?? "",
      initialData?.[recordCodeField] ?? "",
      initialData?.id_global ?? "",
      initialData?._isPersisting ? "persisting" : "",
      initialData?.updatedAt ?? "",
      initialData?._isDuplicate ? "dup" : "",
      isEditing ? "editing" : isLayoutBrowse ? "browse" : "new",
    ].join("|");
    if (resetSignatureRef.current === resetSignature) return;
    resetSignatureRef.current = resetSignature;

    let next = buildFormData(initialData);
    if (initialData?._isDuplicate) {
      const layoutKey = user?.id
        ? getLayoutStorageKeysForModule(cadastroConfig, user.id).layoutKey
        : null;
      let clearIds = formLayoutConfig?.clearOnDuplicateFieldIds || [];
      if (!clearIds.length && layoutKey) {
        const saved = readEmpPreferencesJson(layoutKey, null);
        clearIds = saved?.clearOnDuplicateFieldIds || [];
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
    setEditMode(isLayoutBrowse ? false : !isEditing || !!initialData?._isDuplicate);
    if (!isRecordNavigation) {
      setActiveTab(LAYOUT_MAIN_TAB_ID);
    }
  }, [
    recordKey,
    resetSeed,
    initialData?.id,
    initialData?.[recordCodeField],
    initialData?.id_global,
    initialData?._isPersisting,
    initialData?.updatedAt,
    initialData?._isDuplicate,
    isEditing,
    browseMode,
    isLayoutBrowse,
    formLayoutConfig?.clearOnDuplicateFieldIds,
    user?.id,
  ]);

  const { data: camposPersonalizados = [], isFetched: camposPersonalizadosReady } =
    useRecordFieldsHook();

  const camposPersonalizadosForm = useMemo(() => camposPersonalizados
    .map(campoEngine.normalize)
    .filter((campo) => campo.ativo !== false && campo.visivel_form !== false && !NATIVE_FIELDS.has(campo.field_name)),
    [camposPersonalizados]
  );

  useMakFormFormulaEvaluation({
    formData,
    setFormData,
    fieldDefinitions,
    customFields: camposPersonalizadosForm,
    enabled: camposPersonalizadosReady,
  });

  const { dispatchFormEvent } = useMakFormEventHandlers({
    moduleId,
    eventDefinitions,
    actionDefinitions,
    formData,
    setFormData,
    recordKey,
    isEditing,
    ui: actionUi,
    fieldDefinitions,
    schema,
    customFields: camposPersonalizadosForm,
    runValidation: () => validateRef.current?.(),
    enabled: camposPersonalizadosReady,
  });

  useMakFormActionHandlers({
    moduleId,
    actionDefinitions,
    formData,
    setFormData,
    ui: actionUi,
    fieldDefinitions,
    schema,
    customFields: camposPersonalizadosForm,
    runValidation: () => validateRef.current?.(),
    enabled: camposPersonalizadosReady,
  });

  const relatedSources = useMemo(() => camposPersonalizadosForm
    .map((campo) => {
      const entity = campoEngine.getOptionsSourceKey(campo);
      return campo.tipo === "relation" && entity ? { entity, labelField: campo.options_label_field || campo.relation_display_field || "nome", valueField: campo.options_value_field || "id" } : null;
    })
    .filter(Boolean),
    [camposPersonalizadosForm]
  );

  const { data: relatedOptions = {} } = useQuery({
    queryKey: [`${moduleId}-form-related-options`, relatedSources.map((source) => `${source.entity}:${source.labelField}:${source.valueField}`).join("|")],
    queryFn: () => empRepository.listOptionsSources(relatedSources),
    enabled: relatedSources.length > 0,
    initialData: {},
    placeholderData: (previous) => previous ?? {},
    staleTime: 120_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  const isReadOnly = (isEditing && !isDuplicating && !editMode) || isLayoutBrowse;

  const handleChange = (field, value) => {
    if (isReadOnly) return;
    const normalized = UPPER_FIELDS.includes(field) && typeof value === "string" ? value.toUpperCase() : value;
    setErrors((prev) => ({ ...prev, [field]: false }));
    clearRequiredFieldErrors();
    setFormData((prev) => ({ ...prev, [field]: normalized }));
    dispatchFormEvent("onChange", {
      field,
      value: normalized,
      previousValue: formData[field],
      formData: { ...formData, [field]: normalized },
    });
  };

  const handleCustomChange = (fieldName, value) => {
    if (isReadOnly) return;
    setErrors((prev) => ({ ...prev, [`campos_personalizados.${fieldName}`]: false }));
    clearRequiredFieldErrors();
    const next = {
      ...formData,
      campos_personalizados: {
        ...(formData.campos_personalizados || {}),
        [fieldName]: value,
      },
    };
    const calculated = campoEngine.aplicarCamposCalculados
      ? campoEngine.aplicarCamposCalculados(next, camposPersonalizadosForm)
      : next;
    setFormData(calculated);
    dispatchFormEvent("onChange", {
      field: `campos_personalizados.${fieldName}`,
      value,
      previousValue: formData.campos_personalizados?.[fieldName],
      formData: calculated,
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

  const formResources = useFormResourcesHook({
    formData,
    initialData,
    isEditing,
    isDuplicating,
    recordKey,
  });

  const { renderCampoPersonalizado } = useCustomFieldsHook({
    formData,
    isReadOnly,
    handleCustomChange,
    relatedOptions,
    onUploadError: () => showError("Não foi possível enviar a imagem."),
    mgPrototype: hideToolbar,
  });

  const dynamicFields = useMemo(() => {
    if (typeof buildDynamicFields !== "function") {
      console.error(`[MakCadastroForm] buildDynamicFields ausente para módulo ${moduleId}`);
      return [];
    }
    return buildDynamicFields({
      formData,
      setFormData,
      handleChange,
      isReadOnly,
      inputClass,
      initialData,
      isEditing,
      isDuplicating,
      errors,
      hideToolbar,
      formResources,
      recordKey,
      camposPersonalizadosForm,
      renderCampoPersonalizado,
      relatedOptions,
      uploadingLogo,
      handleLogoUpload,
      handleCustomChange,
      estados: ESTADOS_BR,
    });
  }, [
    buildDynamicFields,
    moduleId,
    formData,
    setFormData,
    handleChange,
    isReadOnly,
    inputClass,
    initialData,
    isEditing,
    isDuplicating,
    errors,
    hideToolbar,
    formResources,
    recordKey,
    camposPersonalizadosForm,
    renderCampoPersonalizado,
    relatedOptions,
    uploadingLogo,
    handleLogoUpload,
    handleCustomChange,
    ESTADOS_BR,
  ]);

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

  const panelIdByFieldId = useMemo(() => {
    const panelMap = {};
    tabs.forEach((panel) => {
      const fieldIds = getPanelFieldIdsFromLayout(activeLayoutConfig?.layout, panel.id);
      fieldIds.forEach((fieldId) => {
        panelMap[fieldId] = panel.id;
      });
    });
    return panelMap;
  }, [tabs, activeLayoutConfig?.layout]);

  const applyLayoutConfig = (source, options) => applyLayoutConfigFromEngine(source, options);

  const tabIdsKey = useMemo(() => tabs.map((panel) => panel.id).join("|"), [tabs]);
  const lastAutoRepairSigRef = useRef("");
  const autoRepairAttemptedRef = useRef(false);
  const knownLayoutFieldIdsKey = useMemo(
    () => [...knownLayoutFieldIds].sort().join("|"),
    [knownLayoutFieldIds]
  );

  useEffect(() => {
    if (!formLayoutConfig || layoutConfigOpen) return;
    const activeTabValid = tabs.some((panel) => panel.id === activeTab);
    if (!activeTabValid) {
      const nextTab = tabs[0]?.id || LAYOUT_MAIN_TAB_ID;
      if (nextTab !== activeTab) setActiveTab(nextTab);
    }
  }, [formLayoutConfig, tabIdsKey, tabs, activeTab, layoutConfigOpen]);

  useEffect(() => {
    if (autoRepairAttemptedRef.current) return;
    if (!user?.id || !formLayoutConfig || layoutConfigOpen) return;

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
    const repairedSig = stableStringify(pickLayoutConfig(repaired));
    const currentSig = stableStringify(pickLayoutConfig(formLayoutConfig));

    autoRepairAttemptedRef.current = true;

    const needsRepair =
      storedKnownCount === 0 ||
      repairedKnownCount > storedKnownCount ||
      hasHiddenSystemPanels;

    if (!needsRepair || repairedSig === currentSig) {
      lastAutoRepairSigRef.current = currentSig;
      layoutPersistedRef.current = true;
      return;
    }

    lastAutoRepairSigRef.current = repairedSig;
    layoutPersistedRef.current = true;
    applyLayoutConfigFromEngine(repaired, {
      updateActiveTab: true,
      persistenceOrigin: "migration",
    });
  }, [
    user?.id,
    formLayoutConfig,
    layoutConfigOpen,
    defaultConfigFull,
    knownLayoutFieldIdsKey,
    knownLayoutFieldIds,
    applyLayoutConfigFromEngine,
  ]);

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
    }, { persistenceOrigin: "user-action" });
  };

  const validateForm = () => {
    const panelIds = tabs.map((panel) => panel.id);
    const result = runMakFormValidation({
      formData,
      dynamicFields,
      fieldDefinitions,
      panelIds,
      layout: activeLayoutConfig?.layout,
      hiddenFieldIds: activeLayoutConfig?.hiddenFieldIds || [],
      requiredFieldIds: activeLayoutConfig?.requiredFieldIds || [],
      visibilityRules: activeLayoutConfig?.visibilityRules || {},
      nativeRequiredFieldNames: REQUIRED_FIELDS,
      camposPersonalizadosForm,
      validateFormExtra,
      schema,
      activeTab,
      tabs,
      setActiveTab,
    });
    setErrors(result.errors);
    clearRequiredFieldErrors();
    if (!result.valid) {
      const firstErrorKey = Object.keys(result.errors)[0];
      const firstErrorField = dynamicFields.find(
        (field) =>
          field.errorKey === firstErrorKey ||
          field.dataField === firstErrorKey ||
          field.name === firstErrorKey
      );
      const targetPanelId = firstErrorField?.id ? panelIdByFieldId[firstErrorField.id] : null;
      const shouldSwitchPanel = Boolean(targetPanelId && targetPanelId !== activeTab);
      if (shouldSwitchPanel) {
        setActiveTab(targetPanelId);
      }

      const isMobileViewport =
        typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
      const report = () =>
        reportRequiredFieldErrors(result.errors, {
          focus: !isMobileViewport,
          activate: !isMobileViewport,
        });
      if (shouldSwitchPanel) {
        requestAnimationFrame(() => {
          requestAnimationFrame(report);
        });
      } else {
        report();
      }
      return false;
    }

    return true;
  };
  validateRef.current = validateForm;

  const handleSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isReadOnly || actionsLocked) return;

    const beforeSave = await dispatchFormEvent("onBeforeSave", { formData });
    if (beforeSave.cancelled) return;

    const valid = validateForm();
    await dispatchFormEvent("onValidationCompleted", { valid, formData });
    if (!valid) return;

    const formulaResult = runMakFormulaEvaluation({
      formData,
      fieldDefinitions,
      customFields: camposPersonalizadosForm,
      customFieldCalculator: (scope, campo) => campoEngine.calcularCampo(scope, campo),
    });
    await dispatchFormEvent("onFormulaCalculated", { formulaResult, formData });

    const mergedFormData = { ...formData };
    Object.entries(formulaResult.values).forEach(([key, value]) => {
      if (key.startsWith("campos_personalizados.")) {
        const fieldKey = key.replace("campos_personalizados.", "");
        mergedFormData.campos_personalizados = {
          ...(mergedFormData.campos_personalizados || {}),
          [fieldKey]: value,
        };
      } else {
        mergedFormData[key] = value;
      }
    });
    const calculated = campoEngine.aplicarCamposCalculados
      ? campoEngine.aplicarCamposCalculados(mergedFormData, camposPersonalizadosForm)
      : mergedFormData;
    let payload = { ...formData, campos_personalizados: calculated.campos_personalizados || {} };
    if (typeof prepareSubmitPayload === "function") {
      payload = prepareSubmitPayload(payload);
    }
    const { _isDuplicate, ...clean } = payload;

    await dispatchFormEvent("onSave", { payload: clean, formData: calculated });
    if (isEditing && !isDuplicating) setEditMode(false);
    onSubmit(clean);
    await dispatchFormEvent("onAfterSave", { payload: clean, formData: calculated });
  };
  submitRef.current = () => handleSubmit();

  const handleDelete = useCallback(async () => {
    const result = await dispatchFormEvent("onBeforeDelete", { formData });
    if (result.cancelled) return;
    await dispatchFormEvent("onDelete", { formData });
    if (typeof onDelete === "function") onDelete();
    await dispatchFormEvent("onAfterDelete", { formData });
  }, [dispatchFormEvent, formData, onDelete]);
  deleteRef.current = handleDelete;

  const formRef = useCadastroEnterNavigation(!isReadOnly && editMode);

  const focusFirstFormControl = useCallback(() => {
    const root = formRef.current;
    if (!root) return;
    const controls = Array.from(
      root.querySelectorAll(
        [
          'input:not([type="hidden"]):not([disabled])',
          "textarea:not([disabled]):not([readonly])",
          "select:not([disabled])",
          ".cmd-display[tabindex]:not([tabindex='-1'])",
          ".mg-lookup-display[tabindex]:not([tabindex='-1'])",
          "button.emp-form-toggle-switch:not([disabled])",
          ".mak-switch input:not([disabled])",
          ".emp-form-toggle-switch input:not([disabled])",
        ].join(", ")
      )
    ).filter((node) => node instanceof HTMLElement && node.getClientRects().length > 0);
    const firstControl = controls[0];
    if (firstControl instanceof HTMLElement) {
      firstControl.focus({ preventScroll: false });
    }
  }, [formRef]);

  const startEditMode = useCallback(() => {
    if (actionsLocked) return;
    setEditMode(true);
    const firstTabId = tabs[0]?.id || LAYOUT_MAIN_TAB_ID;
    if (activeTab !== firstTabId) {
      setActiveTab(firstTabId);
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusFirstFormControl();
      });
    });
  }, [actionsLocked, tabs, activeTab, setActiveTab, focusFirstFormControl]);

  const resolveActionBarButton = useCallback((label) => {
    if (typeof document === "undefined") return null;
    return Array.from(document.querySelectorAll(".mg-action-bar .tb-btn-labeled:not([disabled])")).find(
      (node) => String(node.textContent || "").trim().toLowerCase() === label
    ) || null;
  }, []);

  useEffect(() => {
    const root = formRef.current;
    if (!root || isReadOnly || !editMode || actionsLocked) return undefined;

    const handleTabAcrossPanels = (event) => {
      if (event.key !== "Tab" || event.defaultPrevented || event.shiftKey) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!root.contains(target)) return;

      const controls = Array.from(
        root.querySelectorAll(
          [
            'input:not([type="hidden"]):not([disabled])',
            "textarea:not([disabled]):not([readonly])",
            "select:not([disabled])",
            ".cmd-display[tabindex]:not([tabindex='-1'])",
            ".mg-lookup-display[tabindex]:not([tabindex='-1'])",
            "button.emp-form-toggle-switch:not([disabled])",
          ".mak-switch input:not([disabled])",
          ".emp-form-toggle-switch input:not([disabled])",
          ].join(", ")
        )
      ).filter((node) => node instanceof HTMLElement && node.getClientRects().length > 0);

      if (controls.length === 0) return;
      const currentIndex = controls.indexOf(target);
      if (currentIndex < 0 || currentIndex < controls.length - 1) return;

      event.preventDefault();

      const panelIndex = tabs.findIndex((panel) => panel.id === activeTab);
      if (panelIndex >= 0 && panelIndex < tabs.length - 1) {
        const nextPanel = tabs[panelIndex + 1];
        setActiveTab(nextPanel.id);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            focusFirstFormControl();
          });
        });
        return;
      }

      const saveButton = resolveActionBarButton("salvar");
      if (saveButton instanceof HTMLElement) {
        saveButton.focus({ preventScroll: false });
        return;
      }

      const cancelButton = resolveActionBarButton("cancelar");
      if (cancelButton instanceof HTMLElement) {
        cancelButton.focus({ preventScroll: false });
      }
    };

    root.addEventListener("keydown", handleTabAcrossPanels, true);
    return () => root.removeEventListener("keydown", handleTabAcrossPanels, true);
  }, [
    formRef,
    isReadOnly,
    editMode,
    actionsLocked,
    tabs,
    activeTab,
    setActiveTab,
    focusFirstFormControl,
    resolveActionBarButton,
  ]);

  useEffect(() => {
    if (isReadOnly || !editMode || actionsLocked) return undefined;

    const handleToolbarTabCycle = (event) => {
      if (event.key !== "Tab" || event.defaultPrevented || event.shiftKey) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const saveButton = resolveActionBarButton("salvar");
      const cancelButton = resolveActionBarButton("cancelar");

      if (saveButton && target === saveButton) {
        event.preventDefault();
        if (cancelButton instanceof HTMLElement) {
          cancelButton.focus({ preventScroll: false });
        } else {
          focusFirstFormControl();
        }
        return;
      }

      if (cancelButton && target === cancelButton) {
        event.preventDefault();
        const firstTab = tabs[0]?.id;
        if (firstTab && firstTab !== activeTab) {
          setActiveTab(firstTab);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              focusFirstFormControl();
            });
          });
          return;
        }
        focusFirstFormControl();
      }
    };

    document.addEventListener("keydown", handleToolbarTabCycle, true);
    return () => document.removeEventListener("keydown", handleToolbarTabCycle, true);
  }, [
    isReadOnly,
    editMode,
    actionsLocked,
    resolveActionBarButton,
    focusFirstFormControl,
    tabs,
    activeTab,
    setActiveTab,
  ]);

  const recordMeta = useMemo(() => {
    if (layoutConfigOpen) return null;

    const codigo =
      formData[recordCodeField] != null && String(formData[recordCodeField]).trim() !== ""
        ? formData[recordCodeField]
        : null;
    const nome = String(formData[recordTitleField] || "").trim() || null;

    if (!isEditing) {
      if (isLayoutBrowse) {
        return { codigo: null, nome: moduleLabels.singular ?? "Registro" };
      }
      return { codigo: null, nome: newRecordLabel };
    }
    if (isDuplicating && nome) return { codigo: null, nome };
    if (isDuplicating) return { codigo: null, nome: duplicateRecordLabel };
    if (codigo && nome) return { codigo, nome };
    if (nome) return { codigo, nome };
    return null;
  }, [
    formData[recordCodeField],
    formData[recordTitleField],
    isDuplicating,
    isEditing,
    isLayoutBrowse,
    layoutConfigOpen,
  ]);

  const operationLabel = useMemo(
    () =>
      layoutConfigOpen
        ? "Configuração de layout"
        : isLayoutBrowse
          ? "Visualização"
          : resolveRecordOperationLabel({
            isEditing,
            editMode,
            isDuplicating,
            isSaving: actionsLocked,
          }),
    [isEditing, editMode, isDuplicating, actionsLocked, layoutConfigOpen, isLayoutBrowse]
  );

  const showRequiredCounter = !isReadOnly && !layoutConfigOpen && !isLayoutBrowse;
  const isSidebarPanelStyle = launchPanelStyle === "sidebar";

  const toggleLaunchPanelStyle = useCallback(() => {
    setLaunchPanelStyle((prev) => (prev === "tabs" ? "sidebar" : "tabs"));
  }, []);

  const launchPanelStyleToggleLabel = isSidebarPanelStyle
    ? "Mostrar painéis em abas horizontais"
    : "Mostrar painéis em lista lateral";
  const LaunchPanelStyleToggleIcon = isSidebarPanelStyle ? LayoutGrid : PanelLeft;

  useEffect(() => {
    writeStoredLaunchPanelStyle(launchPanelStyle, "form-layout:panel-style-local");
  }, [launchPanelStyle]);
  const launchPanelStyleToggle = (
    <button
      type="button"
      className={`mg-nav-btn ios-btn mg-panel-style-toggle${isSidebarPanelStyle ? " is-active" : ""}`}
      onClick={toggleLaunchPanelStyle}
      title={launchPanelStyleToggleLabel}
      aria-label={launchPanelStyleToggleLabel}
      aria-pressed={isSidebarPanelStyle}
    >
      <LaunchPanelStyleToggleIcon className="mg-panel-style-toggle__icon" strokeWidth={2.1} />
    </button>
  );

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

  const toolbarBridgeSigRef = useRef("");

  useEffect(() => {
    if (!onToolbarBridge) return;
    const recordMetaKey = recordMeta
      ? `${recordMeta.codigo ?? ""}|${recordMeta.nome ?? ""}`
      : "";
    const bridgeSig = [
      editMode,
      isReadOnly,
      isEditing,
      isDuplicating,
      layoutConfigOpen,
      layoutToolbarBridge ? "layout-toolbar" : "",
      recordMetaKey,
      filterOpen,
    ].join("|");
    if (toolbarBridgeSigRef.current === bridgeSig) return;
    toolbarBridgeSigRef.current = bridgeSig;
    onToolbarBridge({
      editMode,
      isReadOnly,
      isEditing,
      isDuplicating,
      isBrowseMode: isLayoutBrowse,
      layoutConfigOpen,
      layoutToolbar: layoutConfigOpen ? layoutToolbarBridge : null,
      recordMeta,
      onSave: () => handleSubmit(),
      onCancel,
      onEdit: startEditMode,
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
    isLayoutBrowse,
    layoutConfigOpen,
    layoutToolbarBridge,
    recordMeta,
    onCancel,
    filterOpen,
    onToggleFilter,
    startEditMode,
  ]);

  const renderFormBody = (mgVariant = false, panelStyle = "tabs", panelStyleToggle = null) => {
    const showSidebarPanels = mgVariant && panelStyle === "sidebar";

    const renderMotionPanel = () => (
      <MakMotionPanel
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
      </MakMotionPanel>
    );

    return (
      <div className={`emp-form-body flex min-h-0 flex-1 flex-col${showSidebarPanels ? " mg-panel-sidebar-body" : ""}`}>
        <div className={`emp-form-panels-zone flex min-h-0 flex-1 flex-col${showSidebarPanels ? " mg-panel-sidebar-zone" : ""}`}>
          {!mgVariant ? (
            <CadTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              systemPanelIds={cadastroConfig.systemPanelIds}
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

          {showSidebarPanels ? (
            <div className="mg-panel-sidebar-layout">
              <aside className="mg-panel-sidebar-layout__tabs">
                <CadTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  systemPanelIds={cadastroConfig.systemPanelIds}
                  variant="mg-sidebar"
                  leading={panelStyleToggle}
                />
              </aside>
              <div className="mg-panel-sidebar-layout__content">
                <ErpScrollNav
                  className="mg-panel-sidebar-layout__scroll min-h-0 flex-1"
                  viewportClassName="overflow-y-auto"
                  wheelScrollMode="scrollbar-only"
                >
                  {renderMotionPanel()}
                </ErpScrollNav>
              </div>
            </div>
          ) : (
            renderMotionPanel()
          )}
        </div>
      </div>
    );
  };

  if (!isLayoutReady || !activeLayoutConfig) {
    return (
      <div className={`cadastro-scope erp-ui ${scopeCssClass} flex h-full min-h-0 flex-1 flex-col overflow-hidden`}>
        <div className="m-3 animate-pulse rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm md:m-5">
          <div className="mb-3 h-6 w-56 rounded bg-slate-200" />
          <div className="mb-2 h-10 w-full rounded bg-slate-100" />
          <div className="mb-2 h-10 w-full rounded bg-slate-100" />
          <div className="h-64 w-full rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (layoutConfigOpen) {
    return (
      <section className={`cadastro-scope ${scopeCssClass} flex h-full w-full max-w-full overflow-hidden`}>
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
          systemPanelIds={cadastroConfig.systemPanelIds}
          fixedPanelIds={cadastroConfig.fixedPanelIds ?? []}
          fixedVisibleFieldIds={cadastroConfig.fixedVisibleFieldIds ?? []}
          onSave={saveLayoutConfig}
          brandTheme={cadastroConfig.brandTheme ?? true}
        />
      </section>
    );
  }

  return (
    <div className={`cadastro-scope erp-ui ${scopeCssClass} flex h-full min-h-0 flex-1 flex-col overflow-hidden`}>
      <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
                onEditRecord={startEditMode}
                onLayoutConfigClick={() => { if (filterOpen) onToggleFilter?.(); setLayoutConfigOpen(true); }}
                onToggleView={onToggleView}
                toggleViewDisabled={editMode}
                total={total}
                currentIndex={currentIndex}
                onNew={onNew}
                onFirst={onFirst}
                onPrevious={onPrevious}
                onNext={onNext}
                onLast={onLast}
                onDelete={handleDelete}
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
            <ErpScrollNav
              className="form-scroll-container min-h-0 flex-1"
              viewportClassName="overflow-auto"
            >
              {renderFormBody(false)}
            </ErpScrollNav>
          </CadSplitLayout>
        )}
        {hideToolbar ? (
          <div id="mode-registro" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {!isSidebarPanelStyle ? (
              <div className="mg-panel-tabs-strip mg-panel-tabs-strip--no-bg shrink-0 px-3 md:px-5">
                <CadTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  systemPanelIds={cadastroConfig.systemPanelIds}
                  variant="mg"
                  leading={launchPanelStyleToggle}
                />
              </div>
            ) : null}
            {isSidebarPanelStyle ? (
              <div
                className={`mg-form-scroll mg-prototype-form${
                  isReadOnly ? " mg-prototype-form--readonly" : ""
                }${editMode && !isReadOnly ? " mg-prototype-form--edit" : ""} mg-form-scroll--panel-sidebar`}
              >
                {renderFormBody(true, launchPanelStyle, launchPanelStyleToggle)}
              </div>
            ) : (
              <ErpScrollNav
                className={`mg-form-scroll mg-prototype-form${
                  isReadOnly ? " mg-prototype-form--readonly" : ""
                }${editMode && !isReadOnly ? " mg-prototype-form--edit" : ""}`}
                viewportClassName="overflow-y-auto"
                wheelScrollMode="scrollbar-only"
              >
                {renderFormBody(true, launchPanelStyle, launchPanelStyleToggle)}
              </ErpScrollNav>
            )}
          </div>
        ) : null}
        {hideToolbar && !editMode && total > 0 && initialData?.id ? (
          <div className="emp-form-mobile-nav md:hidden" role="navigation" aria-label="Navegação entre registros">
            <button
              type="button"
              className="emp-form-mobile-nav__btn"
              onClick={onPrevious}
              disabled={actionsLocked || currentIndex <= 0}
              title="Anterior"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Anterior</span>
            </button>
            <span className="emp-form-mobile-nav__counter" title="Posição do registro">
              {formatCadastroRecordPosition(currentIndex, total)}
            </span>
            <button
              type="button"
              className="emp-form-mobile-nav__btn"
              onClick={onNext}
              disabled={actionsLocked || currentIndex >= total - 1}
              title="Próximo"
            >
              <span>Próximo</span>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
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
