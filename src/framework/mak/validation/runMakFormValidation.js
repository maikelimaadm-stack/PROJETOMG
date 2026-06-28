/**
 * Pipeline unificado de validação de formulário MAK — metadata-driven.
 */
import { buildRequiredFormFieldErrors } from "@/framework/cadastro/layouts/empFormLayoutMetrics.js";
import campoEngine from "@/framework/cadastro/fields/campoEngine.jsx";
import { evaluateMakFieldValidation } from "./makValidationBuiltinRules.js";

const visibleFieldIds = ({ panelIds, layout, hiddenFieldIds, visibilityRules, values }) => {
  const hidden = new Set(hiddenFieldIds || []);
  const visible = new Set();
  for (const panelId of panelIds || []) {
    const panelLayout = layout?.[panelId];
    const fieldIds = Array.isArray(panelLayout)
      ? panelLayout
      : panelLayout?.cards?.flatMap((card) => card.fieldIds || []) || [];
    fieldIds.forEach((fieldId) => {
      if (hidden.has(fieldId)) return;
      const rule = visibilityRules?.[fieldId];
      if (rule && typeof rule === "object" && rule.visible === false) return;
      visible.add(fieldId);
    });
  }
  return visible;
};

export function runMakFormValidation({
  formData,
  dynamicFields = [],
  fieldDefinitions = [],
  panelIds = [],
  layout = {},
  hiddenFieldIds = [],
  requiredFieldIds = [],
  visibilityRules = {},
  nativeRequiredFieldNames = [],
  camposPersonalizadosForm = [],
  validateFormExtra = null,
  schema = null,
  activeTab = null,
  tabs = [],
  setActiveTab = null,
}) {
  const errors = buildRequiredFormFieldErrors({
    panelIds,
    layout,
    fields: dynamicFields,
    hiddenFieldIds,
    requiredFieldIds,
    visibilityRules,
    values: formData,
    nativeRequiredFieldNames,
  });

  const visibleIds = visibleFieldIds({
    panelIds,
    layout,
    hiddenFieldIds,
    visibilityRules,
    values: formData,
  });

  const defsById = new Map(
    fieldDefinitions.map((field) => [field.id ?? field.name, field])
  );

  dynamicFields.forEach((field) => {
    const fieldId = field.id || field.name;
    if (!visibleIds.has(fieldId)) return;
    const def = defsById.get(fieldId) || field;
    const value = formData?.[field.dataField || field.name || fieldId];
    const result = evaluateMakFieldValidation(def, value, formData);
    if (result?.field) {
      errors[result.field] = true;
    }
  });

  const customValidation = campoEngine
    .buildValidationSchema(camposPersonalizadosForm)
    .safeParse(formData.campos_personalizados || {});
  if (!customValidation.success) {
    customValidation.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];
      if (fieldName) errors[`campos_personalizados.${fieldName}`] = true;
    });
  }

  if (schema && typeof schema.safeParse === "function") {
    const schemaResult = schema.safeParse(formData);
    if (!schemaResult.success) {
      schemaResult.error.issues.forEach((issue) => {
        const key = issue.path.join(".") || "form";
        errors[key] = true;
      });
    }
  }

  if (typeof validateFormExtra === "function") {
    const extra = validateFormExtra(formData, { setActiveTab, activeTab, tabs });
    if (extra?.errors) {
      Object.assign(errors, extra.errors);
    }
    if (extra?.focusPanelId && typeof setActiveTab === "function" && extra.focusPanelId !== activeTab) {
      setActiveTab(extra.focusPanelId);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export default runMakFormValidation;
