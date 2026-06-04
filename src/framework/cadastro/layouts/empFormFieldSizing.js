/**
 * Tokens legados (layout SGG). Layout corporativo usa empFormFieldWidthPresets (por tipo).
 * @returns {"xs"|"sm"|"sm-date"|"md"|"lg"|"xl"|"lookup"|"full"|"toggle"}
 */
export function resolveFieldWidthToken(field) {
  if (!field) return "md";
  if (field.width) return field.width;

  const type = String(field.type || "text").toLowerCase();

  if (type === "textarea") return "full";
  if (field.wide) return "lg";
  if (type === "checkbox" || type === "switch") return "toggle";
  if (type === "image" || type === "file" || type === "imagem") return "xs";
  if (["select", "autocomplete", "relation"].includes(type)) return "lookup";
  if (["date", "datetime", "datetime-local"].includes(type)) return "sm-date";
  if (field.compact) return "sm";
  if (field.medium) return "md";
  if (["number", "decimal", "moeda", "percentual"].includes(type)) return "sm";

  return "lg";
}

export function shouldFieldSpanFullRow(field) {
  const type = String(field?.type || "").toLowerCase();
  return type === "textarea";
}
