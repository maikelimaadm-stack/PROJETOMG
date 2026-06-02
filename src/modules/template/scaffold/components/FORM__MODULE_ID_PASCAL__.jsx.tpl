import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EmpRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import EmpDynamicFormRenderer from "@/framework/cadastro/layouts/EmpDynamicFormRenderer";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import __REPOSITORY_NAME__ from "@/modules/__MODULE_ID__/repositories/__REPOSITORY_NAME__";

export default function FORM__MODULE_ID_PASCAL__({
  initialData = null,
  onSubmit,
  onCancel,
  onSettingsClick,
  onToggleView,
  onAttachClick,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onDelete,
  onDuplicate,
  onNew,
  total = 0,
  currentIndex = 0,
  searchValue = "",
  onSearchChange,
}) {
  const [formState, setFormState] = useState({
    nome: "",
    status: "Ativo",
    observacoes: "",
    campos_personalizados: {},
  });
  const [errors, setErrors] = useState({});

  const { data: camposPersonalizados = [] } = useQuery({
    queryKey: ["__MODULE_ID__", "campos"],
    queryFn: () => __REPOSITORY_NAME__.listCamposPersonalizados(),
    initialData: [],
  });

  const camposPersonalizadosForm = useMemo(
    () =>
      camposPersonalizados
        .map(campoEngine.normalize)
        .filter((campo) => campo.ativo !== false && campo.visivel_form !== false),
    [camposPersonalizados]
  );

  const relatedSources = useMemo(
    () =>
      camposPersonalizadosForm
        .map((campo) => {
          const entity = campoEngine.getOptionsSourceKey(campo);
          return campo.tipo === "relation" && entity
            ? {
                entity,
                labelField: campo.options_label_field || campo.relation_display_field || "nome",
                valueField: campo.options_value_field || "id",
              }
            : null;
        })
        .filter(Boolean),
    [camposPersonalizadosForm]
  );

  const { data: relatedOptions = {} } = useQuery({
    queryKey: [
      "__MODULE_ID__",
      "related-options",
      relatedSources.map((source) => `${source.entity}:${source.labelField}:${source.valueField}`).join("|"),
    ],
    queryFn: () => __REPOSITORY_NAME__.listOptionsSources(relatedSources),
    enabled: relatedSources.length > 0,
    initialData: {},
  });

  useEffect(() => {
    if (!initialData) {
      setFormState({ nome: "", status: "Ativo", observacoes: "", campos_personalizados: {} });
      return;
    }
    setFormState({
      empresa_id: initialData.empresa_id,
      codempresa: initialData.codempresa,
      nome_empresa: initialData.nome_empresa,
      nome: initialData.nome || "",
      status: initialData.status || "Ativo",
      observacoes: initialData.observacoes || "",
      campos_personalizados: initialData.campos_personalizados || {},
    });
  }, [initialData]);

  const dynamicFields = useMemo(
    () => [
      {
        id: "nome",
        name: "nome",
        label: "Nome",
        type: "text",
        required: true,
        placeholder: "NOME",
        uppercase: true,
      },
      {
        id: "status",
        name: "status",
        label: "Status",
        type: "text",
        placeholder: "ATIVO",
      },
      {
        id: "observacoes",
        name: "observacoes",
        label: "Observações",
        type: "textarea",
        placeholder: "OBSERVAÇÕES",
      },
      ...camposPersonalizadosForm.map((campo) => ({
        id: `custom:${campo.field_name}`,
        name: campo.field_name,
        label: campo.label,
        type: campo.tipo,
        origem: "customizado",
        required: campo.obrigatorio,
        errorKey: `campos_personalizados.${campo.field_name}`,
        optionsMode:
          ["select", "option_list"].includes(campo.tipo) &&
          !(campo.options_source_entity || campo.relation_entity)
            ? "manual"
            : "",
        options: ["select", "option_list"].includes(campo.tipo)
          ? campoEngine.getOptionsCampo(campo, relatedOptions).map((option) => ({
              id: String(option.value || option.label || ""),
              nome: String(option.label || option.value || "").toUpperCase(),
            }))
          : [],
        displayField: "nome",
        searchFields: ["nome"],
        getValue: (values) => values.campos_personalizados?.[campo.field_name] || "",
      })),
    ],
    [camposPersonalizadosForm, relatedOptions]
  );

  const layout = useMemo(
    () => ({
      principal: ["nome", "status", "observacoes"],
      campos_personalizados: camposPersonalizadosForm.map((campo) => `custom:${campo.field_name}`),
    }),
    [camposPersonalizadosForm]
  );

  const onChangeField = (fieldName, value) => {
    setErrors((previous) => ({ ...previous, [fieldName]: false }));
    if (fieldName in formState) {
      setFormState((previous) => ({ ...previous, [fieldName]: value }));
      return;
    }
    setFormState((previous) => ({
      ...previous,
      campos_personalizados: {
        ...(previous.campos_personalizados || {}),
        [fieldName]: value,
      },
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!String(formState.nome || "").trim()) nextErrors.nome = true;
    const customValidation = campoEngine
      .buildValidationSchema(camposPersonalizadosForm)
      .safeParse(formState.campos_personalizados || {});
    if (!customValidation.success) {
      customValidation.error.issues.forEach((issue) => {
        if (!issue.path?.[0]) return;
        nextErrors[`campos_personalizados.${issue.path[0]}`] = true;
      });
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="cadastro-emp-scope h-full min-h-0 overflow-hidden flex flex-col">
      <EmpSplitToolbarLayout
        className="flex-1"
        toolbar={
          <EmpRecordToolbar
            title="Cadastro de __PLURAL_LABEL__"
            operationLabel={initialData?.id ? "Edição" : "Cadastro"}
            badgeLabel="__SINGULAR_LABEL__"
            showSaveActions
            showUtilityActions
            onCancel={onCancel}
            onSave={() => {
              if (!validate()) return;
              const calculated = campoEngine.aplicarCamposCalculados
                ? campoEngine.aplicarCamposCalculados(formState, camposPersonalizadosForm)
                : formState;
              onSubmit?.({
                ...formState,
                campos_personalizados: calculated.campos_personalizados || {},
              });
            }}
            onSettingsClick={onSettingsClick}
            onAttachClick={onAttachClick}
            onToggleView={onToggleView}
            onFirst={onFirst}
            onPrevious={onPrevious}
            onNext={onNext}
            onLast={onLast}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onNew={onNew}
            total={total}
            currentIndex={currentIndex}
            showSearch
            searchValue={searchValue}
            onSearchChange={onSearchChange}
          />
        }
      >
      <div className="flex-1 min-h-0 overflow-auto p-3 space-y-3">
        <EmpDynamicFormRenderer
          panels={[
            { id: "principal", label: "__SINGULAR_LABEL__" },
            { id: "campos_personalizados", label: "Campos Personalizados" },
          ]}
          fields={dynamicFields}
          layout={layout}
          activePanelId="principal"
          values={formState}
          errors={errors}
          onChange={onChangeField}
        />
        {camposPersonalizadosForm.length > 0 ? (
          <EmpDynamicFormRenderer
            panels={[
              { id: "principal", label: "__SINGULAR_LABEL__" },
              { id: "campos_personalizados", label: "Campos Personalizados" },
            ]}
            fields={dynamicFields}
            layout={layout}
            activePanelId="campos_personalizados"
            values={formState}
            errors={errors}
            onChange={onChangeField}
          />
        ) : null}
      </div>
      </EmpSplitToolbarLayout>
    </div>
  );
}

