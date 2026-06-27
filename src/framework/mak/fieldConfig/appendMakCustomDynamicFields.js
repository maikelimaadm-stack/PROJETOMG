import campoEngine from "@/framework/cadastro/fields/campoEngine";

/**
 * Anexa campos personalizados ao array de dynamicFields nativos (promovido de Empresas V15).
 * @param {object[]} nativeFields
 * @param {object} ctx
 */
export function appendMakCustomDynamicFields(nativeFields = [], ctx = {}) {
  const {
    camposPersonalizadosForm = [],
    renderCampoPersonalizado = () => null,
    relatedOptions = {},
  } = ctx;

  if (!camposPersonalizadosForm.length) return nativeFields;

  const customFields = camposPersonalizadosForm.map((campo) => ({
    id: `custom:${campo.field_name}`,
    name: campo.field_name,
    label: campo.label,
    type: campo.tipo,
    origem: "customizado",
    dataField: `campos_personalizados.${campo.field_name}`,
    getValue: (values) => values.campos_personalizados?.[campo.field_name] ?? "",
    optionsMode:
      ["select", "option_list"].includes(campo.tipo) &&
      !(campo.options_source_entity || campo.relation_entity)
        ? "manual"
        : "",
    required: campo.obrigatorio,
    errorKey: `campos_personalizados.${campo.field_name}`,
    wide: campo.tipo === "textarea",
    medium: ["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo),
    compact:
      (["number", "date", "data", "time", "calculado"].includes(campo.tipo) && !campo.usar_mascara) ||
      ["imagem", "image", "file"].includes(campo.tipo),
    totalizable: ["number", "calculado"].includes(campo.tipo) && !campo.usar_mascara,
    options: ["select", "option_list"].includes(campo.tipo)
      ? campoEngine.getOptionsCampo(campo, relatedOptions).map((option) => ({
          id: String(option.value || option.label || ""),
          nome: String(option.label || option.value || "").toUpperCase(),
        }))
      : [],
    displayField: "nome",
    searchFields: ["nome"],
    render: (fieldCtx) => renderCampoPersonalizado(campo, fieldCtx),
  }));

  return [...nativeFields, ...customFields];
}

export default appendMakCustomDynamicFields;
