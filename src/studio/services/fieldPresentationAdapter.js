/**
 * Field presentation adapter — single place for MDP presentation payload (Program 2.3.1)
 */
export function buildFieldPresentation(field) {
  const presentation = {
    icon: field.icon ?? null,
    category: field.category ?? null,
    smartTemplateId: field.smartTemplateId ?? null,
    businessTypeId: field.businessTypeId ?? null,
    defaultValue: field.defaultValue ?? null,
    minValue: field.minValue ?? null,
    maxValue: field.maxValue ?? null,
    precision: field.precision ?? null,
    scale: field.scale ?? null,
    groupId: field.groupId ?? null,
    validationHints: field.validationHints ?? null,
    aiReady: Boolean(field.businessTypeId),
  };
  return Object.fromEntries(Object.entries(presentation).filter(([, v]) => v != null && v !== ""));
}

export function parseFieldPresentation(presentation = {}, row = {}) {
  if (!presentation || typeof presentation !== "object") return {};
  return {
    icon: presentation.icon ?? null,
    category: presentation.category ?? null,
    smartTemplateId: presentation.smartTemplateId ?? null,
    businessTypeId: presentation.businessTypeId ?? null,
    defaultValue: presentation.defaultValue ?? null,
    minValue: presentation.minValue ?? null,
    maxValue: presentation.maxValue ?? null,
    precision: presentation.precision ?? null,
    scale: presentation.scale ?? null,
    groupId: presentation.groupId ?? row.groupId ?? null,
    validationHints: presentation.validationHints ?? null,
  };
}

export default buildFieldPresentation;
