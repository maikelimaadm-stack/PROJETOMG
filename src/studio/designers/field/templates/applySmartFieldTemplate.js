import { getSmartFieldTemplate } from "./smartFieldTemplates.js";
import { buildFieldPresentation } from "@/studio/services/fieldPresentationAdapter.js";

/**
 * Apply a Smart Field Template to produce initial field node properties.
 * Centralized — command handlers and canvas must use this helper only.
 */
export function applySmartFieldTemplate(templateId, partial = {}) {
  const template = getSmartFieldTemplate(templateId);
  if (!template) {
    throw new Error(`Smart Field Template not found: ${templateId}`);
  }

  const d = template.defaults ?? {};
  const fieldName =
    partial.fieldName ??
    `${template.fieldNamePrefix ?? template.templateId}_${Date.now()}`.replace(/[^a-z0-9_]/gi, "_").toLowerCase();

  const node = {
    fieldType: template.fieldType,
    label: d.label ?? template.label,
    fieldName,
    required: d.required ?? false,
    readOnly: false,
    active: true,
    visibleForm: true,
    visibleTable: false,
    placeholder: d.placeholder ?? null,
    helpText: d.helpText ?? null,
    useMask: d.useMask ?? false,
    maskText: d.maskText ?? null,
    defaultValue: d.defaultValue ?? null,
    minValue: d.minValue ?? null,
    maxValue: d.maxValue ?? null,
    precision: d.precision ?? null,
    scale: d.scale ?? null,
    category: template.category ?? d.category ?? null,
    groupId: partial.groupId ?? "group.main",
    smartTemplateId: template.templateId,
    businessTypeId: null,
    icon: template.icon,
    labels: [{ locale: "pt-BR", label: d.label ?? template.label, helpText: d.helpText, description: template.documentation }],
    validationHints: d.validationHints ?? null,
  };

  node.presentation = buildFieldPresentation(node);
  return node;
}

export default applySmartFieldTemplate;
