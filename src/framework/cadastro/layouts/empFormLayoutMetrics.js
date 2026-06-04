import { flattenV3LayoutToV2, coerceLayoutToV3 } from "./layoutConfigV3.js";

const normalizeConditionText = (value) =>
  String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const getOptionValue = (option) => String(option?.id ?? option?.value ?? option?.label ?? option?.nome ?? "");
const getOptionLabel = (option) => String(option?.nome ?? option?.label ?? option?.value ?? option?.id ?? "");

const conditionMatches = (current, expected, sourceField) => {
  const expectedText = normalizeConditionText(expected);
  const currentValues = new Set([normalizeConditionText(current)]);
  (sourceField?.options || []).forEach((option) => {
    const optionValue = getOptionValue(option);
    const optionLabel = getOptionLabel(option);
    if (
      normalizeConditionText(optionValue) === normalizeConditionText(current) ||
      normalizeConditionText(optionLabel) === normalizeConditionText(current)
    ) {
      currentValues.add(normalizeConditionText(optionValue));
      currentValues.add(normalizeConditionText(optionLabel));
    }
  });
  return currentValues.has(expectedText);
};

const getFieldValue = (field, values) => {
  if (field?.getValue) return field.getValue(values, {});
  if (String(field?.id || "").startsWith("custom:")) {
    return values?.campos_personalizados?.[field.name];
  }
  return values?.[field.name];
};

const isEmptyRequiredValue = (value, field) => {
  if (field?.type === "checkbox" || field?.type === "switch") return value === undefined || value === null;
  if (field?.type === "option_list") return !Array.isArray(value) || value.length === 0;
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return Number.isNaN(value);
  return !String(value ?? "").trim();
};

const isFieldRequired = (field, requiredFieldIds = [], nativeRequiredFieldNames = []) =>
  !!field?.required || requiredFieldIds.includes(field?.id) || nativeRequiredFieldNames.includes(field?.name);

const isFieldVisible = (field, { hiddenFieldIds = [], visibilityRules = {}, fields = [], values = {} }) => {
  if (!field || field.visible === false || hiddenFieldIds.includes(field.id)) return false;

  const rule = visibilityRules[field.id] || field.defaultVisibilityRule;
  if (rule?.always) return true;

  if (rule?.sourceFieldName) {
    const sourceField = fields.find((item) => item.id === rule.sourceFieldId);
    if (sourceField?.type !== "select" || !["manual", "native"].includes(sourceField?.optionsMode)) return true;
    const current = values[rule.sourceFieldName] ?? values.campos_personalizados?.[rule.sourceFieldName];
    return conditionMatches(current, rule.value, sourceField);
  }

  return typeof field.showWhen === "function" ? field.showWhen(values, {}) : true;
};

export function countRequiredFormFields({
  panelIds = [],
  layout = {},
  fields = [],
  hiddenFieldIds = [],
  requiredFieldIds = [],
  visibilityRules = {},
  values = {},
  nativeRequiredFieldNames = [],
}) {
  const fieldMap = new Map(fields.map((field) => [field.id, field]));
  const seen = new Set();
  let total = 0;
  let filled = 0;

  const flatLayout = flattenV3LayoutToV2(coerceLayoutToV3(layout));

  panelIds.forEach((panelId) => {
    (flatLayout[panelId] || []).forEach((fieldId) => {
      if (seen.has(fieldId)) return;
      seen.add(fieldId);

      const field = fieldMap.get(fieldId);
      if (!isFieldVisible(field, { hiddenFieldIds, visibilityRules, fields, values })) return;
      if (!isFieldRequired(field, requiredFieldIds, nativeRequiredFieldNames)) return;

      total += 1;
      if (!isEmptyRequiredValue(getFieldValue(field, values), field)) filled += 1;
    });
  });

  return { total, filled, pending: Math.max(0, total - filled) };
}
